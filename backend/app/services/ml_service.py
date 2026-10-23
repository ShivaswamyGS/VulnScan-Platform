"""
ML inference service.

Loads the trained model and TF-IDF vectorizers once per process
and reuses them for predictions.

Artifacts:
    ai/artifacts/model.pkl
    ai/artifacts/tfidf.pkl
    ai/artifacts/metadata.json

The trained model uses:
    Word TF-IDF
    +
    Character TF-IDF

Character TF-IDF is weighted by 0.75 before combining.

The trained classifier is LinearSVC, so confidence is derived
from the decision function instead of predict_proba().
"""

from __future__ import annotations

import json
import logging
import sys
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
from scipy.sparse import hstack

from app.core.config import settings


# =========================================================
# AI MODULE IMPORT
# =========================================================

# Project structure:
#
# vulnscan-platform/
# ├── backend/
# │   └── app/
# └── ai/
#
# ml_service.py is inside:
# backend/app/services/
#
# Therefore parents[3] points to the project root.

_PROJECT_ROOT = Path(__file__).resolve().parents[3]

if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from ai.src.preprocessing import preprocess  # noqa: E402


logger = logging.getLogger(__name__)


# =========================================================
# CONSTANTS
# =========================================================

CHAR_WEIGHT = 0.75

EXPECTED_WORD_FEATURES = 25000
EXPECTED_CHAR_FEATURES = 40000
EXPECTED_TOTAL_FEATURES = 65000


# =========================================================
# EXCEPTIONS
# =========================================================

class MLServiceError(Exception):
    """
    Raised when ML artifacts cannot be loaded or
    prediction cannot be performed.
    """


# =========================================================
# PREDICTION RESULT
# =========================================================

class PredictionResult:
    """
    Result returned by the ML inference pipeline.
    """

    def __init__(
        self,
        severity: str,
        confidence: float,
        explanation: str,
        model_version: str,
    ):
        self.severity = severity
        self.confidence = confidence
        self.explanation = explanation
        self.model_version = model_version


# =========================================================
# LOAD ARTIFACTS
# =========================================================

@lru_cache(maxsize=1)
def _load_artifacts():
    """
    Load the trained model and TF-IDF vectorizers once.

    tfidf.pkl contains a dictionary:

        {
            "word": TfidfVectorizer(...),
            "char": TfidfVectorizer(...)
        }
    """

    try:
        model = joblib.load(settings.ML_MODEL_PATH)

        vectorizer = joblib.load(
            settings.ML_VECTORIZER_PATH
        )

        # -------------------------------------------------
        # Validate vectorizer structure
        # -------------------------------------------------

        if not isinstance(vectorizer, dict):
            raise MLServiceError(
                "Invalid TF-IDF artifact. "
                "Expected a dictionary containing "
                "'word' and 'char' vectorizers."
            )

        if "word" not in vectorizer:
            raise MLServiceError(
                "TF-IDF artifact is missing the 'word' vectorizer."
            )

        if "char" not in vectorizer:
            raise MLServiceError(
                "TF-IDF artifact is missing the 'char' vectorizer."
            )

        word_vectorizer = vectorizer["word"]
        char_vectorizer = vectorizer["char"]

        # -------------------------------------------------
        # Validate feature counts
        # -------------------------------------------------

        word_features = len(
            word_vectorizer.get_feature_names_out()
        )

        char_features = len(
            char_vectorizer.get_feature_names_out()
        )

        total_features = word_features + char_features

        logger.info(
            "Loaded ML artifacts: model=%s vectorizer=%s",
            settings.ML_MODEL_PATH,
            settings.ML_VECTORIZER_PATH,
        )

        logger.info(
            "TF-IDF features: word=%s char=%s total=%s",
            word_features,
            char_features,
            total_features,
        )

        if total_features != EXPECTED_TOTAL_FEATURES:
            logger.warning(
                "Expected %s total features but loaded %s.",
                EXPECTED_TOTAL_FEATURES,
                total_features,
            )

        return model, vectorizer

    except FileNotFoundError as exc:
        raise MLServiceError(
            "ML model artifacts were not found. "
            "Check ML_MODEL_PATH and ML_VECTORIZER_PATH."
        ) from exc

    except MLServiceError:
        raise

    except Exception as exc:
        raise MLServiceError(
            f"Unable to load ML artifacts: {exc}"
        ) from exc


