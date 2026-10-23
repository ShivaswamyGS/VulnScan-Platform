from datetime import datetime

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
)

from app.models.enums import RoleEnum


class EmployeeBase(BaseModel):
    full_name: str = Field(
        ...,
        min_length=2,
        max_length=150,
    )

    email: EmailStr

    department: str

    designation: str

    employee_id: str


class EmployeeCreate(EmployeeBase):
    password: str = Field(
        ...,
        min_length=8,
    )

    # Kept for frontend compatibility.
    # The backend will ALWAYS create the user
    # as INTERNAL_TESTER.
    role: RoleEnum = RoleEnum.INTERNAL_TESTER


class EmployeeUpdate(BaseModel):
    full_name: str | None = None

    department: str | None = None

    designation: str | None = None

    role: RoleEnum | None = None

    is_active: bool | None = None


class EmployeeRead(EmployeeBase):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int

    role: RoleEnum

    is_active: bool

    created_at: datetime