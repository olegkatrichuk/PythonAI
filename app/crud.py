# app/crud.py

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, func
import json
from typing import Optional
from slugify import slugify
from functools import lru_cache

from . import models, schemas, security
from app.database import SessionLocal
from .cache import (
    get_cached_tools, cache_tools,
    get_cached_categories, cache_categories,
    get_cached_tool_count, cache_tool_count,
    cache
)


def serialize_tool(tool, lang: str = "ru"):
    """Универсальная функция сериализации инструмента."""
    if not tool:
        return None

    # Сначала применяем переводы
    populated_tool = _populate_tool_translation_details(tool, lang)
    if not populated_tool:
        return None

    # Сериализуем в словарь
    tool_dict = {
        "id": populated_tool.id,
        "slug": populated_tool.slug,
        "url": populated_tool.url,
        "icon_url": populated_tool.icon_url,
        "is_featured": populated_tool.is_featured,
        "created_at": populated_tool.created_at.isoformat() if populated_tool.created_at else None,
        "average_rating": float(populated_tool.average_rating) if populated_tool.average_rating is not None else 0.0,
        "review_count": int(populated_tool.review_count) if populated_tool.review_count is not None else 0,
        "pricing_model": populated_tool.pricing_model.value if hasattr(populated_tool.pricing_model, 'value') else str(
            populated_tool.pricing_model) if populated_tool.pricing_model else None,
        "platforms": populated_tool.platforms if isinstance(populated_tool.platforms, list) else [],
        "category_id": populated_tool.category_id,
        "owner_id": populated_tool.owner_id,
        "name": getattr(populated_tool, 'name', ''),
        "description": getattr(populated_tool, 'description', ''),
        "short_description": getattr(populated_tool, 'short_description', ''),
    }

    # Добавляем категорию если есть
    if hasattr(populated_tool, 'category') and populated_tool.category:
        tool_dict["category"] = {
            "id": populated_tool.category.id,
            "name": getattr(populated_tool.category, 'name', ''),
            "slug": populated_tool.category.slug
        }

    return tool_dict


# --- Функции для Пользователей (Users) ---

def get_user_by_email(db: Session, email: str):
    """Получает пользователя по его email."""
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    """Создает нового пользователя."""
    from sqlalchemy.exc import IntegrityError
    
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    
    try:
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        # Пусть основной код в main.py обработает проверку дублирования
        raise


def get_tools_by_owner(db: Session, owner_id: int, lang: str = "ru"):
    """Получает все инструменты, созданные конкретным пользователем."""
    tools_db = db.query(models.Tool).filter(models.Tool.owner_id == owner_id).options(
        joinedload(models.Tool.translations),
        joinedload(models.Tool.category).joinedload(models.Category.translations)
    ).all()

    # Используем универсальную функцию сериализации
    results = [serialize_tool(tool, lang) for tool in tools_db]
    return [tool for tool in results if tool is not None]


# --- Функции для Категорий (Categories) ---

def get_categories_with_translation(db: Session, lang: str = "ru"):
    """
    Получает список ВСЕХ категорий с переводом на указанный язык.
    Эта функция намеренно упрощена для надежности.
    """
    categories = db.query(models.Category).options(
        joinedload(models.Category.translations)
    ).all()
    
    results = []
    for cat in categories:
        translation = next((t for t in cat.translations if t.language_code == lang), None)
        if not translation:
            # Фоллбэк на русский, если перевод не найден
            translation = next((t for t in cat.translations if t.language_code == 'ru'), None)
        
        if translation:
            results.append(schemas.Category(id=cat.id, name=translation.name, slug=cat.slug))
            
    return results


async def get_categories_with_cache(db: Session, lang: str = "ru"):
    """
    Кэшированная версия получения категорий.
    Сначала проверяет кэш Redis, и если он пуст,
    запрашивает данные из БД с помощью `get_categories_with_translation`.
    """
    # 1. Проверяем кэш
    cached_result = await get_cached_categories(lang)
    if cached_result:
        return cached_result

    # 2. Если в кэше нет, получаем из базы данных
    result = get_categories_with_translation(db, lang)

    # 3. Кэшируем результат на 10 минут (600 секунд)
    if result:
        await cache_categories([cat.model_dump() for cat in result], lang, 600)

    return result


