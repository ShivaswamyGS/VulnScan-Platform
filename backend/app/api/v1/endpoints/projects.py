from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_company
from app.db.session import get_db
from app.models.company import Company
from app.schemas.project import (
    ProjectCreate,
    ProjectRead,
    ProjectUpdate,
)
from app.services.project_service import (
    create_project,
    delete_project,
    get_company_projects,
    get_project_by_id,
    update_project,
)

router = APIRouter()


@router.get(
    "/",
    response_model=list[ProjectRead],
)
def get_projects(
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    return get_company_projects(
        db,
        current_company,
    )


@router.post(
    "/",
    response_model=ProjectRead,
)
def add_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    return create_project(
        db,
        current_company,
        project,
    )


@router.get(
    "/{project_id}",
    response_model=ProjectRead,
)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    return get_project_by_id(
        db,
        project_id,
        current_company,
    )


@router.put(
    "/{project_id}",
    response_model=ProjectRead,
)
def edit_project(
    project_id: int,
    data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    project = get_project_by_id(
        db,
        project_id,
        current_company,
    )

    return update_project(
        db,
        project,
        data,
    )


@router.delete(
    "/{project_id}",
)
def remove_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_company: Company = Depends(get_current_company),
):
    project = get_project_by_id(
        db,
        project_id,
        current_company,
    )

    delete_project(
        db,
        project,
    )

    return {
        "message": "Project deleted successfully"
    }