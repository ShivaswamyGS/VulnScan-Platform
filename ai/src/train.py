"""
Trains the vulnerability-severity classifier.

Usage:
    # Against a real downloaded NVD feed (recommended for the real deployment):
    python -m ai.src.train --feed dataset/raw/nvdcve-2.0-2024.json

    # Dev/demo mode (no --feed given): generates + trains on a synthetic
    # sample dataset shaped like real NVD data, so the pipeline can be
    # exercised end-to-end before real feeds are downloaded.
    python -m ai.src.train

Pipeline:
    load data -> cvss_to_severity() label -> preprocess() text ->
    train/test split -> TfidfVectorizer -> MultinomialNB ->
    evaluate -> save model.pkl + tfidf.pkl + metadata.json
"""

import argparse
import json
from datetime import datetime, timezone

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.naive_bayes import MultinomialNB

from ai.config import ARTIFACTS_DIR, MODEL_PATH, MODEL_VERSION, VECTORIZER_PATH, METADATA_PATH
from ai.src.data_loader import load_nvd_feed
from ai.src.labeling import cvss_to_severity
from ai.src.preprocessing import preprocess


def build_labeled_dataframe(feed_path: str | None) -> pd.DataFrame:
    if feed_path:
        print(f"Loading real NVD feed from {feed_path} ...")
        df = load_nvd_feed(feed_path)
    else:
        print("No --feed provided: generating a synthetic sample dataset for dev/demo purposes.")
        print("For the real deployment, download an NVD feed and pass --feed <path>.")
        from ai.src.generate_sample_dataset import generate_sample_dataset

        df = generate_sample_dataset()

    df["severity"] = df["cvss_score"].apply(cvss_to_severity)
    before = len(df)
    df = df.dropna(subset=["severity"])
    dropped = before - len(df)
    if dropped:
        print(f"Dropped {dropped} rows with out-of-band CVSS scores (e.g. 0.0).")

    print(f"Labeled dataset size: {len(df)} rows")
    print(df["severity"].value_counts())

    return df.reset_index(drop=True)


def train(feed_path: str | None = None, *, test_size: float = 0.2, random_state: int = 42) -> dict:
    df = build_labeled_dataframe(feed_path)

    print("Preprocessing text (clean -> tokenize -> remove stopwords -> lemmatize) ...")
    df["processed_text"] = df["description"].apply(preprocess)
    df = df[df["processed_text"].str.len() > 0]  # drop rows that preprocessed to nothing

    X_train, X_test, y_train, y_test = train_test_split(
        df["processed_text"], df["severity"],
        test_size=test_size, random_state=random_state, stratify=df["severity"],
    )

    print("Fitting TF-IDF vectorizer ...")
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), min_df=1)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    print("Training Multinomial Naive Bayes classifier ...")
    model = MultinomialNB()
    model.fit(X_train_vec, y_train)

    y_pred = model.predict(X_test_vec)
    accuracy = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, output_dict=True)
    cm = confusion_matrix(y_test, y_pred, labels=model.classes_).tolist()

    print(f"\nTest accuracy: {accuracy:.4f}\n")
    print(classification_report(y_test, y_pred))

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)

    metadata = {
        "model_version": MODEL_VERSION,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "training_rows": len(df),
        "test_size": test_size,
        "accuracy": accuracy,
        "classes": list(model.classes_),
        "classification_report": report,
        "confusion_matrix": cm,
        "data_source": feed_path if feed_path else "synthetic_sample (dev/demo mode)",
    }
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nSaved model      -> {MODEL_PATH}")
    print(f"Saved vectorizer -> {VECTORIZER_PATH}")
    print(f"Saved metadata   -> {METADATA_PATH}")

    return metadata


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the vulnerability severity classifier.")
    parser.add_argument("--feed", type=str, default=None, help="Path to a real NVD JSON feed file.")
    parser.add_argument("--test-size", type=float, default=0.2)
    args = parser.parse_args()
    train(feed_path=args.feed, test_size=args.test_size)


if __name__ == "__main__":
    main()
