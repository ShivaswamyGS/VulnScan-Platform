import json

from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.audit_log import AuditLog
from app.models.company import Company
from app.models.enums import AuditActionEnum
from app.models.report import Report
from app.models.status import Status
from app.schemas.company_report import CompanyReportUpdate


def get_company_report_by_id(
    db: Session,
    company: Company,
    report_id: int,
) -> Report:
    """
    Get a report only if it belongs to an employee
    of the currently authenticated company.
    """

    report = (
        db.query(Report)
        .options(
            joinedload(Report.reporter),
            joinedload(Report.status),
            joinedload(Report.predictions),
        )
        .filter(
            Report.id == report_id,
            Report.reporter.has(
                company_id=company.id
            ),
        )
        .first()
    )

    if report is None:
        raise NotFoundError("Report not found")

    # Keep this explicit security check.
    # Never remove it just to make cross-company reports work.
    if report.reporter is None:
        raise NotFoundError("Report not found")

    if report.reporter.company_id != company.id:
        raise ForbiddenError(
            "You do not have permission to access this report"
        )

    return report


def get_company_reports(
    db: Session,
    company: Company,
) -> list[Report]:
    """
    Return only reports submitted by employees
    belonging to the authenticated company.
    """

    return (
        db.query(Report)
        .options(
            joinedload(Report.reporter),
            joinedload(Report.status),
            joinedload(Report.predictions),
        )
        .filter(
            Report.reporter.has(
                company_id=company.id
            )
        )
        .order_by(
            Report.submission_date.desc()
        )
        .all()
    )


def _create_audit_log(
    db: Session,
    *,
    action: AuditActionEnum,
    report_id: int,
    company_id: int,
    details: dict,
) -> None:
    """
    Create an audit entry for a company report action.
    """

    db.add(
        AuditLog(
            user_id=None,
            action=action,
            entity_type="report",
            entity_id=report_id,
            details=json.dumps(
                {
                    **details,
                    "company_id": company_id,
                }
            ),
            ip_address=None,
        )
    )


def update_company_report(
    db: Session,
    company: Company,
    report_id: int,
    data: CompanyReportUpdate,
) -> Report:
    """
    Allow a company to update only reports belonging
    to that company.

    Supported changes:
    - status
    - priority
    """

    # IMPORTANT:
    # This ownership check must happen BEFORE any update.
    report = get_company_report_by_id(
        db,
        company,
        report_id,
    )

    update_data = data.model_dump(
        exclude_unset=True
    )

    # Nothing to update.
    if not update_data:
        return report

    # -----------------------------------------
    # STATUS CHANGE
    # -----------------------------------------

    if "status_id" in update_data:

        new_status_id = update_data["status_id"]

        # status_id is optional in the schema, but if supplied
        # it must reference a real Status.
        if new_status_id is None:
            raise NotFoundError(
                "Status not found"
            )

        new_status = (
            db.query(Status)
            .filter(
                Status.id == new_status_id
            )
            .first()
        )

        if new_status is None:
            raise NotFoundError(
                "Status not found"
            )

        old_status = report.status

        if (
            old_status is not None
            and old_status.id != new_status.id
        ):
            _create_audit_log(
                db,
                action=AuditActionEnum.STATUS_CHANGE,
                report_id=report.id,
                company_id=company.id,
                details={
                    "old_status": old_status.name,
                    "new_status": new_status.name,
                },
            )

            report.status_id = new_status.id

    # -----------------------------------------
    # PRIORITY CHANGE
    # -----------------------------------------

    if "priority" in update_data:

        new_priority = update_data["priority"]
        old_priority = report.priority

        if old_priority != new_priority:

            _create_audit_log(
                db,
                action=AuditActionEnum.PRIORITY_CHANGE,
                report_id=report.id,
                company_id=company.id,
                details={
                    "old_priority": old_priority,
                    "new_priority": new_priority,
                },
            )

            report.priority = new_priority

    # -----------------------------------------
    # SAVE
    # -----------------------------------------

    db.commit()
    db.refresh(report)

    # Return the fully-loaded company-owned report.
    return get_company_report_by_id(
        db,
        company,
        report_id,
    )