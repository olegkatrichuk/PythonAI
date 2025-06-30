# app/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase # <-- ИЗМЕНЕНИЕ: Импортируем DeclarativeBase
from .config import settings

engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# --- ГЛАВНОЕ ИСПРАВЛЕНИЕ: Создаем Base современным способом ---
# Вместо Base = declarative_base() мы создаем класс, который наследуется от DeclarativeBase.
# Это более надежный и рекомендуемый подход в SQLAlchemy 2.0.
class Base(DeclarativeBase):
    pass

# Эта функция будет создавать и закрывать сессию БД для каждого запроса
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()