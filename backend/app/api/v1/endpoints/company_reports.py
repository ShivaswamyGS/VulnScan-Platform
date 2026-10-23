from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_company
from app.db.session import get_db
from app.models.company import Company
from app.schemas.company_report import (
    CompanyReportRead,
    CompanyReportUpdate,
)
from app.services.company_report_service import (
    get_company_report_by_id,
    get_company_reports,
    update_company_report,
)

router = APIRouter()


@router.get(
    "",
    response_model=list[CompanyReportRead],
)
def get_reports(
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    """
    Return all vulnerability reports belonging
    to the authenticated company.
    """

    return get_company_reports(
        db,
        current_company,
    )


@router.get(
    "/{report_id}",
    response_model=CompanyReportRead,
)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    """
    Get a report belonging to the authenticated company.

    The service layer performs the company ownership check.
    """

    return get_company_report_by_id(
        db,
        current_company,
        report_id,
    )


@router.put(
    "/{report_id}",
    response_model=CompanyReportRead,
)
def update_report(
    report_id: int,
    data: CompanyReportUpdate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    """
    Update status/priority of a company-owned report.

    Company ownership is verified inside the service layer.
    """

    return update_company_report(
        db,
        current_company,
        report_id,
        data,
    )