# app/crud.py

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, func
from typing import Optional
from slugify import slugify
from functools import lru_cache

from . import models, schemas, security
from app.database import SessionLocal


# --- Функции для Пользователей (Users) ---

def get_user_by_email(db: Session, email: str):
    """Получает пользователя по его email."""
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    """Создает нового пользователя."""
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_tools_by_owner(db: Session, owner_id: int, lang: str = "ru"):
    """Получает все инструменты, созданные конкретным пользователем."""
    tools_db = db.query(models.Tool).filter(models.Tool.owner_id == owner_id).options(
        joinedload(models.Tool.translations),
        joinedload(models.Tool.category).joinedload(models.Category.translations)
    ).all()
    results = [_populate_tool_translation_details(tool, lang) for tool in tools_db]
    return results


# --- Функции для Категорий (Categories) ---

def get_categories_with_translation(db: Session, lang: str = "ru", skip: int = 0, limit: int = 100):
    """Получает список категорий с переводом на указанный язык."""
    categories = db.query(models.Category).options(
        joinedload(models.Category.translations)
    ).offset(skip).limit(limit).all()
    results = []
    for cat in categories:
        translation = next((t for t in cat.translations if t.language_code == lang), None)
        if not translation:
            translation = next((t for t in cat.translations if t.language_code == 'ru'), None)
        if translation:
            results.append(schemas.Category(id=cat.id, name=translation.name))
    return results


def create_category(db: Session, category: schemas.CategoryCreate):
    """Создает новую категорию и ее переводы."""
    db_category = models.Category()
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    for trans_data in category.translations:
        db_trans = models.CategoryTranslation(**trans_data.model_dump(), category_id=db_category.id)
        db.add(db_trans)
    db.commit()
    return db_category


@lru_cache(maxsize=1)
def _get_featured_tools_cached(lang: str = "ru", limit: int = 6):
    """
    Вспомогательная функция для получения избранных инструментов с кэшированием.
    Если избранных нет, возвращает самые последние добавленные инструменты.
    """
    db: Session = SessionLocal()
    try:
        # Сначала ищем избранные инструменты
        query = db.query(models.Tool).filter(models.Tool.is_featured == True)
        tools_db = query.options(
            joinedload(models.Tool.translations),
            joinedload(models.Tool.reviews).joinedload(models.Review.author),  # ВОССТАНАВЛИВАЮ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ
            joinedload(models.Tool.category).joinedload(models.Category.translations)
        ).limit(limit).all()

        # Если избранных нет, ищем самые последние инструменты
        if not tools_db:
            query = db.query(models.Tool).order_by(desc(models.Tool.created_at))
            tools_db = query.options(
                joinedload(models.Tool.translations),
                joinedload(models.Tool.reviews).joinedload(models.Review.author),
                joinedload(models.Tool.category).joinedload(models.Category.translations)
            ).limit(limit).all()

        results = [_populate_tool_translation_details(tool, lang) for tool in tools_db]
        return {"items": results, "total": len(results)}
    finally:
        db.close()

@lru_cache(maxsize=1)
def _get_latest_tools_cached(lang: str = "ru", limit: int = 6):
    """Вспомогательная функция для получения последних инструментов с кэшированием."""
    db: Session = SessionLocal()
    try:
        query = db.query(models.Tool).order_by(desc(models.Tool.created_at))
        tools_db = query.options(
            joinedload(models.Tool.translations),
            joinedload(models.Tool.reviews).joinedload(models.Review.author),
            joinedload(models.Tool.category).joinedload(models.Category.translations)
        ).limit(limit).all()
        results = [_populate_tool_translation_details(tool, lang) for tool in tools_db]
        return {"items": results, "total": len(results)}
    finally:
        db.close()


# --- Функции для Инструментов (Tools) ---

def _populate_tool_translation_details(tool: models.Tool, lang: str):
    """
    Вспомогательная функция для заполнения полей name, description и platforms.
    Также гарантирует, что рейтинг и количество отзывов всегда будут числами.
    """
    if not tool:
        return None

    

    translation = next((t for t in tool.translations if t.language_code == lang), None)
    if not translation:
        translation = next((t for t in tool.translations if t.language_code == 'ru'), None)
    if translation:
        tool.name = translation.name
        tool.description = translation.description

    if tool.category and tool.category.translations:
        category_name = "Unnamed Category"
        category_translation = next((ct for ct in tool.category.translations if ct.language_code == lang), None)
        if not category_translation:
            category_translation = next((ct for ct in tool.category.translations if ct.language_code == 'ru'), None)
        if category_translation:
            category_name = category_translation.name
        tool.category.name = category_name

    if tool.platforms and isinstance(tool.platforms, str):
        tool.platforms = tool.platforms.split(',')
    elif not tool.platforms:
        tool.platforms = []

    # Гарантируем, что числовые поля не будут None
    if tool.average_rating is None:
        tool.average_rating = 0.0
    if tool.review_count is None:
        tool.review_count = 0

    

    return tool


