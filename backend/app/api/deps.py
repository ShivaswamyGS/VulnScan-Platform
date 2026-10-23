"""
Shared FastAPI dependencies used across endpoint modules.

- get_current_user: decodes the JWT, loads the user, verifies it's still active
- require_role(...): dependency factory for role-based authorization
- get_current_company: authenticates and loads the currently logged-in company

Internal users and companies use separate OAuth2 schemes because they have
different login endpoints.
"""

from collections.abc import Callable

from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.db.session import get_db
from app.models.company import Company
from app.models.enums import RoleEnum
from app.models.user import User
from app.services.company_service import get_company_by_id
from app.services.user_service import get_user_by_id


# =========================================================
# INTERNAL USER AUTHENTICATION
# =========================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login",
    scheme_name="InternalUserOAuth2"
)

company_oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/company/login",
    scheme_name="CompanyOAuth2"
)

# =========================================================
# CURRENT INTERNAL USER
# =========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:

    try:
        payload = decode_token(token)

    except JWTError:
        raise UnauthorizedError(
            "Could not validate credentials"
        )

    if payload.get("type") != "access":
        raise UnauthorizedError(
            "Invalid token type; an access token is required"
        )

    user_id = payload.get("sub")

    if user_id is None:
        raise UnauthorizedError(
            "Could not validate credentials"
        )

    user = get_user_by_id(
        db,
        int(user_id),
    )

    if user is None or not user.is_active:
        raise UnauthorizedError(
            "User not found or inactive"
        )

    return user


# =========================================================
# ROLE-BASED AUTHORIZATION
# =========================================================

def require_role(
    *allowed_roles: RoleEnum,
) -> Callable[[User], User]:
    """
    Dependency factory for role-based authorization.

    Example:

        Depends(require_role(RoleEnum.ADMIN))

    or:

        Depends(
            require_role(
                RoleEnum.ADMIN,
                RoleEnum.INTERNAL_TESTER,
            )
        )
    """

    def dependency(
        current_user: User = Depends(get_current_user),
    ) -> User:

        if current_user.role not in allowed_roles:
            raise ForbiddenError(
                "You do not have permission to perform this action"
            )

        return current_user

    return dependency


require_admin = require_role(
    RoleEnum.ADMIN
)

require_any_authenticated = require_role(
    RoleEnum.ADMIN,
    RoleEnum.INTERNAL_TESTER,
)


# =========================================================
# CLIENT IP
# =========================================================

def get_client_ip(
    request: Request,
) -> str | None:
    """
    Best-effort client IP extraction.

    Respects X-Forwarded-For when the application is behind
    a reverse proxy.
    """

    forwarded = request.headers.get(
        "x-forwarded-for"
    )

    if forwarded:
        return forwarded.split(",")[0].strip()

    return request.client.host if request.client else None


# =========================================================
# CURRENT COMPANY
# =========================================================

def get_current_company(
    token: str = Depends(company_oauth2_scheme),
    db: Session = Depends(get_db),
) -> Company:
    """
    Returns the currently authenticated company.

    Company tokens must:
    - be valid JWT access tokens
    - have type = access
    - have role = company
    - contain a valid company ID in sub

    Company must also be:
    - active
    - approved by an administrator
    """

    try:
        payload = decode_token(token)

    except JWTError:
        raise UnauthorizedError(
            "Could not validate credentials"
        )

    # -----------------------------------------------------
    # Make sure this is an access token
    # -----------------------------------------------------

    if payload.get("type") != "access":
        raise UnauthorizedError(
            "Invalid access token"
        )

    # -----------------------------------------------------
    # Make sure this token belongs to a company
    # -----------------------------------------------------

    if payload.get("role") != "company":
        raise UnauthorizedError(
            "Company authentication required"
        )

    # -----------------------------------------------------
    # Get company ID from token
    # -----------------------------------------------------

    company_id = payload.get("sub")

    if company_id is None:
        raise UnauthorizedError(
            "Invalid token"
        )

    # -----------------------------------------------------
    # Load company
    # -----------------------------------------------------

    company = get_company_by_id(
        db,
        int(company_id),
    )

    if company is None:
        raise UnauthorizedError(
            "Company not found"
        )

    # -----------------------------------------------------
    # Check active status
    # -----------------------------------------------------

    if not company.is_active:
        raise UnauthorizedError(
            "Company account is inactive"
        )

    # -----------------------------------------------------
    # CHECK ADMIN APPROVAL
    # -----------------------------------------------------

    if company.approval_status == "pending":
        raise UnauthorizedError(
            "Company registration is pending administrator approval"
        )

    if company.approval_status == "rejected":

        if company.approval_reason:
            raise UnauthorizedError(
                f"Company registration was rejected: "
                f"{company.approval_reason}"
            )

        raise UnauthorizedError(
            "Company registration was rejected"
        )

    if company.approval_status != "approved":
        raise UnauthorizedError(
            "Company registration is not approved"
        )

    return company