from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.company import Company
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


def get_company_projects(
    db: Session,
    company: Company,
):
    return (
        db.query(Project)
        .filter(Project.company_id == company.id)
        .all()
    )


def get_project_by_id(
    db: Session,
    project_id: int,
    company: Company,
):
    """
    Get a project only if it belongs to the authenticated company.
    """

    project = (
        db.query(Project)
        .filter(
            Project.id == project_id,
            Project.company_id == company.id,
        )
        .first()
    )

    if project is None:
        raise NotFoundError("Project not found")

    return project


def create_project(
    db: Session,
    company: Company,
    project: ProjectCreate,
):
    new_project = Project(
        company_id=company.id,
        name=project.name,
        description=project.description,
        repository_url=project.repository_url,
        status=project.status,
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


def update_project(
    db: Session,
    project: Project,
    data: ProjectUpdate,
):
    update_data = data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)

    return project


def delete_project(
    db: Session,
    project: Project,
):
    db.delete(project)
    db.commit()