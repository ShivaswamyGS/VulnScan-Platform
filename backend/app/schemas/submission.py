"""
Schemas for Bug Bounty vulnerability submissions.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


# =========================================================
# CREATE SUBMISSION
# =========================================================

class SubmissionCreate(BaseModel):
    """
    Data supplied by a researcher when submitting
    a vulnerability to a Bug Bounty Program.
    """

    title: str = Field(
        ...,
        min_length=5,
        max_length=200,
    )

    description: str = Field(
        ...,
        min_length=20,
    )

    vulnerability_type: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    affected_asset: str = Field(
        ...,
        min_length=2,
        max_length=500,
    )

    steps_to_reproduce: str = Field(
        ...,
        min_length=10,
    )

    proof_of_concept: str | None = None

    impact: str = Field(
        ...,
        min_length=10,
    )

    remediation: str | None = None

    attachment_path: str | None = None


# =========================================================
# UPDATE SUBMISSION
# =========================================================

class SubmissionUpdate(BaseModel):
    """
    Fields that an authorized company/admin reviewer
    can modify during the vulnerability review process.
    """

    status: str | None = Field(
        default=None,
        min_length=3,
        max_length=30,
    )

    severity: str | None = Field(
        default=None,
        min_length=3,
        max_length=20,
    )

    bounty_amount: int | None = Field(
        default=None,
        ge=0,
    )

    reviewer_comment: str | None = None
    duplicate_of_id: int | None = None


# =========================================================
# READ SUBMISSION
# =========================================================

class SubmissionRead(BaseModel):
    """
    Public API representation of a vulnerability submission.
    """

    model_config = ConfigDict(
        from_attributes=True,
    )

    id: int

    program_id: int

    researcher_id: int

    title: str

    description: str

    vulnerability_type: str

    affected_asset: str

    steps_to_reproduce: str

    proof_of_concept: str | None

    impact: str

    remediation: str | None

    severity: str | None

    status: str

    bounty_amount: int | None

    attachment_path: str | None

    reviewer_comment: str | None
    
    duplicate_of_id: int | None

    submitted_at: datetime

    updated_at: datetime