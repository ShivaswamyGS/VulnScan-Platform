"""add company approval workflow

Revision ID: 1edbad2c8495
Revises: e5cf1fc74995
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "1edbad2c8495"
down_revision: Union[str, Sequence[str], None] = "e5cf1fc74995"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "companies",
        sa.Column(
            "approval_status",
            sa.String(length=20),
            nullable=False,
            server_default="pending",
        ),
    )
    op.add_column(
        "companies",
        sa.Column("approval_reason", sa.String(length=500), nullable=True),
    )
    op.add_column(
        "companies",
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index(
        op.f("ix_companies_approval_status"),
        "companies",
        ["approval_status"],
        unique=False,
    )
    op.alter_column("companies", "approval_status", server_default=None)


def downgrade() -> None:
    op.drop_index(
        op.f("ix_companies_approval_status"),
        table_name="companies",
    )
    op.drop_column("companies", "approved_at")
    op.drop_column("companies", "approval_reason")
    op.drop_column("companies", "approval_status")
