from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_company
from app.db.session import get_db
from app.models.company import Company
from app.schemas.asset import (
    AssetCreate,
    AssetRead,
    AssetUpdate,
)
from app.services.asset_service import (
    create_asset,
    delete_asset,
    get_company_asset_by_id,
    get_company_assets,
    update_asset,
)

router = APIRouter()


# =========================================================
# LIST COMPANY ASSETS
# =========================================================

@router.get(
    "/",
    response_model=list[AssetRead],
)
def get_assets(
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    """
    Return all assets belonging to the authenticated company.
    """

    return get_company_assets(
        db,
        current_company,
    )


# =========================================================
# CREATE ASSET
# =========================================================

@router.post(
    "/",
    response_model=AssetRead,
    status_code=status.HTTP_201_CREATED,
)
def add_asset(
    asset: AssetCreate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    """
    Create a new asset for the authenticated company.
    """

    return create_asset(
        db,
        current_company,
        asset,
    )


# =========================================================
# GET ONE ASSET
# =========================================================

@router.get(
    "/{asset_id}",
    response_model=AssetRead,
)
def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    """
    Return one asset belonging to the authenticated company.
    """

    return get_company_asset_by_id(
        db,
        current_company,
        asset_id,
    )


# =========================================================
# UPDATE ASSET
# =========================================================

@router.put(
    "/{asset_id}",
    response_model=AssetRead,
)
def edit_asset(
    asset_id: int,
    data: AssetUpdate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    """
    Update an asset belonging to the authenticated company.
    """

    asset = get_company_asset_by_id(
        db,
        current_company,
        asset_id,
    )

    return update_asset(
        db,
        asset,
        data,
        current_company,
    )


# =========================================================
# DELETE ASSET
# =========================================================

@router.delete(
    "/{asset_id}",
)
def remove_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    """
    Delete an asset belonging to the authenticated company.
    """

    asset = get_company_asset_by_id(
        db,
        current_company,
        asset_id,
    )

    delete_asset(
        db,
        asset,
    )

    return {
        "message": "Asset deleted successfully"
    }