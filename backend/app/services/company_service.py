from collections import defaultdict

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.company import Company
from app.models.program import BugBountyProgram
from app.models.submission import VulnerabilitySubmission
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.schemas.dashboard import CompanyDashboardStats


def get_company_by_email(
    db: Session,
    email: str,
) -> Company | None:
    return (
        db.query(Company)
        .filter(Company.email == email.lower())
        .first()
    )


def get_company_by_id(
    db: Session,
    company_id: int,
) -> Company | None:
    return (
        db.query(Company)
        .filter(Company.id == company_id)
        .first()
    )


def get_all_companies(db: Session):
    return db.query(Company).all()


def create_company(
    db: Session,
    company: CompanyCreate,
) -> Company:

    new_company = Company(
        company_name=company.company_name,
        email=company.email.lower(),
        hashed_password=hash_password(company.password),
        website=company.website,
        industry=company.industry,
        country=company.country,
        phone=company.phone,

        # Company approval workflow
        approval_status="pending",
        approval_reason=None,
        approved_at=None,
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return new_company


def update_company(
    db: Session,
    company: Company,
    data: CompanyUpdate,
) -> Company:

    update_data = data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(company, key, value)

    db.commit()
    db.refresh(company)

    return company


def delete_company(
    db: Session,
    company: Company,
):
    db.delete(company)
    db.commit()


def get_dashboard_stats(
    db: Session,
    company_id: int,
) -> CompanyDashboardStats:

    # =========================================================
    # COMPANY SUBMISSIONS
    #
    # Only submissions belonging to programs owned by
    # this company are included.
    # =========================================================

    submissions_query = (
        db.query(VulnerabilitySubmission)
        .join(
            BugBountyProgram,
            VulnerabilitySubmission.program_id
            == BugBountyProgram.id,
        )
        .filter(
            BugBountyProgram.company_id == company_id
        )
    )

    submissions = (
        submissions_query
        .order_by(
            VulnerabilitySubmission.submitted_at.desc()
        )
        .all()
    )

    # =========================================================
    # TOTAL REPORTS
    # =========================================================

    total_reports = len(submissions)

    # =========================================================
    # SEVERITY COUNTS
    #
    # Calculate directly in PostgreSQL.
    #
    # trim() handles accidental spaces.
    # lower() handles Critical / CRITICAL / critical.
    # =========================================================

    severity_counts = {
        "critical": (
            db.query(VulnerabilitySubmission.id)
            .join(
                BugBountyProgram,
                VulnerabilitySubmission.program_id
                == BugBountyProgram.id,
            )
            .filter(
                BugBountyProgram.company_id == company_id,
                func.lower(
                    func.trim(
                        VulnerabilitySubmission.severity
                    )
                ) == "critical",
            )
            .count()
        ),

        "high": (
            db.query(VulnerabilitySubmission.id)
            .join(
                BugBountyProgram,
                VulnerabilitySubmission.program_id
                == BugBountyProgram.id,
            )
            .filter(
                BugBountyProgram.company_id == company_id,
                func.lower(
                    func.trim(
                        VulnerabilitySubmission.severity
                    )
                ) == "high",
            )
            .count()
        ),

        "medium": (
            db.query(VulnerabilitySubmission.id)
            .join(
                BugBountyProgram,
                VulnerabilitySubmission.program_id
                == BugBountyProgram.id,
            )
            .filter(
                BugBountyProgram.company_id == company_id,
                func.lower(
                    func.trim(
                        VulnerabilitySubmission.severity
                    )
                ) == "medium",
            )
            .count()
        ),

        "low": (
            db.query(VulnerabilitySubmission.id)
            .join(
                BugBountyProgram,
                VulnerabilitySubmission.program_id
                == BugBountyProgram.id,
            )
            .filter(
                BugBountyProgram.company_id == company_id,
                func.lower(
                    func.trim(
                        VulnerabilitySubmission.severity
                    )
                ) == "low",
            )
            .count()
        ),
    }

    # =========================================================
    # STATUS COUNTS
    # =========================================================

    status_counts: dict[str, int] = defaultdict(int)

    open_count = 0
    resolved_count = 0

    for submission in submissions:

        status = (
            str(submission.status).lower().strip()
            if submission.status
            else "submitted"
        )

        status_counts[status] += 1

        # Resolved
        if status in {
            "resolved",
            "closed",
            "fixed",
        }:
            resolved_count += 1

        # Open / active
        else:
            open_count += 1

    # =========================================================
    # RECENT SUBMISSIONS
    # =========================================================

    recent_submissions = submissions[:10]

    recent_items = []

    for submission in recent_submissions:

        recent_items.append(
            {
                "id": submission.id,
                "title": submission.title,
                "vulnerability_type": (
                    submission.vulnerability_type
                ),
                "affected_asset": (
                    submission.affected_asset
                ),
                "severity": submission.severity,
                "status": submission.status,
                "submitted_at": submission.submitted_at,
                "program_id": submission.program_id,
            }
        )

    # =========================================================
    # RETURN COMPANY DASHBOARD
    # =========================================================

    return CompanyDashboardStats(
        total_reports=total_reports,

        critical_reports=severity_counts["critical"],
        high_reports=severity_counts["high"],
        medium_reports=severity_counts["medium"],
        low_reports=severity_counts["low"],

        open_reports=open_count,
        resolved_reports=resolved_count,

        severity_distribution=severity_counts,
        status_distribution=dict(status_counts),

        recent_reports=recent_items,
    )