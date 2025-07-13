# app/schemas.py

import datetime
from typing import List, Optional

# ИЗМЕНЕНИЕ: Добавляем 'validator' в импорт
from pydantic import BaseModel, ConfigDict, Field, validator
import bleach

# Импортируем наш Enum из моделей
from .models import PricingModel


# --- СХЕМЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ---

class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str
    
    @validator('email', pre=True, always=True)
    def sanitize_email(cls, value):
        if not value:
            raise ValueError('Email is required')
        # Удаляем пробелы и приводим к нижнему регистру
        cleaned_email = value.strip().lower()
        # Базовая проверка формата email
        if '@' not in cleaned_email or '.' not in cleaned_email.split('@')[1]:
            raise ValueError('Invalid email format')
        # Удаляем потенциально опасные символы
        cleaned_email = bleach.clean(cleaned_email, tags=[], strip=True)
        return cleaned_email
    
    @validator('password', pre=True, always=True) 
    def sanitize_password(cls, value):
        if not value:
            raise ValueError('Password is required')
        if len(value) < 8:
            raise ValueError('Password must be at least 8 characters long')
        # Удаляем HTML теги из пароля, но сохраняем спецсимволы
        return bleach.clean(value, tags=[], strip=True)


class User(UserBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


# Эта схема используется для отображения автора в отзыве
class UserInComment(BaseModel):
    id: int
    email: str
    model_config = ConfigDict(from_attributes=True)


# --- НОВЫЕ СХЕМЫ ДЛЯ ОТЗЫВОВ ---

class ReviewBase(BaseModel):
    rating: int = Field(..., gt=0, le=5)  # Оценка от 1 до 5 (обязательно)
    text: Optional[str] = None  # Текст отзыва (необязательно)

    @validator('text', pre=True, always=True)
    def sanitize_text_if_present(cls, value):
        if value is None:
            return None
        stripped_value = value.strip()
        if not stripped_value:
            return None  # Разрешаем пустой текст после очистки

        cleaned_value = bleach.clean(
            stripped_value,
            tags=['b', 'i', 'strong', 'em'],
            strip=True
        )
        return cleaned_value


class ReviewCreate(ReviewBase):
    pass


class Review(ReviewBase):
    id: int
    created_at: datetime.datetime
    author: UserInComment
    model_config = ConfigDict(from_attributes=True)


# --- СХЕМЫ ДЛЯ КАТЕГОРИЙ ---

class CategoryTranslationBase(BaseModel):
    name: str


class CategoryTranslationCreate(CategoryTranslationBase):
    language_code: str


class CategoryCreate(BaseModel):
    translations: List[CategoryTranslationCreate]


class Category(BaseModel):
    id: int
    name: str
    slug: str
    model_config = ConfigDict(from_attributes=True)


# --- СХЕМЫ ДЛЯ ИНСТРУМЕНТОВ ---

class ToolTranslationBase(BaseModel):
    name: str
    description: Optional[str] = None
    short_description: Optional[str] = None


class ToolTranslationCreate(ToolTranslationBase):
    language_code: str


class Tool(BaseModel):
    id: int
    url: Optional[str] = None
    slug: str
    icon_url: Optional[str] = None
    is_featured: bool
    created_at: datetime.datetime
    owner_id: int

    name: str
    description: Optional[str] = None
    short_description: Optional[str] = None
    category: Category

    # --- ИЗМЕНЕНИЕ ЗДЕСЬ ---
    # Добавляем значения по умолчанию, чтобы избежать ошибок валидации,
    # если из базы приходит None.
    average_rating: float = 0.0
    review_count: int = 0

    pricing_model: PricingModel
    platforms: Optional[List[str]] = []

    reviews: List[Review] = []

    model_config = ConfigDict(from_attributes=True)


class ToolCreate(BaseModel):
    url: Optional[str] = None
    icon_url: Optional[str] = None
    is_featured: bool = False
    category_id: int
    translations: List[ToolTranslationCreate]
    pricing_model: PricingModel
    platforms: Optional[List[str]] = None


class ToolPage(BaseModel):
    items: List[Tool]
    total: int
    model_config = ConfigDict(from_attributes=True)


# --- СХЕМЫ ДЛЯ АУТЕНТИФИКАЦИИ ---

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# --- СХЕМЫ ДЛЯ АНАЛИТИКИ ---

class PageViewCreate(BaseModel):
    path: str
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    referer: Optional[str] = None
    language: Optional[str] = None
    tool_id: Optional[int] = None


class PageView(BaseModel):
    id: int
    path: str
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    referer: Optional[str] = None
    language: Optional[str] = None
    created_at: datetime.datetime
    user_id: Optional[int] = None
    tool_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


class SearchQueryCreate(BaseModel):
    query: str
    results_count: int = 0
    language: Optional[str] = None


class SearchQuery(BaseModel):
    id: int
    query: str
    results_count: int
    language: Optional[str] = None
    created_at: datetime.datetime
    user_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)


class DailyStats(BaseModel):
    id: int
    date: datetime.datetime
    page_views: int
    unique_visitors: int
    new_users: int
    searches: int
    tool_views: int
    reviews_count: int
    model_config = ConfigDict(from_attributes=True)


class AdminStats(BaseModel):
    total_users: int
    total_tools: int
    total_reviews: int
    total_page_views: int
    total_searches: int
    unique_visitors_today: int
    new_users_today: int
    top_search_queries: List[dict]
    popular_tools: List[dict]
    recent_reviews: List[Review]
    daily_stats: List[DailyStats]


class UserWithAdmin(User):
    is_admin: bool = False