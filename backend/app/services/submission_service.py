from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.company import Company
from app.models.program import BugBountyProgram
from app.models.submission import VulnerabilitySubmission
from app.models.user import User
from app.schemas.submission import SubmissionCreate, SubmissionUpdate
from app.services.ml_service import predict_severity


# =========================================================
# HELPER
# =========================================================

def normalize_text(value: str) -> str:
    """
    Normalize text for duplicate detection.
    """
    return " ".join(value.lower().strip().split())


# =========================================================
# RESEARCHER — CREATE SUBMISSION
# =========================================================

def create_submission(
    db: Session,
    researcher: User,
    program_id: int,
    data: SubmissionCreate,
) -> VulnerabilitySubmission:

    # -----------------------------------------------------
    # VERIFY PROGRAM
    # -----------------------------------------------------

    program = (
        db.query(BugBountyProgram)
        .filter(
            BugBountyProgram.id == program_id,
            BugBountyProgram.status == "active",
            BugBountyProgram.visibility == "public",
            BugBountyProgram.is_active.is_(True),
        )
        .first()
    )

    if program is None:
        raise NotFoundError(
            "Bug Bounty Program not found or is not currently available"
        )

    # -----------------------------------------------------
    # DUPLICATE DETECTION
    # -----------------------------------------------------

    existing_submissions = (
        db.query(VulnerabilitySubmission)
        .filter(
            VulnerabilitySubmission.program_id == program.id,
        )
        .order_by(
            VulnerabilitySubmission.submitted_at.asc()
        )
        .all()
    )

    duplicate_submission = None

    normalized_title = normalize_text(data.title)
    normalized_description = normalize_text(data.description)
    normalized_asset = normalize_text(data.affected_asset)
    normalized_type = normalize_text(data.vulnerability_type)

    for existing in existing_submissions:

        # Same vulnerability type
        if (
            normalize_text(existing.vulnerability_type)
            != normalized_type
        ):
            continue

        # Same affected asset
        if (
            normalize_text(existing.affected_asset)
            != normalized_asset
        ):
            continue

        same_title = (
            normalize_text(existing.title)
            == normalized_title
        )

        same_description = (
            normalize_text(existing.description)
            == normalized_description
        )

        if same_title or same_description:
            duplicate_submission = existing
            break

    # -----------------------------------------------------
    # AI TRIAGE
    # -----------------------------------------------------

    if duplicate_submission:

        # Duplicate submissions are automatically rejected.
        status_value = "rejected"

        reviewer_comment = (
            f"Automatically rejected as duplicate of "
            f"submission #{duplicate_submission.id}."
        )

        duplicate_of_id = duplicate_submission.id

        # No need to run AI for an obvious duplicate.
        predicted_severity = None

    else:

        # -------------------------------------------------
        # BUILD INPUT FOR TRAINED ML MODEL
        # -------------------------------------------------

        inference_text = " ".join(
            [
                data.title or "",
                data.description or "",
                data.vulnerability_type or "",
                data.affected_asset or "",
                data.steps_to_reproduce or "",
                data.impact or "",
                data.remediation or "",
            ]
        ).strip()

        # -------------------------------------------------
        # USE TRAINED MODEL
        # -------------------------------------------------

        prediction_result = predict_severity(
            inference_text
        )

        # Support the PredictionResult object returned
        # by ml_service.py.
        predicted_severity = (
            prediction_result.severity.lower()
        )

        print(
            "[AI] Submission severity prediction:"
        )
        print(
            f"[AI] Severity: {predicted_severity}"
        )

        if hasattr(prediction_result, "confidence"):
            print(
                f"[AI] Confidence: "
                f"{prediction_result.confidence}"
            )

        if hasattr(prediction_result, "model_version"):
            print(
                f"[AI] Model: "
                f"{prediction_result.model_version}"
            )

        # -------------------------------------------------
        # AUTOMATIC STATUS
        # -------------------------------------------------

        status_value = "triaged"

        reviewer_comment = (
            "Submission automatically triaged by AI. "
            "Severity was predicted using the trained "
            "vulnerability classification model."
        )

        duplicate_of_id = None

    # -----------------------------------------------------
    # CREATE SUBMISSION
    # -----------------------------------------------------

    submission = VulnerabilitySubmission(
        program_id=program.id,
        researcher_id=researcher.id,

        title=data.title,
        description=data.description,
        vulnerability_type=data.vulnerability_type,
        affected_asset=data.affected_asset,
        steps_to_reproduce=data.steps_to_reproduce,
        proof_of_concept=data.proof_of_concept,
        impact=data.impact,
        remediation=data.remediation,
        attachment_path=data.attachment_path,

        # AI-generated severity
        severity=predicted_severity,

        # Submission status
        status=status_value,

        reviewer_comment=reviewer_comment,
        duplicate_of_id=duplicate_of_id,
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return submission


# =========================================================
# RESEARCHER — LIST OWN SUBMISSIONS
# =========================================================

def get_researcher_submissions(
    db: Session,
    researcher: User,
) -> list[VulnerabilitySubmission]:

    return (
        db.query(VulnerabilitySubmission)
        .filter(
            VulnerabilitySubmission.researcher_id
            == researcher.id
        )
        .order_by(
            VulnerabilitySubmission.submitted_at.desc()
        )
        .all()
    )


# =========================================================
# RESEARCHER — GET OWN SUBMISSION
# =========================================================

def get_researcher_submission_by_id(
    db: Session,
    researcher: User,
    submission_id: int,
) -> VulnerabilitySubmission:

    submission = (
        db.query(VulnerabilitySubmission)
        .filter(
            VulnerabilitySubmission.id == submission_id,
            VulnerabilitySubmission.researcher_id
            == researcher.id,
        )
        .first()
    )

    if submission is None:
        raise NotFoundError(
            "Submission not found"
        )

    return submission


# =========================================================
# RESEARCHER — DELETE SUBMISSION
# =========================================================

def delete_submission(
    db: Session,
    submission: VulnerabilitySubmission,
) -> None:

    db.delete(submission)
    db.commit()


# =========================================================
# COMPANY — LIST SUBMISSIONS
# =========================================================

def get_company_submissions(
    db: Session,
    company: Company,
) -> list[VulnerabilitySubmission]:

    return (
        db.query(VulnerabilitySubmission)
        .join(
            BugBountyProgram,
            VulnerabilitySubmission.program_id
            == BugBountyProgram.id,
        )
        .filter(
            BugBountyProgram.company_id == company.id
        )
        .order_by(
            VulnerabilitySubmission.submitted_at.desc()
        )
        .all()
    )


# =========================================================
# COMPANY — GET SUBMISSION
# =========================================================

def get_company_submission_by_id(
    db: Session,
    company: Company,
    submission_id: int,
) -> VulnerabilitySubmission:

    submission = (
        db.query(VulnerabilitySubmission)
        .join(
            BugBountyProgram,
            VulnerabilitySubmission.program_id
            == BugBountyProgram.id,
        )
        .filter(
            VulnerabilitySubmission.id == submission_id,
            BugBountyProgram.company_id == company.id,
        )
        .first()
    )

    if submission is None:
        raise NotFoundError(
            "Submission not found"
        )

    return submission


# =========================================================
# COMPANY — UPDATE SUBMISSION
# =========================================================

def update_submission(
    db: Session,
    submission: VulnerabilitySubmission,
    data: SubmissionUpdate,
) -> VulnerabilitySubmission:

    update_data = data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(
            submission,
            key,
            value,
        )

    db.commit()
    db.refresh(submission)

    return submission