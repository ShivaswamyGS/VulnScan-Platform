"""
Dataset file upload service.

Handles secure storage of administrator-uploaded NVD CSV files.
"""

from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.exceptions import ConflictError


# =========================================================
# STORAGE
# =========================================================

DATASET_UPLOAD_DIR = Path("uploads/datasets")


# =========================================================
# SAVE DATASET FILE
# =========================================================

def save_dataset_file(
    file: UploadFile,
) -> str:
    """
    Save an uploaded NVD CSV file and return its path.

    Only CSV files are accepted.
    """

    if not file.filename:
        raise ConflictError(
            "Dataset filename is required"
        )

    filename = file.filename

    if not filename.lower().endswith(".csv"):
        raise ConflictError(
            "Only CSV dataset files are supported"
        )

    # Create upload directory if it doesn't exist.
    DATASET_UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    # Remove any directory traversal components.
    safe_name = Path(filename).name

    # Generate unique filename.
    unique_name = (
        f"{uuid4().hex}_{safe_name}"
    )

    destination = (
        DATASET_UPLOAD_DIR / unique_name
    )

    try:
        with destination.open("wb") as output:

            while True:
                chunk = file.file.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                output.write(chunk)

    except Exception as exc:

        if destination.exists():
            destination.unlink()

        raise ConflictError(
            f"Unable to save dataset: {exc}"
        ) from exc

    return str(destination)