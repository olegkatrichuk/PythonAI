"""Add pricing and platforms to Tool model

Revision ID: e90dd3623e10
Revises: 79d6de74cede
Create Date: 2025-06-29 15:31:35.651745

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy.dialects import postgresql  # ✅ обязательно для ENUM

# revision identifiers, used by Alembic.
revision: str = 'e90dd3623e10'
down_revision: Union[str, None] = '79d6de74cede'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# ✅ определяем ENUM тип отдельно
pricing_enum = postgresql.ENUM('FREE', 'FREEMIUM', 'PAID', 'TRIAL', name='pricingmodel')

def upgrade() -> None:
    """Upgrade schema."""
    # 1. Создаём ENUM тип
    pricing_enum.create(op.get_bind(), checkfirst=True)

    # 2. Добавляем колонку с этим ENUM
    # op.add_column('tools', sa.Column(
    #     'pricing_model',
    #     pricing_enum,
    #     nullable=False,
    #     server_default='FREE'
    # ))

    # 3. Добавляем строковую колонку
    # op.add_column('tools', sa.Column('platforms', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    # 1. Удаляем колонки
    op.drop_column('tools', 'platforms')
    op.drop_column('tools', 'pricing_model')

    # 2. Удаляем ENUM тип
    pricing_enum.drop(op.get_bind(), checkfirst=True)
