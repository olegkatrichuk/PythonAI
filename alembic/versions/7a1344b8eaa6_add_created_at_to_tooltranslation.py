"""Add created_at to ToolTranslation

Revision ID: 7a1344b8eaa6
Revises: b193fcc48bc3
Create Date: 2025-07-07 14:55:09.863869

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7a1344b8eaa6'
down_revision: Union[str, None] = 'b193fcc48bc3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f('ix_tool_images_id'), table_name='tool_images')
    op.drop_table('tool_images')
    op.drop_index(op.f('ix_categories_slug'), table_name='categories')
    op.drop_column('categories', 'slug')
    op.add_column('tool_translations', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))
    op.drop_index(op.f('ix_tool_translations_description'), table_name='tool_translations')
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_index(op.f('ix_tool_translations_description'), 'tool_translations', ['description'], unique=False)
    op.drop_column('tool_translations', 'created_at')
    op.add_column('categories', sa.Column('slug', sa.VARCHAR(), autoincrement=False, nullable=True))
    op.create_index(op.f('ix_categories_slug'), 'categories', ['slug'], unique=True)
    op.create_table('tool_images',
    sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('url', sa.VARCHAR(), autoincrement=False, nullable=False),
    sa.Column('alt_text', sa.VARCHAR(), autoincrement=False, nullable=True),
    sa.Column('tool_id', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['tool_id'], ['tools.id'], name=op.f('tool_images_tool_id_fkey')),
    sa.PrimaryKeyConstraint('id', name=op.f('tool_images_pkey'))
    )
    op.create_index(op.f('ix_tool_images_id'), 'tool_images', ['id'], unique=False)
    # ### end Alembic commands ###
