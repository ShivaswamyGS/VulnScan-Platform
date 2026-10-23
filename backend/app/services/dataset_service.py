"""
Dataset management service.

Handles validation and registration of administrator-uploaded
NVD vulnerability datasets.

The service does not create synthetic training data.
Only the uploaded dataset is used as the training source.
"""

from pathlib import Path

import pandas as pd
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.models.dataset import TrainingDataset


# =========================================================
# REQUIRED NVD COLUMNS
# =========================================================

REQUIRED_COLUMNS = {
    "cve_id",
    "description",
    "cvss_score",
    "cvss_version",
    "cvss_vector",
    "severity",
    "cwe",
    "published_date",
    "last_modified_date",
}


# =========================================================
# VALIDATE DATASET
# =========================================================

def validate_nvd_dataset(
    file_path: str,
) -> tuple[int, str]:
    """
    Validate an NVD CSV dataset.

    Returns:
        (record_count, validation_message)
    """

    path = Path(file_path)

    if not path.exists():
        raise NotFoundError(
            "Dataset file not found"
        )

    if path.suffix.lower() != ".csv":
        raise ConflictError(
            "Only CSV datasets are supported"
        )

    try:
        dataframe = pd.read_csv(path)
    except Exception as exc:
        raise ConflictError(
            f"Unable to read dataset: {exc}"
        )

    columns = set(dataframe.columns)

    missing_columns = REQUIRED_COLUMNS - columns

    if missing_columns:
        raise ConflictError(
            "Invalid NVD dataset. Missing columns: "
            + ", ".join(sorted(missing_columns))
        )

    if dataframe.empty:
        raise ConflictError(
            "Dataset contains no records"
        )

    # CVE identifier must exist.
    if dataframe["cve_id"].isna().all():
        raise ConflictError(
            "Dataset does not contain valid CVE identifiers"
        )

    # Description is required for model training.
    if dataframe["description"].isna().all():
        raise ConflictError(
            "Dataset does not contain vulnerability descriptions"
        )

    # Severity is the target label for the current model.
    if dataframe["severity"].isna().all():
        raise ConflictError(
            "Dataset does not contain severity labels"
        )

    record_count = len(dataframe)

    return (
        record_count,
        "NVD dataset validated successfully",
    )


# =========================================================
# REGISTER DATASET
# =========================================================

def register_dataset(
    db: Session,
    *,
    name: str,
    file_path: str,
) -> TrainingDataset:
    """
    Validate and register an uploaded NVD dataset.
    """

    record_count, validation_message = (
        validate_nvd_dataset(file_path)
    )

    dataset = TrainingDataset(
        name=name,
        file_path=file_path,
        dataset_type="nvd",
        record_count=record_count,
        validation_status="valid",
        validation_message=validation_message,
        is_active=False,
    )

    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    return dataset


# =========================================================
# LIST DATASETS
# =========================================================

def get_datasets(
    db: Session,
) -> list[TrainingDataset]:
    """
    Return all registered training datasets.
    """

    return (
        db.query(TrainingDataset)
        .order_by(
            TrainingDataset.uploaded_at.desc()
        )
        .all()
    )


# =========================================================
# GET DATASET
# =========================================================

def get_dataset_by_id(
    db: Session,
    dataset_id: int,
) -> TrainingDataset:
    """
    Return a training dataset by ID.
    """

    dataset = (
        db.query(TrainingDataset)
        .filter(
            TrainingDataset.id == dataset_id
        )
        .first()
    )

    if dataset is None:
        raise NotFoundError(
            "Training dataset not found"
        )

    return dataset


# =========================================================
# ACTIVATE DATASET
# =========================================================

def activate_dataset(
    db: Session,
    dataset_id: int,
) -> TrainingDataset:
    """
    Mark one validated dataset as the active
    dataset for model training.

    Only one dataset can be active at a time.
    """

    dataset = get_dataset_by_id(
        db,
        dataset_id,
    )

    if dataset.validation_status != "valid":
        raise ConflictError(
            "Only a valid dataset can be activated"
        )

    (
        db.query(TrainingDataset)
        .filter(
            TrainingDataset.id != dataset.id
        )
        .update(
            {
                TrainingDataset.is_active: False
            },
            synchronize_session=False,
        )
    )

    dataset.is_active = True

    db.commit()
    db.refresh(dataset)

    return dataset


# =========================================================
# GET ACTIVE DATASET
# =========================================================

def get_active_dataset(
    db: Session,
) -> TrainingDataset:
    """
    Return the currently active training dataset.
    """

    dataset = (
        db.query(TrainingDataset)
        .filter(
            TrainingDataset.is_active.is_(True),
            TrainingDataset.validation_status == "valid",
        )
        .first()
    )

    if dataset is None:
        raise NotFoundError(
            "No active training dataset found"
        )

    return dataset


# =========================================================
# DELETE DATASET
# =========================================================

def delete_dataset(
    db: Session,
    dataset_id: int,
) -> None:
    """
    Delete a training dataset and its uploaded file.
    """

    dataset = get_dataset_by_id(
        db,
        dataset_id,
    )

    if dataset.is_active:
        raise ConflictError(
            "Cannot delete the active training dataset. "
            "Activate another dataset first."
        )

    file_path = Path(dataset.file_path)

    db.delete(dataset)
    db.commit()

    if file_path.exists():
        try:
            file_path.unlink()
        except OSError:
            pass