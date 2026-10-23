from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    assets,
    audit_logs,
    auth,
    bookmarks,
    company,
    company_auth,
    company_reports,
    dashboard,
    datasets,
    employees,
    health,
    notifications,
    predictions,
    programs,
    projects,
    reports,
    researcher_programs,
    statuses,
    submissions,
    training,
)
from app.api.v1.endpoints import users

api_router = APIRouter()


# =========================================================
# HEALTH
# =========================================================

api_router.include_router(
    health.router,
    prefix="/health",
    tags=["Health"],
)



# =========================================================
# INTERNAL USER AUTHENTICATION
# =========================================================

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"],
)


# =========================================================
# COMPANY AUTHENTICATION
# =========================================================

api_router.include_router(
    company_auth.router,
    prefix="/company",
    tags=["Company Authentication"],
)


# =========================================================
# COMPANY MANAGEMENT
# =========================================================

api_router.include_router(
    company.router,
    prefix="/company",
    tags=["Company"],
)


# =========================================================
# COMPANY EMPLOYEES
# =========================================================

api_router.include_router(
    employees.router,
    prefix="/company/employees",
    tags=["Company Employees"],
)


# =========================================================
# COMPANY PROJECTS
# =========================================================

api_router.include_router(
    projects.router,
    prefix="/company/projects",
    tags=["Company Projects"],
)


# =========================================================
# COMPANY ASSETS
# =========================================================

api_router.include_router(
    assets.router,
    prefix="/company/assets",
    tags=["Company Assets"],
)


# =========================================================
# COMPANY REPORTS
# =========================================================

api_router.include_router(
    company_reports.router,
    prefix="/company/reports",
    tags=["Company Reports"],
)


# =========================================================
# INTERNAL REPORTS
# =========================================================

api_router.include_router(
    reports.router,
    prefix="/reports",
    tags=["Reports"],
)


# =========================================================
# AI PREDICTIONS
# =========================================================

api_router.include_router(
    predictions.router,
    prefix="/predictions",
    tags=["Predictions"],
)


# =========================================================
# STATUSES
# =========================================================

api_router.include_router(
    statuses.router,
    prefix="/statuses",
    tags=["Statuses"],
)


# =========================================================
# DASHBOARD
# =========================================================

api_router.include_router(
    dashboard.router,
    prefix="/dashboard",
    tags=["Dashboard"],
)


# =========================================================
# BUG BOUNTY PROGRAMS
# =========================================================

api_router.include_router(
    programs.router,
    prefix="/company/programs",
    tags=["Company Bug Bounty Programs"],
)

# =========================================================
# INTERNAL TESTER — BUG BOUNTY PROGRAMS
# =========================================================

api_router.include_router(
    researcher_programs.router,
    prefix="/programs",
    tags=["Researcher Bug Bounty Programs"],
)
# =========================================================
# AUDIT LOGS
# =========================================================

api_router.include_router(
    audit_logs.router,
    prefix="/audit-logs",
    tags=["Audit Logs"],
)

# =========================================================
# ADMIN
# =========================================================

api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["Admin"],
)

# ---------------------------------------------------------
# BUG BOUNTY SUBMISSIONS
# ---------------------------------------------------------

api_router.include_router(
    submissions.router,
    prefix="/submissions",
    tags=["Bug Bounty Submissions"],
)

# ---------------------------------------------------------
# AI TRAINING DATASETS
# ---------------------------------------------------------

api_router.include_router(
    datasets.router,
    prefix="/admin/datasets",
    tags=["AI Training Datasets"],
)

# ---------------------------------------------------------
# AI MODEL TRAINING
# ---------------------------------------------------------

api_router.include_router(
    training.router,
    prefix="/admin/training",
    tags=["AI Model Training"],
)

# =========================================================
# ADMIN USER MANAGEMENT
# =========================================================

api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"],
)

# =========================================================
# NOTIFICATIONS
# =========================================================

api_router.include_router(
    notifications.router,
    prefix="/notifications",
    tags=["Notifications"],
)

# =========================================================
# BOOKMARKS
# =========================================================

api_router.include_router(
    bookmarks.router,
    prefix="/bookmarks",
    tags=["Bookmarks"],
)