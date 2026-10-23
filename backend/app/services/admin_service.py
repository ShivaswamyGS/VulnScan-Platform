"""
Admin service.

Provides administrator-only access to Bug Bounty Programs
and Vulnerability Submissions.

All functions operate across companies because administrators
are trusted platform-level users.
"""

from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import NotFoundError
from app.models.program import BugBountyProgram
from app.models.submission import VulnerabilitySubmission


# =========================================================
# BUG BOUNTY PROGRAMS
# =========================================================

def get_all_programs(
    db: Session,
) -> list[BugBountyProgram]:
    """
    Return all Bug Bounty Programs.

    Administrators can see programs belonging to every company.
    """

    return (
        db.query(BugBountyProgram)
        .order_by(
            BugBountyProgram.created_at.desc()
        )
        .all()
    )


def get_program_by_id(
    db: Session,
    program_id: int,
) -> BugBountyProgram:
    """
    Return any Bug Bounty Program by ID.

    No company ownership restriction is applied because
    this function is intended for administrators.
    """

    program = (
        db.query(BugBountyProgram)
        .filter(
            BugBountyProgram.id == program_id
        )
        .first()
    )

    if program is None:
        raise NotFoundError(
            "Bug Bounty Program not found"
        )

    return program


# =========================================================
# VULNERABILITY SUBMISSIONS
# =========================================================

def get_all_submissions(
    db: Session,
) -> list[VulnerabilitySubmission]:
    """
    Return all vulnerability submissions
    across all Bug Bounty Programs.
    """

    return (
        db.query(VulnerabilitySubmission)
        .options(
            joinedload(
                VulnerabilitySubmission.program
            ),
            joinedload(
                VulnerabilitySubmission.researcher
            ),
        )
        .order_by(
            VulnerabilitySubmission.submitted_at.desc()
        )
        .all()
    )


def get_submission_by_id(
    db: Session,
    submission_id: int,
) -> VulnerabilitySubmission:
    """
    Return any vulnerability submission by ID.

    Administrators can access submissions belonging
    to any company or researcher.
    """

    submission = (
        db.query(VulnerabilitySubmission)
        .options(
            joinedload(
                VulnerabilitySubmission.program
            ),
            joinedload(
                VulnerabilitySubmission.researcher
            ),
        )
        .filter(
            VulnerabilitySubmission.id
            == submission_id
        )
        .first()
    )

    if submission is None:
        raise NotFoundError(
            "Vulnerability submission not found"
        )

    return submission