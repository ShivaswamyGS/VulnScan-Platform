"""
AI training dataset endpoints.

Administrators can:
- Register an NVD CSV dataset
- List datasets
- View a dataset
- Activate a validated dataset

Only administrators can manage training datasets.
"""
from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session
from app.services.dataset_upload_service import (
    save_dataset_file,
)
from app.api.deps import require_admin
from app.db.session import get_db
from app.models.user import User
from app.schemas.dataset import DatasetRead
from app.services.dataset_service import (
    activate_dataset,
    get_active_dataset,
    get_dataset_by_id,
    get_datasets,
    register_dataset,
)

router = APIRouter()


# =========================================================
# DELETE DATASET
# =========================================================

@router.delete(
    "/{dataset_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_training_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Delete a training dataset.

    Active datasets cannot be deleted.
    """

    delete_dataset(
        db,
        dataset_id,
    )

    return None



# =========================================================
# LIST DATASETS
# =========================================================

@router.get(
    "",
    response_model=list[DatasetRead],
)
def list_training_datasets(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return all registered training datasets.
    """

    return get_datasets(db)


# =========================================================
# UPLOAD DATASET
# =========================================================

@router.post(
    "/upload",
    response_model=DatasetRead,
    status_code=status.HTTP_201_CREATED,
)
def upload_training_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Upload and validate an NVD vulnerability dataset.
    """

    file_path = save_dataset_file(file)

    return register_dataset(
        db,
        name=file.filename or "nvd_dataset.csv",
        file_path=file_path,
    )
# =========================================================
# GET DATASET
# =========================================================

@router.get(
    "/{dataset_id}",
    response_model=DatasetRead,
)
def get_training_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return a specific training dataset.
    """

    return get_dataset_by_id(
        db,
        dataset_id,
    )


# =========================================================
# ACTIVATE DATASET
# =========================================================

@router.post(
    "/{dataset_id}/activate",
    response_model=DatasetRead,
)
def activate_training_dataset(
    dataset_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Activate a validated NVD dataset for training.
    """

    return activate_dataset(
        db,
        dataset_id,
    )


# =========================================================
# GET ACTIVE DATASET
# =========================================================

@router.get(
    "/active/current",
    response_model=DatasetRead,
)
def get_current_training_dataset(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    Return the currently active training dataset.
    """

    return get_active_dataset(db)