from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProjectBase(BaseModel):
    name: str
    description: str
    repository_url: str | None = None
    status: str = "Active"


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    repository_url: str | None = None
    status: str | None = None


class ProjectRead(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime