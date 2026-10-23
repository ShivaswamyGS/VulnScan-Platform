from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.asset import Asset
from app.models.company import Company
from app.schemas.asset import AssetCreate, AssetUpdate
from app.services.project_service import get_project_by_id


# =========================================================
# GET ALL COMPANY ASSETS
# =========================================================

def get_company_assets(
    db: Session,
    company: Company,
):
    """
    Return all assets belonging to the authenticated company.
    """

    return (
        db.query(Asset)
        .filter(
            Asset.company_id == company.id
        )
        .order_by(
            Asset.created_at.desc()
        )
        .all()
    )


# =========================================================
# GET ONE COMPANY ASSET
# =========================================================

def get_company_asset_by_id(
    db: Session,
    company: Company,
    asset_id: int,
):
    """
    Return one asset belonging to the authenticated company.
    """

    asset = (
        db.query(Asset)
        .filter(
            Asset.id == asset_id,
            Asset.company_id == company.id,
        )
        .first()
    )

    if asset is None:
        raise NotFoundError("Asset not found")

    return asset


# =========================================================
# CREATE ASSET
# =========================================================

def create_asset(
    db: Session,
    company: Company,
    data: AssetCreate,
):
    """
    Create a new asset for the authenticated company.

    If project_id is provided, verify that the project
    belongs to the same company.
    """

    if data.project_id is not None:
        get_project_by_id(
            db,
            data.project_id,
            company,
        )

    asset = Asset(
        name=data.name,
        asset_type=data.asset_type,
        value=data.value,
        status=data.status,
        project_id=data.project_id,
        company_id=company.id,
    )

    db.add(asset)
    db.commit()
    db.refresh(asset)

    return asset


# =========================================================
# UPDATE ASSET
# =========================================================

def update_asset(
    db: Session,
    asset: Asset,
    data: AssetUpdate,
    company: Company,
):
    """
    Update an existing company asset.

    If project_id is changed, verify that the new project
    belongs to the authenticated company.
    """

    update_data = data.model_dump(
        exclude_unset=True
    )

    if (
        "project_id" in update_data
        and update_data["project_id"] is not None
    ):
        get_project_by_id(
            db,
            update_data["project_id"],
            company,
        )

    for key, value in update_data.items():
        setattr(
            asset,
            key,
            value,
        )

    db.commit()
    db.refresh(asset)

    return asset


# =========================================================
# DELETE ASSET
# =========================================================

def delete_asset(
    db: Session,
    asset: Asset,
):
    """
    Delete an asset.
    """

    db.delete(asset)
    db.commit()