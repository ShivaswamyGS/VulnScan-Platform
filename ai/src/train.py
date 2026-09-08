"""
Train the vulnerability-severity classifier.

Usage:

    python -m src.train --feed .\dataset\raw\nvd-2024-2026.json

Pipeline:

    NVD JSON
        ->
    CVSS score -> severity label
        ->
    NLP preprocessing
        ->
    Train / validation / test split
        ->
    Word TF-IDF + Character TF-IDF
        ->
    Linear SVM model selection
        ->
    Final evaluation
        ->
    Save model + vectorizers + metadata
"""

import argparse
import json
from datetime import datetime, timezone

import joblib
import pandas as pd

from scipy.sparse import hstack

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC


from ai.config import (
    ARTIFACTS_DIR,
    MODEL_PATH,
    MODEL_VERSION,
    VECTORIZER_PATH,
    METADATA_PATH,
)

from ai.src.data_loader import load_nvd_feed
from ai.src.labeling import cvss_to_severity
from ai.src.preprocessing import preprocess


# ============================================================
# DATA LOADING + LABELING
# ============================================================

def build_labeled_dataframe(
    feed_path: str,
) -> pd.DataFrame:

    if not feed_path:
        raise ValueError(
            "A real NVD dataset is required."
        )

    print(
        f"Loading real NVD feed from {feed_path} ..."
    )

    df = load_nvd_feed(feed_path)

    # Convert CVSS score into:
    # Low / Medium / High / Critical
    df["severity"] = df["cvss_score"].apply(
        cvss_to_severity
    )

    before = len(df)

    # Remove records without a valid severity
    df = df.dropna(
        subset=["severity"]
    )

    dropped = before - len(df)

    if dropped:
        print(
            f"Dropped {dropped} rows with "
            f"out-of-band CVSS scores."
        )

    print(
        f"\nLabeled dataset size: "
        f"{len(df)} rows"
    )

    print("\nSeverity distribution:")

    print(
        df["severity"].value_counts()
    )

    return df.reset_index(
        drop=True
    )


# ============================================================
# TRAIN
# ============================================================

