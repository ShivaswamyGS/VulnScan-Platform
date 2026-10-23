"""
Bug Bounty vulnerability submission endpoints.

Researchers can:
- Submit vulnerabilities to active Bug Bounty Programs
- View their own submissions
- View a specific submission
- Delete their own submissions

Companies can:
- View submissions belonging to their programs
- View a specific submission
- Review/update submission status, severity and bounty

Ownership is always verified in the service layer.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import (
    get_current_company,
    get_current_user,
)
from app.core.exceptions import ForbiddenError
from app.db.session import get_db
from app.models.company import Company
from app.models.enums import RoleEnum
from app.models.submission import VulnerabilitySubmission
from app.models.user import User
from app.schemas.submission import (
    SubmissionCreate,
    SubmissionRead,
    SubmissionUpdate,
)
from app.services.notification_service import create_notification
from app.services.submission_service import (
    create_submission,
    delete_submission,
    get_company_submission_by_id,
    get_company_submissions,
    get_researcher_submission_by_id,
    get_researcher_submissions,
    update_submission,
)

router = APIRouter()


# =========================================================
# RESEARCHER — CREATE SUBMISSION
# =========================================================

@router.post(
    "/programs/{program_id}",
    response_model=SubmissionRead,
    status_code=status.HTTP_201_CREATED,
)
def submit_vulnerability(
    program_id: int,
    data: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submit a vulnerability to an active Bug Bounty Program.

    Only Internal Testers can submit vulnerabilities.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can submit vulnerabilities"
        )

    return create_submission(
        db,
        current_user,
        program_id,
        data,
    )


# =========================================================
# RESEARCHER — LIST OWN SUBMISSIONS
# =========================================================

@router.get(
    "/mine",
    response_model=list[SubmissionRead],
)
def get_my_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return only submissions created by the authenticated
    researcher.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can view researcher submissions"
        )

    return get_researcher_submissions(
        db,
        current_user,
    )


# =========================================================
# RESEARCHER — GET OWN SUBMISSION
# =========================================================

@router.get(
    "/mine/{submission_id}",
    response_model=SubmissionRead,
)
def get_my_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Return a submission only if it belongs to the
    authenticated researcher.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can access researcher submissions"
        )

    return get_researcher_submission_by_id(
        db,
        current_user,
        submission_id,
    )


# =========================================================
# RESEARCHER — DELETE OWN SUBMISSION
# =========================================================

@router.delete(
    "/mine/{submission_id}",
)
def remove_my_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a submission belonging to the authenticated
    researcher.
    """

    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can delete submissions"
        )

    submission = get_researcher_submission_by_id(
        db,
        current_user,
        submission_id,
    )

    delete_submission(
        db,
        submission,
    )

    return {
        "message": "Submission deleted successfully"
    }


# =========================================================
# COMPANY — LIST SUBMISSIONS
# =========================================================

@router.get(
    "/company",
    response_model=list[SubmissionRead],
)
def get_company_submission_list(
    db: Session = Depends(get_db),
    current_company: Company = Depends(
        get_current_company
    ),
):
    """
    Return submissions belonging only to the
    authenticated company's Bug Bounty Programs.
    """

    return get_company_submissions(
        db,
        current_company,
    )


# =========================================================
# COMPANY — GET SUBMISSION
# =========================================================

@router.get(
    "/company/{submission_id}",
    response_model=SubmissionRead,
)
def get_company_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(
        get_current_company
    ),
):
    """
    Return a submission only if its Bug Bounty Program
    belongs to the authenticated company.
    """

    return get_company_submission_by_id(
        db,
        current_company,
        submission_id,
    )


# =========================================================
# COMPANY — REVIEW SUBMISSION
# =========================================================

@router.put(
    "/company/{submission_id}",
    response_model=SubmissionRead,
)
def review_submission(
    submission_id: int,
    data: SubmissionUpdate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(
        get_current_company
    ),
):
    """
    Company reviews a vulnerability submission.

    Supported changes:
    - status
    - severity
    - bounty amount
    - reviewer comment

    The researcher is notified after the review.
    """

    submission = get_company_submission_by_id(
        db,
        current_company,
        submission_id,
    )

    # -----------------------------------------------------
    # UPDATE SUBMISSION
    # -----------------------------------------------------

    submission = update_submission(
        db,
        submission,
        data,
    )

    # -----------------------------------------------------
    # NOTIFY RESEARCHER
    # -----------------------------------------------------

    create_notification(
        db,
        user_id=submission.researcher_id,
        title="Bug Bounty Submission Updated",
        message=(
            f"Your vulnerability submission "
            f"'{submission.title}' has been updated "
            f"by the company."
        ),
        notification_type="submission_update",
        entity_type="submission",
        entity_id=submission.id,
    )

    return submission