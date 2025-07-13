"""add_primary_key_to_tools_table

Revision ID: 74c5772e6b3c
Revises: 7e34f0a21d66
Create Date: 2025-07-13 14:03:05.430962

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '74c5772e6b3c'
# 🔴 ИСПРАВЛЕНО: Эта миграция должна идти после той, что исправляла `users`
down_revision: Union[str, None] = '7e34f0a21d66'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Добавляет ограничение первичного ключа (PRIMARY KEY) к столбцу `id`
    в таблице `tools`.
    """
    op.create_primary_key(
        "pk_tools",  # Имя для нового ограничения
        "tools",     # Имя таблицы
        ["id"]       # Столбец, который станет первичным ключом
    )


def downgrade() -> None:
    """
    Удаляет ограничение первичного ключа с таблицы `tools`.
    """
    op.drop_constraint("pk_tools", "tools", type_="primary")