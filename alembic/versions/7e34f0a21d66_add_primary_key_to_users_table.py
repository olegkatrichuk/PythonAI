"""add_primary_key_to_users_table

Revision ID: 7e34f0a21d66
Revises: d4dab894150b
Create Date: 2025-07-13 13:34:48.282538

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '7e34f0a21d66'
# 🔴 ИСПРАВЛЕНО: Эта миграция должна идти после d4dab894150b
down_revision: Union[str, None] = 'd4dab894150b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Добавляет ограничение первичного ключа (PRIMARY KEY) к столбцу `id`
    в таблице `users`.
    """
    op.create_primary_key(
        "pk_users",  # Имя для нового ограничения
        "users",     # Имя таблицы
        ["id"]       # Столбец, который станет первичным ключом
    )


def downgrade() -> None:
    """
    Удаляет ограничение первичного ключа с таблицы `users`.
    """
    op.drop_constraint("pk_users", "users", type_="primary")