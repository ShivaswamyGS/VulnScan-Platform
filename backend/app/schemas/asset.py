"""
Pydantic schemas for Company Assets.

Assets represent company-owned security targets such as:

- Domains
- Websites
- APIs
- Applications
- Servers
- Other security-related resources
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# BASE
# =========================================================

class AssetBase(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=200,
    )

    asset_type: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    value: str = Field(
        ...,
        min_length=1,
        max_length=500,
    )

    status: str = Field(
        default="Active",
        max_length=50,
    )

    project_id: int | None = None


# =========================================================
# CREATE
# =========================================================

class AssetCreate(AssetBase):
    """
    Schema used when creating an asset.
    """

    pass


# =========================================================
# UPDATE
# =========================================================

class AssetUpdate(BaseModel):
    """
    Schema used when updating an existing asset.

    All fields are optional so that individual
    asset properties can be changed.
    """

    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=200,
    )

    asset_type: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    value: str | None = Field(
        default=None,
        min_length=1,
        max_length=500,
    )

    status: str | None = Field(
        default=None,
        max_length=50,
    )

    project_id: int | None = None


# =========================================================
# READ
# =========================================================

class AssetRead(AssetBase):
    """
    Schema returned to the frontend/client.
    """

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )