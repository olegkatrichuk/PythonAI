# app/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Указываем pydantic, что нужно прочитать переменные из .env файла
    model_config = SettingsConfigDict(env_file=".env", extra='ignore')

    # Перечисляем наши переменные с их типами
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    DATABASE_URL: str
    gemini_api_key: Optional[str] = None
    FRONTEND_URL: str = "http://localhost:3000"
    ENVIRONMENT: str = "development"

# Создаем единственный экземпляр настроек, который будем импортировать в других файлах
settings = Settings()