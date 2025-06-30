# app/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Указываем pydantic, что нужно прочитать переменные из .env файла
    model_config = SettingsConfigDict(env_file=".env")

    # Перечисляем наши переменные с их типами
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    DATABASE_URL: str

# Создаем единственный экземпляр настроек, который будем импортировать в других файлах
settings = Settings()