# =========================================================
# MODEL VERSION
# =========================================================

def _resolve_model_version() -> str:
    """
    Read model_version from metadata.json.

    Falls back to the model filename if metadata is unavailable.
    """

    metadata_path = (
        Path(settings.ML_MODEL_PATH).parent
        / "metadata.json"
    )

    try:
        with metadata_path.open(
            "r",
            encoding="utf-8",
        ) as file:
            metadata = json.load(file)

        return str(
            metadata.get(
                "model_version",
                "unknown",
            )
        )

    except FileNotFoundError:
        return Path(
            settings.ML_MODEL_PATH
        ).stem

    except Exception as exc:
        logger.warning(
            "Unable to read model metadata: %s",
            exc,
        )

        return Path(
            settings.ML_MODEL_PATH
        ).stem


# =========================================================
# CONFIDENCE
# =========================================================

def _calculate_confidence(
    model,
    feature_vector,
    predicted_class,
) -> float:
    """
    Calculate a confidence-like score for LinearSVC.

    LinearSVC does not provide predict_proba().

    Therefore we use decision_function() and convert the
    class decision scores into a normalized softmax score.

    This is NOT a calibrated probability. It is a confidence
    score derived from the classifier's decision margins.
    """

    try:
        decision_scores = model.decision_function(
            feature_vector
        )

        scores = np.asarray(
            decision_scores,
            dtype=float,
        )

        # -------------------------------------------------
        # Multiclass LinearSVC
        # -------------------------------------------------

        if scores.ndim == 2:
            scores = scores[0]

            # Stable softmax
            shifted = scores - np.max(scores)

            exp_scores = np.exp(shifted)

            probabilities = (
                exp_scores / np.sum(exp_scores)
            )

            class_index = list(
                model.classes_
            ).index(predicted_class)

            return float(
                probabilities[class_index]
            )

        # -------------------------------------------------
        # Binary LinearSVC fallback
        # -------------------------------------------------

        score = float(
            np.ravel(scores)[0]
        )

        probability = (
            1.0 /
            (1.0 + np.exp(-abs(score)))
        )

        return float(probability)

    except Exception as exc:
        logger.warning(
            "Unable to calculate LinearSVC confidence: %s",
            exc,
        )

        return 0.0


# =========================================================
# EXPLANATION
# =========================================================

