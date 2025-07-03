# app/security.py

from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

# --- Ваши импорты, которые мы сохраняем ---
from .config import settings
from . import models

# --- Ваши настройки, которые мы сохраняем ---
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# --- ИСПРАВЛЕНИЕ: Явно настраиваем контекст, чтобы решить проблему с bcrypt ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет, соответствует ли обычный пароль хэшированному."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Возвращает хэш для заданного пароля."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Создает новый токен доступа."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# --- ДОБАВЛЕНА НЕДОСТАЮЩАЯ ФУНКЦИЯ ---
def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    """
    Находит пользователя по email и проверяет его пароль.
    Возвращает объект пользователя в случае успеха, иначе None.
    """
    # Находим пользователя в базе данных по email
    user = db.query(models.User).filter(models.User.email == email).first()

    # Если пользователь не найден, возвращаем None
    if not user:
        return None

    # Если пользователь найден, проверяем его пароль
    if not verify_password(password, user.hashed_password):
        return None

    # Если пароль верный, возвращаем пользователя
    return user