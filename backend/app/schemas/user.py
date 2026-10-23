"""
Pydantic schemas for User.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.enums import RoleEnum


# =========================================================
# USER BASE
# =========================================================

class UserBase(BaseModel):
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=150,
    )

    email: EmailStr


# =========================================================
# USER CREATE
# =========================================================

class UserCreate(UserBase):
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )

    role: RoleEnum = RoleEnum.INTERNAL_TESTER


# =========================================================
# USER UPDATE
# =========================================================

class UserUpdate(BaseModel):
    full_name: str | None = Field(
        None,
        min_length=2,
        max_length=150,
    )

    is_active: bool | None = None

    role: RoleEnum | None = None


# =========================================================
# USER READ
# =========================================================

class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int

    role: RoleEnum

    is_active: bool

    department: str | None = None

    designation: str | None = None

    employee_id: str | None = None

    created_at: datetime


# =========================================================
# COMPANY EMPLOYEE CREATE
# =========================================================

class CompanyEmployeeCreate(BaseModel):
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=150,
    )

    email: EmailStr

    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
    )

    department: str | None = Field(
        None,
        max_length=100,
    )

    designation: str | None = Field(
        None,
        max_length=100,
    )

    employee_id: str | None = Field(
        None,
        max_length=50,
    )


# =========================================================
# COMPANY EMPLOYEE UPDATE
# =========================================================

class CompanyEmployeeUpdate(BaseModel):
    full_name: str | None = Field(
        None,
        min_length=2,
        max_length=150,
    )

    department: str | None = Field(
        None,
        max_length=100,
    )

    designation: str | None = Field(
        None,
        max_length=100,
    )

    employee_id: str | None = Field(
        None,
        max_length=50,
    )

    is_active: bool | None = None