def train(
    feed_path: str,
    *,
    test_size: float = 0.20,
    random_state: int = 42,
) -> dict:

    # --------------------------------------------------------
    # 1. LOAD DATA
    # --------------------------------------------------------

    df = build_labeled_dataframe(
        feed_path
    )

    # --------------------------------------------------------
    # 2. PREPROCESS TEXT
    # --------------------------------------------------------

    print(
        "\nPreprocessing text "
        "(clean -> tokenize -> stopwords -> lemmatize) ..."
    )

    df["processed_text"] = (
        df["description"]
        .fillna("")
        .apply(preprocess)
    )

    # Remove empty processed documents
    df = df[
        df["processed_text"].notna()
        & (
            df["processed_text"]
            .str.strip()
            .str.len()
            > 0
        )
    ]

    print(
        f"Usable records after preprocessing: "
        f"{len(df)}"
    )

    # --------------------------------------------------------
    # 3. INITIAL TRAIN / TEST SPLIT
    # --------------------------------------------------------

    X = df["processed_text"]
    y = df["severity"]

    print(
        "\nCreating train/test split..."
    )

    X_train_full, X_test, y_train_full, y_test = (
        train_test_split(
            X,
            y,
            test_size=test_size,
            random_state=random_state,
            stratify=y,
        )
    )

    # --------------------------------------------------------
    # 4. TRAIN / VALIDATION SPLIT
    # --------------------------------------------------------

    print(
        "Creating validation split..."
    )

    X_train, X_val, y_train, y_val = (
        train_test_split(
            X_train_full,
            y_train_full,
            test_size=0.20,
            random_state=random_state,
            stratify=y_train_full,
        )
    )

    print(
        f"\nTraining samples:   {len(X_train)}"
    )

    print(
        f"Validation samples: {len(X_val)}"
    )

    print(
        f"Test samples:       {len(X_test)}"
    )

    # ========================================================
    # 5. WORD TF-IDF
    # ========================================================

    print(
        "\n=============================================="
    )

    print(
        "Fitting WORD TF-IDF vectorizer..."
    )

    print(
        "=============================================="
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

    X_val_word = (
        word_vectorizer
        .transform(X_val)
    )

    X_test_word = (
        word_vectorizer
        .transform(X_test)
    )

    print(
        f"Word features: "
        f"{X_train_word.shape[1]}"
    )

    # ========================================================
    # 6. CHARACTER TF-IDF
    # ========================================================

    print(
        "\n=============================================="
    )

    print(
        "Fitting CHARACTER TF-IDF vectorizer..."
    )

    print(
        "=============================================="
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

    X_val_char = (
        char_vectorizer
        .transform(X_val)
    )

    X_test_char = (
        char_vectorizer
        .transform(X_test)
    )

    print(
        f"Character features: "
        f"{X_train_char.shape[1]}"
    )

    # ========================================================
    # 7. MODEL SEARCH
    # ========================================================

    print(
        "\n=============================================="
    )

    print(
        "SEARCHING FOR BEST MODEL..."
    )

    print(
        "=============================================="
    )

    # C controls SVM regularization.
    #
    # char_weight controls how strongly
    # character features influence the model.

    configs = [

        # C = 0.25
        (0.25, 0.25),
        (0.25, 0.50),
        (0.25, 0.75),
        (0.25, 1.00),

        # C = 0.50
        (0.50, 0.25),
        (0.50, 0.50),
        (0.50, 0.75),
        (0.50, 1.00),

        # C = 1
        (1.00, 0.25),
        (1.00, 0.50),
        (1.00, 0.75),
        (1.00, 1.00),

        # C = 1.5
        (1.50, 0.25),
        (1.50, 0.50),
        (1.50, 0.75),
        (1.50, 1.00),

        # C = 2
        (2.00, 0.25),
        (2.00, 0.50),
        (2.00, 0.75),
        (2.00, 1.00),

        # C = 3
        (3.00, 0.25),
        (3.00, 0.50),
        (3.00, 0.75),
        (3.00, 1.00),

        # C = 4
        (4.00, 0.25),
        (4.00, 0.50),
        (4.00, 0.75),
        (4.00, 1.00),

        # C = 6
        (6.00, 0.50),
        (6.00, 0.75),
        (6.00, 1.00),

        # C = 8
        (8.00, 0.50),
        (8.00, 0.75),
        (8.00, 1.00),
    ]

    best_accuracy = 0.0
    best_config = None

    # --------------------------------------------------------
    # Test configurations
    # --------------------------------------------------------

    for C, char_weight in configs:

        print(
            f"\nTesting "
            f"C={C}, "
            f"char_weight={char_weight}"
        )

        # Combine word + character features
        X_train_combined = hstack(
            [
                X_train_word,
                X_train_char * char_weight,
            ]
        ).tocsr()

        X_val_combined = hstack(
            [
                X_val_word,
                X_val_char * char_weight,
            ]
        ).tocsr()

        # Linear SVM
        model = LinearSVC(
            C=C,
            class_weight=None,
            max_iter=10000,
            random_state=random_state,
        )

        model.fit(
            X_train_combined,
            y_train,
        )

        # Validation prediction
        val_pred = model.predict(
            X_val_combined
        )

        val_accuracy = accuracy_score(
            y_val,
            val_pred,
        )

        print(
            f"Validation accuracy: "
            f"{val_accuracy * 100:.2f}%"
        )

        # Save best configuration
        if val_accuracy > best_accuracy:

            best_accuracy = (
                val_accuracy
            )

            best_config = {
                "C": C,
                "char_weight": char_weight,
            }

    # --------------------------------------------------------
    # Best configuration
    # --------------------------------------------------------

    print(
        "\n=============================================="
    )

    print(
        "BEST CONFIGURATION"
    )

    print(
        "=============================================="
    )

    print(
        f"C: "
        f"{best_config['C']}"
    )

    print(
        f"Character weight: "
        f"{best_config['char_weight']}"
    )

    print(
        f"Validation accuracy: "
        f"{best_accuracy * 100:.2f}%"
    )

    # ========================================================
    # 8. FINAL TRAINING
    # ========================================================

    print(
        "\n=============================================="
    )

    print(
        "TRAINING FINAL MODEL..."
    )

    print(
        "=============================================="
    )

    char_weight = (
        best_config["char_weight"]
    )

    # IMPORTANT:
    #
    # Use the complete original training set
    # (train + validation) for final training.
    #
    # We must refit vectorizers on the complete
    # training data so the validation data is
    # not wasted.

    print(
        "\nRefitting vectorizers on complete "
        "training data..."
    )

    final_word_vectorizer = (
        TfidfVectorizer(
            max_features=25000,
            ngram_range=(1, 3),
            min_df=2,
            max_df=0.98,
            sublinear_tf=True,
            strip_accents="unicode",
        )
    )

    final_char_vectorizer = (
        TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 6),
            min_df=2,
            max_features=40000,
            sublinear_tf=True,
        )
    )

    X_train_word_final = (
        final_word_vectorizer
        .fit_transform(X_train_full)
    )

    X_test_word_final = (
        final_word_vectorizer
        .transform(X_test)
    )

    X_train_char_final = (
        final_char_vectorizer
        .fit_transform(X_train_full)
    )

    X_test_char_final = (
        final_char_vectorizer
        .transform(X_test)
    )

    # Combine final features
    X_train_final = hstack(
        [
            X_train_word_final,
            X_train_char_final
            * char_weight,
        ]
    ).tocsr()

    X_test_final = hstack(
        [
            X_test_word_final,
            X_test_char_final
            * char_weight,
        ]
    ).tocsr()

    print(
        f"Final feature count: "
        f"{X_train_final.shape[1]}"
    )

    # --------------------------------------------------------
    # Final model
    # --------------------------------------------------------

    final_model = LinearSVC(
        C=best_config["C"],
        class_weight=None,
        max_iter=10000,
        random_state=random_state,
    )

    print(
        "\nFitting final LinearSVC..."
    )

    final_model.fit(
        X_train_final,
        y_train_full,
    )

    # ========================================================
    # 9. FINAL TEST
    # ========================================================

    print(
        "\n=============================================="
    )

    print(
        "FINAL TESTING"
    )

    print(
        "=============================================="
    )

    y_pred = final_model.predict(
        X_test_final
    )

    accuracy = accuracy_score(
        y_test,
        y_pred,
    )

    report = classification_report(
        y_test,
        y_pred,
        output_dict=True,
        zero_division=0,
    )

    cm = confusion_matrix(
        y_test,
        y_pred,
        labels=final_model.classes_,
    )

    # ========================================================
    # PRINT RESULTS
    # ========================================================

    print(
        "\n=============================================="
    )

    print(
        f"FINAL ACCURACY: "
        f"{accuracy * 100:.2f}%"
    )

    print(
        "=============================================="
    )

    print(
        "\nClassification Report:"
    )

    print(
        classification_report(
            y_test,
            y_pred,
            zero_division=0,
        )
    )

    print(
        "\nConfusion Matrix:"
    )

    print(cm)

    # ========================================================
    # 10. SAVE ARTIFACTS
    # ========================================================

    ARTIFACTS_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    print(
        "\nSaving model..."
    )

    joblib.dump(
        final_model,
        MODEL_PATH,
    )

    # Save both vectorizers
    vectorizer_bundle = {
        "word": final_word_vectorizer,
        "char": final_char_vectorizer,
        "char_weight": char_weight,
    }

    joblib.dump(
        vectorizer_bundle,
        VECTORIZER_PATH,
    )

    # ========================================================
    # 11. SAVE METADATA
    # ========================================================

    metadata = {

        "model_version":
            MODEL_VERSION,

        "algorithm":
            "LinearSVC",

        "feature_method":
            "Word TF-IDF + Character TF-IDF",

        "trained_at":
            datetime.now(
                timezone.utc
            ).isoformat(),

        "training_rows":
            len(X_train_full),

        "validation_rows":
            len(X_val),

        "test_rows":
            len(X_test),

        "test_size":
            test_size,

        "validation_accuracy":
            best_accuracy,

        "accuracy":
            accuracy,

        "accuracy_percent":
            round(
                accuracy * 100,
                2,
            ),

        "classes":
            list(
                final_model.classes_
            ),

        "classification_report":
            report,

        "confusion_matrix":
            cm.tolist(),

        "data_source":
            feed_path,

        "best_configuration":
            best_config,

        "word_vectorizer":
            {
                "max_features": 25000,
                "ngram_range": [1, 3],
                "min_df": 2,
                "max_df": 0.98,
                "sublinear_tf": True,
            },

        "character_vectorizer":
            {
                "analyzer": "char_wb",
                "ngram_range": [3, 6],
                "min_df": 2,
                "max_features": 40000,
                "sublinear_tf": True,
            },
    }

    with open(
        METADATA_PATH,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            metadata,
            f,
            indent=2,
        )

    # ========================================================
    # 12. COMPLETE
    # ========================================================

    print(
        "\n=============================================="
    )

    print(
        "MODEL TRAINING COMPLETE"
    )

    print(
        "=============================================="
    )

    print(
        f"\nSaved model:"
        f"\n{MODEL_PATH}"
    )

    print(
        f"\nSaved vectorizers:"
        f"\n{VECTORIZER_PATH}"
    )

    print(
        f"\nSaved metadata:"
        f"\n{METADATA_PATH}"
    )

    print(
        f"\nFinal accuracy: "
        f"{accuracy * 100:.2f}%"
    )

    return metadata


# ============================================================
# COMMAND LINE
# ============================================================

def main() -> None:

    parser = argparse.ArgumentParser(
        description=(
            "Train the vulnerability "
            "severity classifier."
        )
    )

    parser.add_argument(
        "--feed",
        type=str,
        required=True,
        help=(
            "Path to real NVD JSON feed."
        ),
    )

    parser.add_argument(
        "--test-size",
        type=float,
        default=0.20,
        help=(
            "Fraction of data reserved "
            "for final testing."
        ),
    )

    args = parser.parse_args()

    train(
        feed_path=args.feed,
        test_size=args.test_size,
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":
    main()