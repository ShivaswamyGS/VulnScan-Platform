"""
Report endpoints.

POST /reports is the heart of the AI workflow: a Tester submits a report,
the server stores it, immediately runs it through the ML pipeline, and
stores the resulting Prediction.

Also records security-relevant report actions in the audit log.
"""

import logging
from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Query,
    Request,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import (
    get_client_ip,
    get_current_user,
    require_admin,
)
from app.core.config import settings
from app.core.exceptions import ForbiddenError, NotFoundError
from app.db.session import get_db
from app.models.enums import AuditActionEnum, RoleEnum
from app.models.user import User
from app.schemas.report import (
    ReportCreate,
    ReportListItem,
    ReportRead,
    ReportUpdateAdmin,
)
from app.services.audit_log_service import create_audit_log
from app.services.prediction_service import run_prediction_for_report
from app.services.report_service import (
    create_report,
    find_duplicate_reports,
    get_report_by_id,
    list_reports,
    save_attachment,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# =========================================================
# REPORT ACCESS CONTROL
# =========================================================

def _check_report_access(
    report,
    current_user: User,
) -> None:
    """
    Admins can access all reports.

    Non-admin users can access only their own reports.
    """

    if (
        current_user.role != RoleEnum.ADMIN
        and report.reporter_id != current_user.id
    ):
        raise ForbiddenError(
            "You do not have permission to access this report"
        )


# =========================================================
# CREATE REPORT
# =========================================================

@router.post(
    "",
    response_model=ReportRead,
    status_code=status.HTTP_201_CREATED,
)
def submit_report(
    title: str = Form(..., min_length=5, max_length=200),
    description: str = Form(..., min_length=10),
    affected_module: str = Form(..., min_length=2, max_length=150),
    category: str = Form(..., min_length=2, max_length=100),
    steps_to_reproduce: str = Form(..., min_length=5),
    expected_result: str = Form(..., min_length=1),
    actual_result: str = Form(..., min_length=1),
    attachment: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportRead:

    # Only Internal Testers can submit vulnerability reports.
    if current_user.role != RoleEnum.INTERNAL_TESTER:
        raise ForbiddenError(
            "Only internal testers can submit reports"
        )

    report_in = ReportCreate(
        title=title,
        description=description,
        affected_module=affected_module,
        category=category,
        steps_to_reproduce=steps_to_reproduce,
        expected_result=expected_result,
        actual_result=actual_result,
    )

    attachment_path = (
        save_attachment(attachment)
        if attachment is not None
        else None
    )

    report = create_report(
        db,
        report_in,
        reporter=current_user,
        attachment_path=attachment_path,
    )

    # Trigger AI triage immediately after report creation.
    run_prediction_for_report(db, report)

    # ---------------------------------------------------------
    # AUDIT LOG: REPORT CREATED
    # ---------------------------------------------------------

    create_audit_log(
        db,
        user_id=current_user.id,
        action=AuditActionEnum.CREATE,
        entity_type="report",
        entity_id=report.id,
        details={
            "title": report.title,
            "category": report.category,
        },
        ip_address=None,
    )

    db.commit()

    return get_report_by_id(
        db,
        report.id,
    )


# =========================================================
# ADMIN UPDATE REPORT
# =========================================================

@router.patch(
    "/{report_id}",
    response_model=ReportRead,
)
def update_report_admin(
    report_id: int,
    report_in: ReportUpdateAdmin,
    request: Request,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> ReportRead:

    report = get_report_by_id(
        db,
        report_id,
    )

    # Keep the original values before modification
    old_status_id = report.status_id
    old_priority = report.priority

    # ---------------------------------------------------------
    # STATUS CHANGE
    # ---------------------------------------------------------

    if (
        report_in.status_id is not None
        and report_in.status_id != old_status_id
    ):
        report.status_id = report_in.status_id

        create_audit_log(
            db,
            user_id=current_user.id,
            action=AuditActionEnum.STATUS_CHANGE,
            entity_type="report",
            entity_id=report.id,
            details={
                "old_status_id": old_status_id,
                "new_status_id": report_in.status_id,
            },
            ip_address=get_client_ip(request),
        )

    # ---------------------------------------------------------
    # PRIORITY CHANGE
    # ---------------------------------------------------------

    if (
        report_in.priority is not None
        and report_in.priority != old_priority
    ):
        report.priority = report_in.priority

        create_audit_log(
            db,
            user_id=current_user.id,
            action=AuditActionEnum.PRIORITY_CHANGE,
            entity_type="report",
            entity_id=report.id,
            details={
                "old_priority": old_priority,
                "new_priority": report_in.priority,
            },
            ip_address=get_client_ip(request),
        )

    # ---------------------------------------------------------
    # SAVE
    # ---------------------------------------------------------

    db.commit()
    db.refresh(report)

    return get_report_by_id(
        db,
        report_id,
    )


# =========================================================
# FIND DUPLICATE REPORTS
# =========================================================

@router.get(
    "/{report_id}/duplicates",
)
def get_duplicate_reports(
    report_id: int,
    threshold: float = Query(
        0.75,
        gt=0.0,
        le=1.0,
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Find existing vulnerability reports that are similar
    to the selected report.

    Uses TF-IDF + cosine similarity.

    Only the report owner or an administrator can perform
    the duplicate check.
    """

    report = get_report_by_id(
        db,
        report_id,
    )

    _check_report_access(
        report,
        current_user,
    )

    duplicates = find_duplicate_reports(
        db,
        report,
        threshold=threshold,
    )

    return {
        "report_id": report.id,
        "threshold": threshold,
        "duplicate_count": len(duplicates),
        "duplicates": duplicates,
    }


# =========================================================
# LIST REPORTS
# =========================================================

@router.get(
    "",
    response_model=list[ReportListItem],
)
def get_reports(
    status_id: int | None = None,
    category: str | None = None,
    search: str | None = None,
    severity: str | None = None,
    priority: int | None = Query(
        None,
        ge=1,
        le=5,
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ReportListItem]:
    """
    Internal Testers see only their own reports.
    Admins see all reports.

    Optional filters:
    - status_id
    - category
    - search
    - severity
    - priority
    """

    reports = list_reports(
        db,
        current_user=current_user,
        status_id=status_id,
        category=category,
        search=search,
        severity=severity,
        priority=priority,
    )

    items = []

    for report in reports:
        latest_prediction = (
            report.predictions[0]
            if report.predictions
            else None
        )

        items.append(
            ReportListItem(
                id=report.id,
                title=report.title,
                category=report.category,
                priority=report.priority,
                submission_date=report.submission_date,
                status=report.status,
                latest_prediction=latest_prediction,
            )
        )

    return items


# =========================================================
# GET REPORT
# =========================================================

@router.get(
    "/{report_id}",
    response_model=ReportRead,
)
def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportRead:

    report = get_report_by_id(
        db,
        report_id,
    )

    _check_report_access(
        report,
        current_user,
    )

    return report


# =========================================================
# DOWNLOAD ATTACHMENT
# =========================================================

@router.get(
    "/{report_id}/attachment",
)
def download_attachment(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FileResponse:
    """
    Serves a report's attachment through an authenticated endpoint.

    The same ownership/admin check used for the report itself applies
    to the attachment.
    """

    report = get_report_by_id(
        db,
        report_id,
    )

    _check_report_access(
        report,
        current_user,
    )

    if not report.attachment_path:
        raise NotFoundError(
            "This report has no attachment"
        )

    file_path = (
        Path(settings.UPLOAD_DIR)
        / report.attachment_path
    )

    if not file_path.is_file():
        raise NotFoundError(
            "Attachment file is missing from storage"
        )

    return FileResponse(
        path=file_path,
        filename=report.attachment_path,
    )