"""
Company Authentication Endpoints
"""

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.company import CompanyCreate, CompanyRead
from app.schemas.token import Token
from app.services.company_auth_service import (
    login_company,
    register_company,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=CompanyRead,
    status_code=status.HTTP_201_CREATED,
)
def register(
    company: CompanyCreate,
    db: Session = Depends(get_db),
):
    return register_company(db, company)


@router.post(
    "/login",
    response_model=Token,
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    return login_company(
        db,
        email=form_data.username,
        password=form_data.password,
    )