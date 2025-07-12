"""Manually create initial tables

Revision ID: 546d1686c8c3
Revises: 7a1344b8eaa6
Create Date: 2025-07-09 21:46:04.717922

"""
from typing import Sequence, Union



# revision identifiers, used by Alembic.
revision: str = '546d1686c8c3'
down_revision: Union[str, None] = '7a1344b8eaa6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
