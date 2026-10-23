from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CompanyBase(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    website: str | None = None
    industry: str | None = None
    country: str | None = None
    phone: str | None = None


class CompanyCreate(CompanyBase):
    password: str = Field(..., min_length=8, max_length=128)


class CompanyLogin(BaseModel):
    email: EmailStr
    password: str


class CompanyUpdate(BaseModel):
    company_name: str | None = None
    website: str | None = None
    industry: str | None = None
    country: str | None = None
    phone: str | None = None
    logo: str | None = None


class CompanyRead(CompanyBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    logo: str | None
    is_active: bool
    created_at: datetime