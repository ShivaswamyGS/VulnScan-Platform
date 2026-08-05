"""
Central configuration for the AI module.

Kept deliberately dependency-free (no pydantic-settings, no FastAPI) since
this module must run standalone — from a notebook, a cron job, or a CI
training pipeline — without needing the backend installed.
"""

from pathlib import Path

# --- Directory layout ---
AI_ROOT = Path(__file__).resolve().parent                 # .../vulnscan-platform/ai
PROJECT_ROOT = AI_ROOT.parent                              # .../vulnscan-platform
DATASET_DIR = PROJECT_ROOT / "dataset"
ARTIFACTS_DIR = AI_ROOT / "artifacts"

RAW_NVD_DIR = DATASET_DIR / "raw"
PROCESSED_DIR = DATASET_DIR / "processed"

MODEL_PATH = ARTIFACTS_DIR / "model.pkl"
VECTORIZER_PATH = ARTIFACTS_DIR / "tfidf.pkl"
METADATA_PATH = ARTIFACTS_DIR / "metadata.json"

# --- CVSS score -> severity label mapping (matches project spec exactly) ---
# Ordered from highest to lowest; used by labeling.cvss_to_severity()
CVSS_SEVERITY_BANDS = [
    (9.0, 10.0, "Critical"),
    (7.0, 8.9, "High"),
    (4.0, 6.9, "Medium"),
    (0.1, 3.9, "Low"),
]

MODEL_VERSION = "nb-tfidf-v1"

# --- NLTK data ---
# Downloaded into a project-local directory (not the user's home dir) so the
# training environment is self-contained and reproducible in CI/Docker.
NLTK_DATA_DIR = AI_ROOT / ".nltk_data"