def get_tool_by_slug_with_translation(db: Session, slug: str, lang: str = "ru"):
    """Получает один инструмент по его slug со всеми переводами."""
    tool = db.query(models.Tool).filter(models.Tool.slug == slug).options(
        joinedload(models.Tool.translations),
        joinedload(models.Tool.reviews).joinedload(models.Review.author),
        joinedload(models.Tool.category).joinedload(models.Category.translations)
    ).first()
    return _populate_tool_translation_details(tool, lang)


def get_tools_with_translation(
        db: Session, lang: str = "ru", skip: int = 0, limit: int = 12,
        category_id: Optional[int] = None, q: Optional[str] = None,
        latest: Optional[bool] = None, is_featured: Optional[bool] = None,
        pricing_model: Optional[models.PricingModel] = None, platform: Optional[str] = None,
        sort_by: Optional[str] = None):
    """Получает список инструментов с поддержкой всех фильтров."""
    query = db.query(models.Tool)
    if q:
        query = query.join(models.Tool.translations).filter(
            models.ToolTranslation.language_code == lang,
            or_(models.ToolTranslation.name.ilike(f"%{q}%"), models.ToolTranslation.description.ilike(f"%{q}%"))
        )
    if category_id is not None:
        query = query.filter(models.Tool.category_id == category_id)
    if is_featured is not None:
        query = query.filter(models.Tool.is_featured == is_featured)
    if pricing_model is not None:
        query = query.filter(models.Tool.pricing_model == pricing_model)
    if platform is not None:
        query = query.filter(models.Tool.platforms.ilike(f"%{platform}%"))
    
    if sort_by == 'rating':
        query = query.order_by(desc(models.Tool.average_rating))
    elif sort_by == 'review_count':
        query = query.order_by(desc(models.Tool.review_count))
    elif latest or sort_by == 'created_at':
        query = query.order_by(desc(models.Tool.created_at))
    else:
        # Сортировка по умолчанию, если ничего не указано
        query = query.order_by(desc(models.Tool.created_at))

    total = query.count()

    tools_db = query.options(
        joinedload(models.Tool.translations),
        joinedload(models.Tool.reviews).joinedload(models.Review.author),
        joinedload(models.Tool.category).joinedload(models.Category.translations)
    ).offset(skip).limit(limit).all()
    results = [_populate_tool_translation_details(tool, lang) for tool in tools_db]
    return {"items": results, "total": total}


def create_tool(db: Session, tool: schemas.ToolCreate, owner_id: int):
    """Создает новый инструмент и его переводы."""
    primary_translation = next((t for t in tool.translations if t.language_code == 'ru' and t.name),
                               tool.translations[0])
    base_slug = slugify(primary_translation.name)
    if not base_slug:
        return None
    unique_slug = base_slug
    counter = 1
    while db.query(models.Tool).filter(models.Tool.slug == unique_slug).first():
        unique_slug = f"{base_slug}-{counter}"
        counter += 1
    db_tool_data = tool.model_dump(exclude={"translations", "platforms"})
    platforms_str = ",".join(tool.platforms) if tool.platforms else None
    db_tool = models.Tool(**db_tool_data, owner_id=owner_id, slug=unique_slug, platforms=platforms_str)
    db.add(db_tool)
    db.flush()
    for trans_data in tool.translations:
        if trans_data.name:
            db_trans = models.ToolTranslation(**trans_data.model_dump(), tool_id=db_tool.id)
            db.add(db_trans)
    db.commit()
    db.refresh(db_tool)
    return db_tool


# --- Функции для Отзывов (Reviews) ---

def update_tool_rating(db: Session, tool_id: int):
    """Пересчитывает и обновляет средний рейтинг и количество отзывов для инструмента."""
    result = db.query(
        func.avg(models.Review.rating).label("average_rating"),
        func.count(models.Review.id).label("review_count")
    ).filter(models.Review.tool_id == tool_id).one()
    db.query(models.Tool).filter(models.Tool.id == tool_id).update({
        "average_rating": result.average_rating or 0,
        "review_count": result.review_count or 0
    })
    db.commit()


def create_review(db: Session, review: schemas.ReviewCreate, tool_id: int, author_id: int):
    """Создает новый отзыв в базе данных."""
    db_review = models.Review(**review.model_dump(), tool_id=tool_id, author_id=author_id)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    update_tool_rating(db=db, tool_id=tool_id)
    return db_review


def get_reviews_by_tool_slug(db: Session, slug: str, skip: int = 0, limit: int = 100):
    """Получает список отзывов для конкретного инструмента по его slug."""
    tool = db.query(models.Tool).filter(models.Tool.slug == slug).first()
    if not tool:
        return []
    # ИСПРАВЛЕНИЕ: Запрос должен быть к таблице Review, а не Tool
    reviews = db.query(models.Review).filter(models.Review.tool_id == tool.id).order_by(
        desc(models.Review.created_at)
    ).options(joinedload(models.Review.author)).offset(skip).limit(limit).all()
    return reviews