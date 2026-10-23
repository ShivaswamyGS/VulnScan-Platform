from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_company
from app.db.session import get_db
from app.models.company import Company
from app.schemas.company import CompanyRead, CompanyUpdate
from app.schemas.dashboard import CompanyDashboardStats
from app.services.company_service import (
    get_dashboard_stats,
    update_company,
)

router = APIRouter()


# =========================================================
# COMPANY — GET OWN PROFILE
# =========================================================

@router.get(
    "/me",
    response_model=CompanyRead,
)
def get_my_company_profile(
    current_company: Company = Depends(
        get_current_company
    ),
):
    """
    Return the authenticated company's profile.
    """
    return current_company


# =========================================================
# COMPANY — UPDATE OWN PROFILE
# =========================================================

@router.put(
    "/me",
    response_model=CompanyRead,
)
def update_my_company_profile(
    data: CompanyUpdate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    """
    Update the authenticated company's own profile.
    """
    return update_company(
        db,
        current_company,
        data,
    )


# =========================================================
# COMPANY — UPDATE PROFILE
# =========================================================

@router.put(
    "/profile",
    response_model=CompanyRead,
)
def update_profile(
    company_data: CompanyUpdate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    """
    Update the authenticated company's profile.
    """
    return update_company(
        db=db,
        company=current_company,
        data=company_data,
    )


# =========================================================
# COMPANY DASHBOARD
# =========================================================

@router.get(
    "/dashboard",
    response_model=CompanyDashboardStats,
)
def company_dashboard(
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    return get_dashboard_stats(
        db=db,
        company_id=current_company.id,
    )