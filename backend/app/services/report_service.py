"""
Report service — creation, retrieval, and attachment storage for Reports.
"""

import logging
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.core.exceptions import AppException, NotFoundError
from app.models.report import Report
from app.models.status import Status
from app.models.user import User
from app.schemas.report import ReportCreate
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models.prediction import Prediction

logger = logging.getLogger(__name__)

ALLOWED_ATTACHMENT_EXTENSIONS = {".png", ".jpg", ".jpeg", ".pdf", ".txt", ".log", ".zip"}


def get_default_status(db: Session) -> Status:
    status = db.query(Status).filter(Status.name == "Open").first()
    if status is None:
        raise AppException("Default 'Open' status is not seeded. Run app/db/seed.py.", status_code=500)
    return status


def save_attachment(file: UploadFile) -> str:
    """
    Persists an uploaded attachment under UPLOAD_DIR with a randomized
    filename (never the client-supplied filename) to prevent path
    traversal and filename collisions. Returns the RELATIVE path to store
    on the Report row.
    """
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_ATTACHMENT_EXTENSIONS:
        raise AppException(
            f"Attachment type '{suffix}' is not allowed. Allowed types: {', '.join(sorted(ALLOWED_ATTACHMENT_EXTENSIONS))}",
            status_code=422,
        )

    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    contents = file.file.read()
    if len(contents) > max_bytes:
        raise AppException(f"Attachment exceeds the {settings.MAX_UPLOAD_MB}MB size limit.", status_code=413)

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    safe_filename = f"{uuid.uuid4().hex}{suffix}"
    destination = upload_dir / safe_filename
    with open(destination, "wb") as f:
        f.write(contents)

    logger.info("Saved attachment %s (original name: %s)", safe_filename, file.filename)
    return safe_filename  # relative to UPLOAD_DIR — never store the absolute path


def create_report(db: Session, report_in: ReportCreate, reporter: User, attachment_path: str | None) -> Report:
    default_status = get_default_status(db)
    report = Report(
        title=report_in.title,
        description=report_in.description,
        affected_module=report_in.affected_module,
        category=report_in.category,
        steps_to_reproduce=report_in.steps_to_reproduce,
        expected_result=report_in.expected_result,
        actual_result=report_in.actual_result,
        attachment_path=attachment_path,
        reporter_id=reporter.id,
        status_id=default_status.id,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_report_by_id(db: Session, report_id: int) -> Report:
    report = (
        db.query(Report)
        .options(joinedload(Report.reporter), joinedload(Report.status), joinedload(Report.predictions))
        .filter(Report.id == report_id)
        .first()
    )
    if report is None:
        raise NotFoundError(f"Report {report_id} not found")
    return report


def list_reports(
    db: Session,
    *,
    current_user: User,
    status_id: int | None = None,
    category: str | None = None,
    search: str | None = None,
    severity: str | None = None,
    priority: int | None = None,
) -> list[Report]:
    """
    Internal Testers only ever see their own reports;
    Admins see all.

    Optional filters:
    - status_id
    - category
    - search
    - severity
    - priority
    """

    from app.models.enums import RoleEnum

    query = (
        db.query(Report)
        .options(
            joinedload(Report.reporter),
            joinedload(Report.status),
            joinedload(Report.predictions),
        )
    )

    # -----------------------------------------------------
    # OWNERSHIP
    # -----------------------------------------------------

    if current_user.role != RoleEnum.ADMIN:
        query = query.filter(
            Report.reporter_id == current_user.id
        )

    # -----------------------------------------------------
    # STATUS
    # -----------------------------------------------------

    if status_id is not None:
        query = query.filter(
            Report.status_id == status_id
        )

    # -----------------------------------------------------
    # CATEGORY
    # -----------------------------------------------------

    if category is not None:
        query = query.filter(
            Report.category == category
        )

    # -----------------------------------------------------
    # SEARCH
    # -----------------------------------------------------

    if search:
        like_pattern = f"%{search}%"

        query = query.filter(
            Report.title.ilike(like_pattern)
        )

    # -----------------------------------------------------
    # PRIORITY
    # -----------------------------------------------------

    if priority is not None:
        query = query.filter(
            Report.priority == priority
        )

    # -----------------------------------------------------
    # SEVERITY
    # -----------------------------------------------------

    if severity is not None:
        severity_value = severity.lower()

        query = (
            query
            .join(
                Prediction,
                Prediction.report_id == Report.id,
            )
            .filter(
                Prediction.predicted_severity
                == severity_value
            )
            .distinct()
        )

    return (
        query
        .order_by(
            Report.submission_date.desc()
        )
        .all()
    )
# =========================================================
# DUPLICATE VULNERABILITY DETECTION
# =========================================================

DUPLICATE_SIMILARITY_THRESHOLD = 0.75


def _build_report_text(report: Report) -> str:
    """
    Build a combined text representation of a vulnerability
    report for NLP similarity comparison.
    """

    parts = [
        report.title,
        report.description,
        report.affected_module,
        report.category,
        report.steps_to_reproduce,
        report.expected_result,
        report.actual_result,
    ]

    return " ".join(
        str(part)
        for part in parts
        if part
    )


def find_duplicate_reports(
    db: Session,
    report: Report,
    threshold: float = DUPLICATE_SIMILARITY_THRESHOLD,
) -> list[dict]:
    """
    Find existing vulnerability reports that are sufficiently
    similar to the supplied report.

    Uses TF-IDF + cosine similarity.

    The current report itself is excluded from the comparison.

    Returns the matching reports ordered from highest similarity
    to lowest similarity.
    """

    if not 0.0 < threshold <= 1.0:
        raise AppException(
            "Duplicate similarity threshold must be between 0 and 1",
            status_code=422,
        )

    # -----------------------------------------------------
    # GET EXISTING REPORTS
    # -----------------------------------------------------

    existing_reports = (
        db.query(Report)
        .filter(
            Report.id != report.id
        )
        .all()
    )

    if not existing_reports:
        return []

    # -----------------------------------------------------
    # BUILD DOCUMENTS
    # -----------------------------------------------------

    current_text = _build_report_text(
        report
    )

    if not current_text.strip():
        return []

    documents = [
        current_text
    ]

    documents.extend(
        _build_report_text(
            existing_report
        )
        for existing_report in existing_reports
    )

    # -----------------------------------------------------
    # TF-IDF
    # -----------------------------------------------------

    vectorizer = TfidfVectorizer(
        lowercase=True,
        stop_words="english",
        ngram_range=(1, 2),
        min_df=1,
    )

    try:
        vectors = vectorizer.fit_transform(
            documents
        )

    except ValueError:
        return []

    # -----------------------------------------------------
    # COSINE SIMILARITY
    # -----------------------------------------------------

    similarity_scores = cosine_similarity(
        vectors[0:1],
        vectors[1:],
    )[0]

    # -----------------------------------------------------
    # BUILD MATCH RESULTS
    # -----------------------------------------------------

    duplicates = []

    for existing_report, score in zip(
        existing_reports,
        similarity_scores,
    ):
        similarity = float(score)

        if similarity >= threshold:
            duplicates.append(
                {
                    "report_id": existing_report.id,
                    "title": existing_report.title,
                    "category": existing_report.category,
                    "similarity_score": round(
                        similarity,
                        4,
                    ),
                    "is_duplicate": True,
                }
            )

    # -----------------------------------------------------
    # HIGHEST SIMILARITY FIRST
    # -----------------------------------------------------

    duplicates.sort(
        key=lambda item: item["similarity_score"],
        reverse=True,
    )

    return duplicates