def _build_explanation(
    vectorizers,
    model,
    feature_vector,
    predicted_class,
    top_n: int = 5,
) -> str:
    """
    Generate a human-readable explanation for a LinearSVC
    prediction using model coefficients.

    The model uses:

        Word TF-IDF + Character TF-IDF

    LinearSVC does not expose feature_log_prob_ or
    predict_proba(), so explanation is generated from
    model.coef_.
    """

    try:
        # -------------------------------------------------
        # Get individual vectorizers
        # -------------------------------------------------

        word_vectorizer = vectorizers["word"]
        char_vectorizer = vectorizers["char"]

        word_feature_names = (
            word_vectorizer
            .get_feature_names_out()
        )

        char_feature_names = (
            char_vectorizer
            .get_feature_names_out()
        )

        # Combined feature names must match the same
        # order used by hstack().
        feature_names = np.concatenate(
            [
                word_feature_names,
                char_feature_names,
            ]
        )

        # -------------------------------------------------
        # Verify LinearSVC coefficients
        # -------------------------------------------------

        if not hasattr(model, "coef_"):
            return (
                "Prediction explanation is unavailable "
                "because the model does not expose coefficients."
            )

        # -------------------------------------------------
        # Determine class index
        # -------------------------------------------------

        try:
            class_index = list(
                model.classes_
            ).index(predicted_class)

        except ValueError:
            return (
                "Prediction explanation is unavailable "
                "for the predicted class."
            )

        # -------------------------------------------------
        # Get coefficients
        # -------------------------------------------------

        coefficients = np.asarray(
            model.coef_[class_index]
        ).ravel()

        # -------------------------------------------------
        # Get non-zero input features
        # -------------------------------------------------

        nonzero_indices = (
            feature_vector
            .nonzero()[1]
        )

        if len(nonzero_indices) == 0:
            return (
                "No significant terms were found "
                "to explain this prediction."
            )

        # -------------------------------------------------
        # Calculate feature contribution
        # -------------------------------------------------

        scored_terms = []

        for index in nonzero_indices:

            if index >= len(coefficients):
                continue

            if index >= len(feature_names):
                continue

            value = float(
                feature_vector[0, index]
            )

            coefficient = float(
                coefficients[index]
            )

            contribution = (
                coefficient * value
            )

            scored_terms.append(
                (
                    feature_names[index],
                    contribution,
                )
            )

        if not scored_terms:
            return (
                "No significant terms were found "
                "to explain this prediction."
            )

        # -------------------------------------------------
        # Strongest positive contributions first
        # -------------------------------------------------

        positive_terms = [
            (term, score)
            for term, score in scored_terms
            if score > 0
        ]

        positive_terms.sort(
            key=lambda item: item[1],
            reverse=True,
        )

        top_terms = [
            term
            for term, _ in positive_terms[:top_n]
        ]

        # -------------------------------------------------
        # Fallback: strongest absolute contributions
        # -------------------------------------------------

        if not top_terms:

            scored_terms.sort(
                key=lambda item: abs(item[1]),
                reverse=True,
            )

            top_terms = [
                term
                for term, _ in scored_terms[:top_n]
            ]

        if not top_terms:
            return (
                "No significant terms were found "
                "to explain this prediction."
            )

        return (
            "Key contributing terms: "
            + ", ".join(top_terms)
        )

    except Exception as exc:
        logger.warning(
            "Unable to build prediction explanation: %s",
            exc,
        )

        return (
            "Prediction explanation is unavailable."
        )


# =========================================================
# BUILD FEATURE VECTOR
# =========================================================

def _transform_text(
    processed: str,
    vectorizer,
):
    """
    Transform processed report text using the exact
    Word TF-IDF + Character TF-IDF configuration used
    during training.
    """

    try:
        # -------------------------------------------------
        # The saved TF-IDF artifact is a dictionary.
        # -------------------------------------------------

        if not isinstance(vectorizer, dict):
            raise MLServiceError(
                "Invalid TF-IDF vectorizer artifact. "
                "Expected a dictionary."
            )

        if "word" not in vectorizer:
            raise MLServiceError(
                "TF-IDF vectorizer is missing 'word'."
            )

        if "char" not in vectorizer:
            raise MLServiceError(
                "TF-IDF vectorizer is missing 'char'."
            )

        word_vectorizer = vectorizer["word"]
        char_vectorizer = vectorizer["char"]

        # -------------------------------------------------
        # Word TF-IDF
        # -------------------------------------------------

        word_vector = (
            word_vectorizer.transform(
                [processed]
            )
        )

        # -------------------------------------------------
        # Character TF-IDF
        # -------------------------------------------------

        char_vector = (
            char_vectorizer.transform(
                [processed]
            )
        )

        # -------------------------------------------------
        # Apply trained character weight
        # -------------------------------------------------

        weighted_char_vector = (
            char_vector.multiply(
                CHAR_WEIGHT
            )
        )

        # -------------------------------------------------
        # Combine
        #
        # 25,000 word features
        # +
        # 40,000 character features
        # =
        # 65,000 total features
        # -------------------------------------------------

        feature_vector = hstack(
            [
                word_vector,
                weighted_char_vector,
            ],
            format="csr",
        )

        logger.debug(
            "Feature vector shape: %s",
            feature_vector.shape,
        )

        # -------------------------------------------------
        # Validate model input dimension
        # -------------------------------------------------

        if feature_vector.shape[1] != EXPECTED_TOTAL_FEATURES:

            logger.warning(
                "Feature vector has %s features; "
                "model expects %s.",
                feature_vector.shape[1],
                EXPECTED_TOTAL_FEATURES,
            )

        return feature_vector

    except MLServiceError:
        raise

    except Exception as exc:
        logger.exception(
            "TF-IDF transformation failed"
        )

        raise MLServiceError(
            f"Unable to transform report text: {exc}"
        ) from exc


