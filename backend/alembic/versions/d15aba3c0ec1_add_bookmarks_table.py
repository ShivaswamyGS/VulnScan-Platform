"""add bookmarks table

Revision ID: d15aba3c0ec1
Revises: 24f29f6cd26c
Create Date: 2026-08-16 19:18:53.409480
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d15aba3c0ec1"
down_revision: Union[str, Sequence[str], None] = "24f29f6cd26c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create bookmarks table."""

    op.create_table(
        "bookmarks",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "program_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["program_id"],
            ["bug_bounty_programs.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "program_id",
            name="uq_bookmark_user_program",
        ),
    )

    op.create_index(
        "ix_bookmarks_id",
        "bookmarks",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_bookmarks_user_id",
        "bookmarks",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        "ix_bookmarks_program_id",
        "bookmarks",
        ["program_id"],
        unique=False,
    )


def downgrade() -> None:
    """Drop bookmarks table."""

    op.drop_index(
        "ix_bookmarks_program_id",
        table_name="bookmarks",
    )

    op.drop_index(
        "ix_bookmarks_user_id",
        table_name="bookmarks",
    )

    op.drop_index(
        "ix_bookmarks_id",
        table_name="bookmarks",
    )

    op.drop_table("bookmarks")