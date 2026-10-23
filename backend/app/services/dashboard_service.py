"""
Dashboard service — computes aggregate statistics shown on the Admin
Dashboard.

Includes:
- Per-severity counts
- Open/resolved counts
- Status distribution
- Recent reports
- Critical vulnerability alerts
"""

from collections import defaultdict

from sqlalchemy.orm import Session, joinedload

from app.models.enums import SeverityEnum
from app.models.prediction import Prediction
from app.models.report import Report
from app.models.user import User
from app.schemas.dashboard import DashboardStats
from app.schemas.report import ReportListItem

RECENT_REPORTS_LIMIT = 10
CRITICAL_ALERT_LIMIT = 10


def get_dashboard_stats(
    db: Session,
    company_id: int | None = None,
) -> DashboardStats:

    query = (
        db.query(Report)
        .options(
            joinedload(Report.status),
            joinedload(Report.predictions),
            joinedload(Report.reporter),
        )
    )

    # ---------------------------------------------------------
    # COMPANY FILTER
    # ---------------------------------------------------------

    if company_id is not None:
        query = (
            query
            .join(
                User,
                Report.reporter_id == User.id,
            )
            .filter(
                User.company_id == company_id
            )
        )

    reports = query.all()

    # ---------------------------------------------------------
    # INITIAL COUNTERS
    # ---------------------------------------------------------

    severity_counts: dict[str, int] = {
        severity.value: 0
        for severity in SeverityEnum
    }

    status_counts: dict[str, int] = defaultdict(int)

    open_count = 0
    resolved_count = 0

    # Reports whose latest AI prediction is critical.
    critical_reports = []

    # ---------------------------------------------------------
    # AGGREGATE REPORT DATA
    # ---------------------------------------------------------

    for report in reports:

        status_counts[report.status.name] += 1

        if report.status.is_terminal:
            resolved_count += 1
        else:
            open_count += 1

        # -----------------------------------------------------
        # LATEST AI PREDICTION
        # -----------------------------------------------------

        if report.predictions:

            latest_prediction = report.predictions[0]

            latest_severity = (
                latest_prediction
                .predicted_severity
                .value
            )

            severity_counts[latest_severity] += 1

            # -------------------------------------------------
            # CRITICAL ALERT
            # -------------------------------------------------

            if latest_severity == SeverityEnum.CRITICAL.value:
                critical_reports.append(report)

    # ---------------------------------------------------------
    # RECENT REPORTS
    # ---------------------------------------------------------

    recent_reports = sorted(
        reports,
        key=lambda report: report.submission_date,
        reverse=True,
    )[:RECENT_REPORTS_LIMIT]

    recent_items = [
        ReportListItem(
            id=report.id,
            title=report.title,
            category=report.category,
            priority=report.priority,
            submission_date=report.submission_date,
            status=report.status,
            latest_prediction=(
                report.predictions[0]
                if report.predictions
                else None
            ),
        )
        for report in recent_reports
    ]

    # ---------------------------------------------------------
    # CRITICAL VULNERABILITY ALERTS
    # ---------------------------------------------------------

    critical_reports.sort(
        key=lambda report: (
            report.priority
            if report.priority is not None
            else 999,
            report.submission_date,
        )
    )

    critical_items = [
        ReportListItem(
            id=report.id,
            title=report.title,
            category=report.category,
            priority=report.priority,
            submission_date=report.submission_date,
            status=report.status,
            latest_prediction=(
                report.predictions[0]
                if report.predictions
                else None
            ),
        )
        for report in critical_reports[:CRITICAL_ALERT_LIMIT]
    ]

    # ---------------------------------------------------------
    # RETURN DASHBOARD
    # ---------------------------------------------------------

    return DashboardStats(
        total_reports=len(reports),

        critical_reports=severity_counts["critical"],
        high_reports=severity_counts["high"],
        medium_reports=severity_counts["medium"],
        low_reports=severity_counts["low"],

        open_reports=open_count,
        resolved_reports=resolved_count,

        severity_distribution=severity_counts,
        status_distribution=dict(status_counts),

        recent_reports=recent_items,

        critical_vulnerabilities=critical_items,
    )