def get_category_by_slug(db: Session, slug: str, lang: str = "ru"):
    """Получает категорию по ее slug."""
    category = db.query(models.Category).filter(models.Category.slug == slug).options(
        joinedload(models.Category.translations)
    ).first()
    if category:
        translation = next((t for t in category.translations if t.language_code == lang), None)
        if not translation:
            translation = next((t for t in category.translations if t.language_code == 'ru'), None)
        if translation:
            category.name = translation.name
    return category


def create_category(db: Session, category: schemas.CategoryCreate):
    """Создает новую категорию, ее переводы и slug."""
    # Генерируем slug из английского названия, если оно есть
    primary_translation = next((t for t in category.translations if t.language_code == 'en' and t.name), None)
    if not primary_translation:
        primary_translation = category.translations[0]  # Берем первый перевод, если английского нет

    base_slug = slugify(primary_translation.name)
    unique_slug = base_slug
    counter = 1
    while db.query(models.Category).filter(models.Category.slug == unique_slug).first():
        unique_slug = f"{base_slug}-{counter}"
        counter += 1

    db_category = models.Category(slug=unique_slug)
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
        query = db.query(models.Tool).filter(models.Tool.is_featured)
        tools_db = query.options(
            joinedload(models.Tool.translations),
            joinedload(models.Tool.reviews).joinedload(models.Review.author),
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

        # Используем универсальную функцию сериализации
        serialized_results = [serialize_tool(tool, lang) for tool in tools_db]
        serialized_results = [tool for tool in serialized_results if tool is not None]

        return {"items": serialized_results, "total": len(serialized_results)}
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

        # Используем универсальную функцию сериализации
        serialized_results = [serialize_tool(tool, lang) for tool in tools_db]
        serialized_results = [tool for tool in serialized_results if tool is not None]

        return {"items": serialized_results, "total": len(serialized_results)}
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
        tool.short_description = translation.short_description

    if tool.category and tool.category.translations:
        category_name = "Unnamed Category"
        category_translation = next((ct for ct in tool.category.translations if ct.language_code == lang), None)
        if not category_translation:
            category_translation = next((ct for ct in tool.category.translations if ct.language_code == 'ru'), None)
        if category_translation:
            category_name = category_translation.name
        tool.category.name = category_name

    if tool.platforms and isinstance(tool.platforms, str):
        try:
            # Attempt to parse as JSON array
            tool.platforms = json.loads(tool.platforms)
        except json.JSONDecodeError:
            # Fallback to splitting by comma if not valid JSON
            tool.platforms = [p.strip() for p in tool.platforms.split(',') if p.strip()]
    elif not tool.platforms:
        tool.platforms = []
    # Ensure it's always a list
    if not isinstance(tool.platforms, list):
        tool.platforms = []

    # Гарантируем, что числовые поля не будут None
    if tool.average_rating is None:
        tool.average_rating = 0.0
    if tool.review_count is None:
        tool.review_count = 0

    return tool


@lru_cache(maxsize=128)
def _get_tool_by_slug_cached(slug: str, lang: str = "ru"):
    db: Session = SessionLocal()
    try:
        tool = db.query(models.Tool).filter(models.Tool.slug == slug).options(
            joinedload(models.Tool.translations),
            joinedload(models.Tool.reviews).joinedload(models.Review.author),
            joinedload(models.Tool.category).joinedload(models.Category.translations)
        ).first()
        return _populate_tool_translation_details(tool, lang)
    finally:
        db.close()


def get_tool_by_slug_with_translation(db: Session, slug: str, lang: str = "ru"):
    """Получает один инструмент по его slug со всеми переводами."""
    return _get_tool_by_slug_cached(slug=slug, lang=lang)


def get_tools_with_translation(
        db: Session, lang: str = "ru", skip: int = 0, limit: int = 12,
        category_id: Optional[int] = None, q: Optional[str] = None,
        latest: Optional[bool] = None, is_featured: Optional[bool] = None,
        pricing_model: Optional[models.PricingModel] = None, platform: Optional[str] = None,
        sort_by: Optional[str] = None):
    """Получает список инструментов с поддержкой всех фильтров."""
    print(f"[CRUD DEBUG] Search query: '{q}', lang: '{lang}', category_id: {category_id}")
    
    query = db.query(models.Tool)
    if q:
        print(f"[CRUD DEBUG] Applying search filter for query: '{q}'")
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

    # Используем универсальную функцию сериализации
    serialized_results = [serialize_tool(tool, lang) for tool in tools_db]
    serialized_results = [tool for tool in serialized_results if tool is not None]

    return {"items": serialized_results, "total": total}


async def get_tools_with_cache(
        db: Session, lang: str = "ru", skip: int = 0, limit: int = 12,
        category_id: Optional[int] = None, q: Optional[str] = None,
        latest: Optional[bool] = None, is_featured: Optional[bool] = None,
        pricing_model: Optional[models.PricingModel] = None, platform: Optional[str] = None,
        sort_by: Optional[str] = None):
    """Кэшированная версия получения инструментов."""

    # Не кэшируем результаты поиска и сложных фильтров
    if q or pricing_model or platform or is_featured or latest or sort_by:
        return get_tools_with_translation(
            db, lang, skip, limit, category_id, q, latest,
            is_featured, pricing_model, platform, sort_by
        )

    # Создаем ключ кэша для простых запросов
    category_slug = None
    if category_id:
        category = db.query(models.Category).filter(models.Category.id == category_id).first()
        category_slug = category.slug if category else None

    # Проверяем кэш
    cached_result = await get_cached_tools(lang, category_slug, skip, limit)
    if cached_result:
        # Получаем количество из кэша или базы
        total = await get_cached_tool_count(category_slug)
        if total is None:
            # Если количества нет в кэше, получаем из базы и кэшируем
            query = db.query(models.Tool)
            if category_id:
                query = query.filter(models.Tool.category_id == category_id)
            total = query.count()
            await cache_tool_count(total, category_slug, 300)

        return {"items": cached_result, "total": total}

    # Если нет в кэше, получаем из базы
    result = get_tools_with_translation(
        db, lang, skip, limit, category_id, q, latest,
        is_featured, pricing_model, platform, sort_by
    )

    # Кэшируем результат (только для простых запросов)
    await cache_tools(result["items"], lang, category_slug, skip, limit, 300)
    await cache_tool_count(result["total"], category_slug, 300)

    return result


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
    platforms_str = json.dumps(tool.platforms) if tool.platforms else None
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


async def create_tool_with_cache_invalidation(db: Session, tool: schemas.ToolCreate, owner_id: int):
    """Создает новый инструмент и инвалидирует кэш."""
    result = create_tool(db, tool, owner_id)
    if result:
        # Инвалидируем кэш после создания
        await cache.invalidate_tools_cache()
    return result


def update_or_create_tool_translation(db: Session, tool_id: int, language_code: str, name: str, description: str,
                                      short_description: Optional[str] = None):
    """Обновляет или создает перевод инструмента."""
    db_translation = db.query(models.ToolTranslation).filter(
        models.ToolTranslation.tool_id == tool_id,
        models.ToolTranslation.language_code == language_code
    ).first()

    if db_translation:
        db_translation.name = name
        db_translation.description = description
        db_translation.short_description = short_description
    else:
        db_translation = models.ToolTranslation(
            tool_id=tool_id,
            language_code=language_code,
            name=name,
            description=description,
            short_description=short_description
        )
        db.add(db_translation)
    db.commit()
    db.refresh(db_translation)
    return db_translation


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
    # Получаем данные из схемы
    review_data = review.model_dump()

    # Создаем объект модели - поле называется 'text', а не 'comment'
    db_review = models.Review(
        rating=review_data.get('rating'),
        text=review_data.get('text'),  # Исправлено: используем правильное поле
        tool_id=tool_id,
        author_id=author_id
    )

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

    reviews = db.query(models.Review).filter(models.Review.tool_id == tool.id).order_by(
        desc(models.Review.created_at)
    ).options(joinedload(models.Review.author)).offset(skip).limit(limit).all()

    # Сериализуем отзывы в словари
    serialized_reviews = []
    for review in reviews:
        if review:
            review_dict = {
                "id": review.id,
                "rating": review.rating,
                "text": review.text,  # Переименовываем comment в text для фронтенда
                "created_at": review.created_at.isoformat() if review.created_at else None,
                "tool_id": review.tool_id,
                "author_id": review.author_id,
            }

            # Добавляем информацию об авторе если есть
            if hasattr(review, 'author') and review.author:
                review_dict["author"] = {
                    "id": review.author.id,
                    "email": review.author.email,
                }

            serialized_reviews.append(review_dict)

    return serialized_reviews


# --- CRUD ФУНКЦИИ ДЛЯ АНАЛИТИКИ ---

def create_page_view(db: Session, page_view: schemas.PageViewCreate, user_id: Optional[int] = None):
    """Создать запись о просмотре страницы."""
    db_page_view = models.PageView(
        path=page_view.path,
        user_agent=page_view.user_agent,
        ip_address=page_view.ip_address,
        referer=page_view.referer,
        language=page_view.language,
        user_id=user_id,
        tool_id=page_view.tool_id
    )
    db.add(db_page_view)
    db.commit()
    db.refresh(db_page_view)
    return db_page_view


def create_search_query(db: Session, search_query: schemas.SearchQueryCreate, user_id: Optional[int] = None):
    """Создать запись о поисковом запросе."""
    db_search_query = models.SearchQuery(
        query=search_query.query,
        results_count=search_query.results_count,
        language=search_query.language,
        user_id=user_id
    )
    db.add(db_search_query)
    db.commit()
    db.refresh(db_search_query)
    return db_search_query


def get_admin_stats(db: Session) -> dict:
    """Получить статистику для админ панели."""
    from datetime import datetime, timedelta
    from sqlalchemy import distinct, func
    
    today = datetime.now().date()
    
    # Общая статистика
    total_users = db.query(models.User).count()
    total_tools = db.query(models.Tool).count()
    total_reviews = db.query(models.Review).count()
    total_page_views = db.query(models.PageView).count()
    total_searches = db.query(models.SearchQuery).count()
    
    # Статистика за сегодня
    try:
        unique_visitors_today = db.query(distinct(models.PageView.ip_address)).filter(
            func.date(models.PageView.created_at) == today
        ).count()
    except:
        unique_visitors_today = 0
    
    # Пока просто ставим 0, так как у User нет created_at
    new_users_today = 0
    
    # Топ поисковых запросов
    try:
        top_search_queries = db.query(
            models.SearchQuery.query,
            func.count(models.SearchQuery.id).label('count')
        ).group_by(models.SearchQuery.query).order_by(
            desc(func.count(models.SearchQuery.id))
        ).limit(10).all()
        
        top_queries_list = [{"query": q.query, "count": q.count} for q in top_search_queries]
    except:
        top_queries_list = []
    
    # Популярные инструменты (по просмотрам)
    try:
        popular_tools = db.query(
            models.Tool.id,
            models.Tool.slug,
            func.count(models.PageView.id).label('views')
        ).join(
            models.PageView, models.Tool.id == models.PageView.tool_id
        ).group_by(
            models.Tool.id, models.Tool.slug
        ).order_by(
            desc(func.count(models.PageView.id))
        ).limit(10).all()
    except:
        popular_tools = []
    
    popular_tools_list = []
    for tool in popular_tools:
        tool_name = get_tool_name_by_id(db, tool.id)
        popular_tools_list.append({
            "id": tool.id,
            "slug": tool.slug,
            "name": tool_name,
            "views": tool.views
        })
    
    # Последние отзывы
    try:
        recent_reviews = get_reviews_recent(db, limit=5)
    except:
        recent_reviews = []
    
    # Статистика по дням (последние 30 дней)
    try:
        thirty_days_ago = today - timedelta(days=30)
        daily_stats = db.query(models.DailyStats).filter(
            models.DailyStats.date >= thirty_days_ago
        ).order_by(desc(models.DailyStats.date)).limit(30).all()
    except:
        daily_stats = []
    
    return {
        "total_users": total_users,
        "total_tools": total_tools,
        "total_reviews": total_reviews,
        "total_page_views": total_page_views,
        "total_searches": total_searches,
        "unique_visitors_today": unique_visitors_today,
        "new_users_today": new_users_today,
        "top_search_queries": top_queries_list,
        "popular_tools": popular_tools_list,
        "recent_reviews": recent_reviews,
        "daily_stats": [
            {
                "id": stat.id,
                "date": stat.date.isoformat(),
                "page_views": stat.page_views,
                "unique_visitors": stat.unique_visitors,
                "new_users": stat.new_users,
                "searches": stat.searches,
                "tool_views": stat.tool_views,
                "reviews_count": stat.reviews_count
            } for stat in daily_stats
        ]
    }


def get_tool_name_by_id(db: Session, tool_id: int, lang: str = "ru") -> str:
    """Получить название инструмента по ID."""
    tool = db.query(models.Tool).filter(models.Tool.id == tool_id).first()
    if not tool:
        return "Unknown Tool"
    
    populated_tool = _populate_tool_translation_details(tool, lang)
    return getattr(populated_tool, 'name', 'Unknown Tool')


def get_reviews_recent(db: Session, limit: int = 10):
    """Получить последние отзывы."""
    reviews = db.query(models.Review).order_by(
        desc(models.Review.created_at)
    ).options(joinedload(models.Review.author)).limit(limit).all()
    
    serialized_reviews = []
    for review in reviews:
        if review:
            review_dict = {
                "id": review.id,
                "rating": review.rating,
                "text": review.text,
                "created_at": review.created_at.isoformat() if review.created_at else None,
                "tool_id": review.tool_id,
                "author_id": review.author_id,
            }
            
            if hasattr(review, 'author') and review.author:
                review_dict["author"] = {
                    "id": review.author.id,
                    "email": review.author.email,
                }
            
            serialized_reviews.append(review_dict)
    
    return serialized_reviews


def is_user_admin(db: Session, user_id: int) -> bool:
    """Проверить, является ли пользователь администратором."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return user and user.is_admin


def update_daily_stats(db: Session):
    """Обновить ежедневную статистику."""
    from datetime import datetime
    from sqlalchemy import distinct, func
    
    today = datetime.now().date()
    
    # Проверяем, есть ли уже запись за сегодня
    existing_stat = db.query(models.DailyStats).filter(
        func.date(models.DailyStats.date) == today
    ).first()
    
    # Считаем статистику за сегодня
    page_views = db.query(models.PageView).filter(
        func.date(models.PageView.created_at) == today
    ).count()
    
    unique_visitors = db.query(distinct(models.PageView.ip_address)).filter(
        func.date(models.PageView.created_at) == today
    ).count()
    
    new_users = db.query(models.User).filter(
        func.date(models.User.id) == today
    ).count()
    
    searches = db.query(models.SearchQuery).filter(
        func.date(models.SearchQuery.created_at) == today
    ).count()
    
    tool_views = db.query(models.PageView).filter(
        func.date(models.PageView.created_at) == today,
        models.PageView.tool_id.isnot(None)
    ).count()
    
    reviews_count = db.query(models.Review).filter(
        func.date(models.Review.created_at) == today
    ).count()
    
    if existing_stat:
        # Обновляем существующую запись
        existing_stat.page_views = page_views
        existing_stat.unique_visitors = unique_visitors
        existing_stat.new_users = new_users
        existing_stat.searches = searches
        existing_stat.tool_views = tool_views
        existing_stat.reviews_count = reviews_count
    else:
        # Создаем новую запись
        daily_stat = models.DailyStats(
            date=datetime.now(),
            page_views=page_views,
            unique_visitors=unique_visitors,
            new_users=new_users,
            searches=searches,
            tool_views=tool_views,
            reviews_count=reviews_count
        )
        db.add(daily_stat)
    
    db.commit()