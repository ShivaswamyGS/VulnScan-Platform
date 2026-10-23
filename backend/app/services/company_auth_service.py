from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    verify_password,
)
from app.models.company import Company
from app.schemas.company import CompanyCreate
from app.schemas.token import Token
from app.services.company_service import (
    create_company,
    get_company_by_email,
)


def register_company(
    db: Session,
    company: CompanyCreate,
):
    # ---------------------------------------------------------
    # DUPLICATE EMAIL
    # ---------------------------------------------------------

    if get_company_by_email(db, company.email):
        raise ConflictError(
            "A company with this email already exists"
        )

    # ---------------------------------------------------------
    # DUPLICATE COMPANY NAME
    # ---------------------------------------------------------

    existing_company = (
        db.query(Company)
        .filter(
            Company.company_name == company.company_name
        )
        .first()
    )

    if existing_company:
        raise ConflictError(
            "A company with this name already exists"
        )

    # ---------------------------------------------------------
    # NEW COMPANIES START AS PENDING
    # ---------------------------------------------------------

    return create_company(db, company)


def login_company(
    db: Session,
    email: str,
    password: str,
) -> Token:

    # ---------------------------------------------------------
    # FIND COMPANY
    # ---------------------------------------------------------

    company = get_company_by_email(
        db,
        email,
    )

    if company is None:
        raise UnauthorizedError(
            "Invalid email or password"
        )

    # ---------------------------------------------------------
    # PASSWORD
    # ---------------------------------------------------------

    if not verify_password(
        password,
        company.hashed_password,
    ):
        raise UnauthorizedError(
            "Invalid email or password"
        )

    # ---------------------------------------------------------
    # ACTIVE STATUS
    # ---------------------------------------------------------

    if not company.is_active:
        raise UnauthorizedError(
            "Company account is inactive"
        )

    # ---------------------------------------------------------
    # NORMALIZE APPROVAL STATUS
    # ---------------------------------------------------------

    approval_status = company.approval_status

    # Support both:
    #   "approved"
    # and
    #   CompanyApprovalStatus.APPROVED

    if hasattr(approval_status, "value"):
        approval_status = approval_status.value

    if approval_status is not None:
        approval_status = str(approval_status).lower()

    # ---------------------------------------------------------
    # PENDING
    # ---------------------------------------------------------

    if approval_status == "pending":
        raise UnauthorizedError(
            "Your company account is waiting for administrator approval"
        )

    # ---------------------------------------------------------
    # REJECTED
    # ---------------------------------------------------------

    if approval_status == "rejected":

        if company.approval_reason:
            raise UnauthorizedError(
                f"Your company registration was rejected: "
                f"{company.approval_reason}"
            )

        raise UnauthorizedError(
            "Your company registration was rejected"
        )

    # ---------------------------------------------------------
    # SUSPENDED
    # ---------------------------------------------------------

    if approval_status == "suspended":
        raise UnauthorizedError(
            "Your company account has been suspended"
        )

    # ---------------------------------------------------------
    # MUST BE APPROVED
    # ---------------------------------------------------------

    if approval_status != "approved":
        raise UnauthorizedError(
            "Your company account is not approved"
        )

    # ---------------------------------------------------------
    # LOGIN SUCCESS
    # ---------------------------------------------------------

    return Token(
        access_token=create_access_token(
            subject=str(company.id),
            role="company",
        ),
        refresh_token=create_refresh_token(
            subject=str(company.id),
        ),
    )