# app/models.py

import enum
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class PricingModel(enum.Enum):
    FREE = "free"
    FREEMIUM = "freemium"
    PAID = "paid"
    TRIAL = "trial"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)

    tools = relationship("Tool", back_populates="owner")
    # ИЗМЕНЕНИЕ: Связь теперь с отзывами (Review)
    reviews = relationship("Review", back_populates="author", cascade="all, delete-orphan")


class Tool(Base):
    __tablename__ = "tools"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    url = Column(String, nullable=True)
    icon_url = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # ИЗМЕНЕНИЕ: Переименовываем 'rating' в 'average_rating' для ясности
    average_rating = Column(Float, default=0.0)
    review_count = Column(Integer, default=0)

    pricing_model = Column(SAEnum(PricingModel), nullable=False, default=PricingModel.FREE)
    platforms = Column(String, nullable=True)

    category_id = Column(Integer, ForeignKey("categories.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="tools")
    category = relationship("Category", back_populates="tools")
    translations = relationship("ToolTranslation", back_populates="tool", cascade="all, delete-orphan")
    # ИЗМЕНЕНИЕ: Связь теперь с отзывами (Review)
    reviews = relationship("Review", back_populates="tool", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    tools = relationship("Tool", back_populates="category")
    translations = relationship("CategoryTranslation", back_populates="category", cascade="all, delete-orphan")


# --- НОВАЯ МОДЕЛЬ ДЛЯ ОТЗЫВОВ ---
# Эта модель заменяет старую модель Comment
class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=True)  # Текст может быть необязательным
    rating = Column(Integer, nullable=False)  # Оценка от 1 до 5
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    tool = relationship("Tool", back_populates="reviews")
    author = relationship("User", back_populates="reviews")


# --- Вспомогательные таблицы переводов (без изменений) ---

class ToolTranslation(Base):
    __tablename__ = 'tool_translations'
    id = Column(Integer, primary_key=True, index=True)
    tool_id = Column(Integer, ForeignKey('tools.id'), nullable=False)
    language_code = Column(String(2), nullable=False)
    name = Column(String, index=True)
    description = Column(String)
    short_description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    tool = relationship("Tool", back_populates="translations")


class CategoryTranslation(Base):
    __tablename__ = 'category_translations'
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey('categories.id'), nullable=False)
    language_code = Column(String(2), nullable=False)
    name = Column(String, unique=True, index=True)
    category = relationship("Category", back_populates="translations")


# --- Модели для аналитики ---

class PageView(Base):
    __tablename__ = "page_views"
    id = Column(Integer, primary_key=True, index=True)
    path = Column(String, nullable=False, index=True)  # URL страницы
    user_agent = Column(String, nullable=True)  # User-Agent браузера
    ip_address = Column(String, nullable=True)  # IP адрес
    referer = Column(String, nullable=True)  # Откуда пришел пользователь
    language = Column(String(2), nullable=True)  # Язык
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Связь с пользователем (если авторизован)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User")
    
    # Связь с инструментом (если это страница инструмента)
    tool_id = Column(Integer, ForeignKey("tools.id"), nullable=True)
    tool = relationship("Tool")


class SearchQuery(Base):
    __tablename__ = "search_queries"
    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, nullable=False, index=True)  # Поисковый запрос
    results_count = Column(Integer, default=0)  # Количество найденных результатов
    language = Column(String(2), nullable=True)  # Язык поиска
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Связь с пользователем (если авторизован)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User")


class DailyStats(Base):
    __tablename__ = "daily_stats"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), nullable=False, index=True)  # Дата
    page_views = Column(Integer, default=0)  # Количество просмотров страниц
    unique_visitors = Column(Integer, default=0)  # Уникальные посетители
    new_users = Column(Integer, default=0)  # Новые пользователи
    searches = Column(Integer, default=0)  # Количество поисков
    tool_views = Column(Integer, default=0)  # Просмотры инструментов
    reviews_count = Column(Integer, default=0)  # Количество отзывов