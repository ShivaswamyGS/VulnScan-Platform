"""
Machine-learning training service.

Trains the vulnerability-severity classifier using the currently
active NVD dataset.

Pipeline:

dataset
    -> preprocessing
    -> Word TF-IDF
    -> Character TF-IDF
    -> weighted feature combination
    -> LinearSVC
    -> evaluation
    -> save model.pkl
    -> save tfidf.pkl
    -> save metadata.json
    -> TrainingHistory
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
import pandas as pd
from scipy.sparse import hstack

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import ConflictError
from app.models.training_history import TrainingHistory
from app.services.dataset_service import get_active_dataset

from ai.src.preprocessing import preprocess


# =========================================================
# MODEL STORAGE
# =========================================================

MODEL_PATH = Path(settings.ML_MODEL_PATH)
VECTORIZER_PATH = Path(settings.ML_VECTORIZER_PATH)

ARTIFACTS_DIR = MODEL_PATH.parent
METADATA_PATH = ARTIFACTS_DIR / "metadata.json"

ARTIFACTS_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# =========================================================
# TRAIN MODEL
# =========================================================

def train_severity_model(
    db: Session,
) -> TrainingHistory:
    """
    Train the vulnerability-severity model using the
    currently active NVD dataset.
    """

    # -----------------------------------------------------
    # GET ACTIVE DATASET
    # -----------------------------------------------------

    dataset = get_active_dataset(db)

    dataset_path = Path(dataset.file_path)

    if not dataset_path.exists():
        raise ConflictError(
            "Active dataset file does not exist"
        )

    # -----------------------------------------------------
    # CREATE TRAINING HISTORY
    # -----------------------------------------------------

    version = (
        "linear-svc-tfidf-"
        + datetime.now(timezone.utc).strftime(
            "%Y%m%d%H%M%S"
        )
    )

    history = TrainingHistory(
        dataset_id=dataset.id,
        model_version=version,
        status="running",
        record_count=0,
        started_at=datetime.now(timezone.utc),
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    try:

        # =================================================
        # 1. LOAD DATASET
        # =================================================

        dataframe = pd.read_csv(dataset_path)

        required_columns = {
            "description",
            "severity",
        }

        missing_columns = (
            required_columns
            - set(dataframe.columns)
        )

        if missing_columns:
            raise ConflictError(
                "Training dataset is missing required "
                "columns: "
                + ", ".join(sorted(missing_columns))
            )

        dataframe = dataframe[
            [
                "description",
                "severity",
            ]
        ].copy()

        # =================================================
        # 2. CLEAN RAW DATA
        # =================================================

        dataframe["description"] = (
            dataframe["description"]
            .fillna("")
            .astype(str)
            .str.strip()
        )

        dataframe["severity"] = (
            dataframe["severity"]
            .fillna("")
            .astype(str)
            .str.strip()
            .str.lower()
        )

        # Remove empty descriptions/severity labels

        dataframe = dataframe[
            (dataframe["description"] != "")
            & (dataframe["severity"] != "")
        ].copy()

        if len(dataframe) < 10:
            raise ConflictError(
                "Not enough usable training records"
            )

        # =================================================
        # 3. PREPROCESS TEXT
        # =================================================

        print(
            "\nPreprocessing vulnerability descriptions..."
        )

        dataframe["processed_text"] = (
            dataframe["description"]
            .apply(preprocess)
        )

        dataframe = dataframe[
            dataframe["processed_text"]
            .str.strip()
            != ""
        ].copy()

        if len(dataframe) < 10:
            raise ConflictError(
                "Not enough usable text after preprocessing"
            )

        # =================================================
        # 4. VALIDATE CLASSES
        # =================================================

        class_counts = (
            dataframe["severity"]
            .value_counts()
        )

        if len(class_counts) < 2:
            raise ConflictError(
                "Training dataset must contain at least "
                "two severity classes"
            )

        if class_counts.min() < 2:
            raise ConflictError(
                "Each severity class must contain at least "
                "two records"
            )

        # =================================================
        # 5. TRAIN / TEST SPLIT
        # =================================================

        X = dataframe["processed_text"]
        y = dataframe["severity"]

        (
            X_train,
            X_test,
            y_train,
            y_test,
        ) = train_test_split(
            X,
            y,
            test_size=0.20,
            random_state=42,
            stratify=y,
        )

        print(
            f"\nTraining records: {len(X_train)}"
        )

        print(
            f"Testing records: {len(X_test)}"
        )

        # =================================================
        # 6. WORD TF-IDF
        # =================================================

        print(
            "\nFitting WORD TF-IDF..."
        )

        word_vectorizer = TfidfVectorizer(
            max_features=25000,
            ngram_range=(1, 3),
            min_df=2,
            max_df=0.98,
            sublinear_tf=True,
            strip_accents="unicode",
        )

        X_train_word = (
            word_vectorizer
            .fit_transform(X_train)
        )

        X_test_word = (
            word_vectorizer
            .transform(X_test)
        )

        print(
            f"Word features: "
            f"{X_train_word.shape[1]}"
        )

        # =================================================
        # 7. CHARACTER TF-IDF
        # =================================================

        print(
            "\nFitting CHARACTER TF-IDF..."
        )

        char_vectorizer = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 6),
            min_df=2,
            max_features=40000,
            sublinear_tf=True,
        )

        X_train_char = (
            char_vectorizer
            .fit_transform(X_train)
        )

        X_test_char = (
            char_vectorizer
            .transform(X_test)
        )

        print(
            f"Character features: "
            f"{X_train_char.shape[1]}"
        )

        # =================================================
        # 8. COMBINE FEATURES
        # =================================================

        char_weight = 0.75

        X_train_combined = hstack(
            [
                X_train_word,
                X_train_char * char_weight,
            ]
        ).tocsr()

        X_test_combined = hstack(
            [
                X_test_word,
                X_test_char * char_weight,
            ]
        ).tocsr()

        print(
            f"\nTotal features: "
            f"{X_train_combined.shape[1]}"
        )

        # =================================================
        # 9. TRAIN LINEAR SVC
        # =================================================

        print(
            "\nTraining LinearSVC..."
        )

        classifier = LinearSVC(
            C=1.0,
            class_weight=None,
            max_iter=10000,
            random_state=42,
        )

        classifier.fit(
            X_train_combined,
            y_train,
        )

        # =================================================
        # 10. PREDICTION
        # =================================================

        predictions = classifier.predict(
            X_test_combined
        )

        # =================================================
        # 11. METRICS
        # =================================================

        accuracy = accuracy_score(
            y_test,
            predictions,
        )

        precision = precision_score(
            y_test,
            predictions,
            average="weighted",
            zero_division=0,
        )

        recall = recall_score(
            y_test,
            predictions,
            average="weighted",
            zero_division=0,
        )

        f1 = f1_score(
            y_test,
            predictions,
            average="weighted",
            zero_division=0,
        )

        print("\n================================")
        print("MODEL TRAINING COMPLETE")
        print("================================")

        print(
            f"Accuracy : {accuracy * 100:.2f}%"
        )

        print(
            f"Precision: {precision * 100:.2f}%"
        )

        print(
            f"Recall   : {recall * 100:.2f}%"
        )

        print(
            f"F1 Score : {f1 * 100:.2f}%"
        )

        # =================================================
        # 12. SAVE MODEL
        # =================================================

        joblib.dump(
            classifier,
            MODEL_PATH,
        )

        # IMPORTANT:
        # ml_service.py expects a dictionary containing
        # both "word" and "char" vectorizers.

        vectorizer_bundle = {
            "word": word_vectorizer,
            "char": char_vectorizer,
            "char_weight": char_weight,
        }

        joblib.dump(
            vectorizer_bundle,
            VECTORIZER_PATH,
        )

        # =================================================
        # 13. SAVE METADATA
        # =================================================

        metadata = {
            "model_version": version,
            "algorithm": "LinearSVC",
            "feature_method": (
                "Word TF-IDF + Character TF-IDF"
            ),
            "trained_at": datetime.now(
                timezone.utc
            ).isoformat(),
            "training_rows": len(X_train),
            "test_rows": len(X_test),
            "test_size": 0.20,
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "classes": [
                str(value)
                for value in classifier.classes_
            ],
            "data_source": str(dataset_path),
            "char_weight": char_weight,
            "word_vectorizer": {
                "max_features": 25000,
                "ngram_range": [1, 3],
                "min_df": 2,
                "max_df": 0.98,
                "sublinear_tf": True,
                "strip_accents": "unicode",
            },
            "character_vectorizer": {
                "analyzer": "char_wb",
                "ngram_range": [3, 6],
                "min_df": 2,
                "max_features": 40000,
                "sublinear_tf": True,
            },
        }

        with METADATA_PATH.open(
            "w",
            encoding="utf-8",
        ) as metadata_file:

            json.dump(
                metadata,
                metadata_file,
                indent=2,
            )

        # =================================================
        # 14. UPDATE TRAINING HISTORY
        # =================================================

        history.status = "completed"

        history.record_count = len(
            dataframe
        )

        history.accuracy = float(
            accuracy
        )

        history.precision = float(
            precision
        )

        history.recall = float(
            recall
        )

        history.f1_score = float(
            f1
        )

        history.model_path = str(
            MODEL_PATH
        )

        history.completed_at = (
            datetime.now(timezone.utc)
        )

        db.commit()
        db.refresh(history)

        return history

    except Exception as exc:

        # =================================================
        # TRAINING FAILURE
        # =================================================

        db.rollback()

        history.status = "failed"

        history.error_message = str(
            exc
        )

        history.completed_at = (
            datetime.now(timezone.utc)
        )

        db.add(history)

        db.commit()
        db.refresh(history)

        raise