# =========================================================
# PREDICT SEVERITY
# =========================================================

def predict_severity(
    text: str,
) -> PredictionResult:
    """
    Run the complete ML inference pipeline.

    Pipeline:

        raw report text
              ↓
        preprocessing
              ↓
        word TF-IDF
              +
        character TF-IDF
              ↓
        character weight 0.75
              ↓
        combined 65,000 features
              ↓
        LinearSVC
              ↓
        severity
              ↓
        confidence
              ↓
        explanation
              ↓
        model version
    """

    # =====================================================
    # VALIDATE INPUT
    # =====================================================

    if not text or not text.strip():
        raise MLServiceError(
            "Report text is empty."
        )

    # =====================================================
    # LOAD MODEL
    # =====================================================

    try:
        model, vectorizer = _load_artifacts()

    except MLServiceError:
        raise

    # =====================================================
    # PREPROCESS
    # =====================================================

    try:
        processed = preprocess(text)

    except Exception as exc:
        logger.exception(
            "Text preprocessing failed"
        )

        raise MLServiceError(
            f"Unable to preprocess report text: {exc}"
        ) from exc

    if not processed:
        raise MLServiceError(
            "Report text could not be processed "
            "(empty after cleaning). "
            "Provide a more detailed description."
        )

    # =====================================================
    # TF-IDF TRANSFORMATION
    # =====================================================

    feature_vector = _transform_text(
        processed,
        vectorizer,
    )

    # =====================================================
    # MODEL PREDICTION
    # =====================================================

    try:
        predicted_class = (
            model.predict(
                feature_vector
            )[0]
        )

    except Exception as exc:
        logger.exception(
            "ML prediction failed"
        )

        raise MLServiceError(
            f"Unable to generate prediction: {exc}"
        ) from exc

    # =====================================================
    # CONFIDENCE
    # =====================================================

    confidence = _calculate_confidence(
        model=model,
        feature_vector=feature_vector,
        predicted_class=predicted_class,
    )

    # =====================================================
    # EXPLANATION
    # =====================================================

    explanation = _build_explanation(
        vectorizers=vectorizer,
        model=model,
        feature_vector=feature_vector,
        predicted_class=predicted_class,
    )

    # =====================================================
    # MODEL VERSION
    # =====================================================

    model_version = (
        _resolve_model_version()
    )

    # =====================================================
    # RETURN RESULT
    # =====================================================

    return PredictionResult(
        severity=str(
            predicted_class
        ),
        confidence=round(
            confidence,
            4,
        ),
        explanation=explanation,
        model_version=model_version,
    )
    
def predict_submission_severity(
    title: str,
    description: str,
    vulnerability_type: str,
    impact: str,
) -> str:
    """
    Predict severity for a Bug Bounty vulnerability submission
    using the existing trained ML model.
    """

    text = " ".join(
        [
            title or "",
            description or "",
            vulnerability_type or "",
            impact or "",
        ]
    ).strip()

    if not text:
        raise MLServiceError(
            "Submission data is empty. Cannot predict severity."
        )

    result = predict_severity(text)

    return result.severity.lower()