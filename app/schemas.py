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