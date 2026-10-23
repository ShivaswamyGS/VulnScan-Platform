"""
Schemas for Bug Bounty Programs.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# CREATE
# =========================================================

class ProgramCreate(BaseModel):
    program_name: str = Field(
        ...,
        min_length=3,
        max_length=200,
    )

    description: str = Field(
        ...,
        min_length=10,
    )

    target_website: str = Field(
        ...,
        min_length=3,
        max_length=500,
    )

    scope: str = Field(
        ...,
        min_length=3,
    )

    out_of_scope: str | None = None

    reward_min: int | None = Field(
        default=None,
        ge=0,
    )

    reward_max: int | None = Field(
        default=None,
        ge=0,
    )

    severity_reward_matrix: str | None = None

    program_rules: str = Field(
        ...,
        min_length=10,
    )

    submission_guidelines: str = Field(
        ...,
        min_length=10,
    )

    start_date: datetime

    end_date: datetime | None = None

    status: str = Field(
        default="draft",
    )

    visibility: str = Field(
        default="private",
    )

    attachments: str | None = None

    is_active: bool = True


# =========================================================
# UPDATE
# =========================================================

class ProgramUpdate(BaseModel):
    program_name: str | None = Field(
        default=None,
        min_length=3,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        min_length=10,
    )

    target_website: str | None = Field(
        default=None,
        min_length=3,
        max_length=500,
    )

    scope: str | None = Field(
        default=None,
        min_length=3,
    )

    out_of_scope: str | None = None

    reward_min: int | None = Field(
        default=None,
        ge=0,
    )

    reward_max: int | None = Field(
        default=None,
        ge=0,
    )

    severity_reward_matrix: str | None = None

    program_rules: str | None = Field(
        default=None,
        min_length=10,
    )

    submission_guidelines: str | None = Field(
        default=None,
        min_length=10,
    )

    start_date: datetime | None = None

    end_date: datetime | None = None

    status: str | None = None

    visibility: str | None = None

    attachments: str | None = None

    is_active: bool | None = None


# =========================================================
# READ
# =========================================================

class ProgramRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True
    )

    id: int
    company_id: int

    program_name: str
    description: str
    target_website: str

    scope: str
    out_of_scope: str | None

    reward_min: int | None
    reward_max: int | None

    severity_reward_matrix: str | None

    program_rules: str
    submission_guidelines: str

    start_date: datetime
    end_date: datetime | None

    status: str
    visibility: str

    attachments: str | None

    is_active: bool

    created_at: datetime
    updated_at: datetime