import os
import time
from math import ceil
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.requests import Request
from starlette.responses import JSONResponse
import redis.asyncio as redis
import logging

logger = logging.getLogger(__name__)


# Функция для получения идентификатора клиента
def get_client_id(request: Request) -> str:
    """
    Получает идентификатор клиента для rate limiting.
    Приоритет: API ключ -> User ID -> IP адрес
    """
    # 1. Проверяем API ключ в заголовках
    api_key = request.headers.get("X-API-Key")
    if api_key:
        return f"api_key:{api_key}"

    # 2. Проверяем авторизованного пользователя
    user = getattr(request.state, "user", None)
    if user and hasattr(user, "id"):
        return f"user:{user.id}"

    # 3. Используем IP адрес как fallback
    return f"ip:{get_remote_address(request)}"


# Настройка Redis backend для rate limiting
def get_redis_storage():
    """Создает Redis storage для rate limiting"""
    try:
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/1")  # Используем БД 1 для rate limiting
        return f"redis://{redis_url.split('://')[1]}"
    except Exception as e:
        logger.warning(f"Redis недоступен для rate limiting: {e}")
        return "memory://"  # Fallback на in-memory storage


# Создаем limiter с Redis backend
limiter = Limiter(
    key_func=get_client_id,
    storage_uri=get_redis_storage(),
    default_limits=["1000/hour", "100/minute"]  # Общие лимиты по умолчанию
)


# ИСПРАВЛЕНО: Кастомный обработчик ошибок rate limiting
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Кастомный обработчик превышения лимитов"""

    retry_after_seconds = 60  # Значение по умолчанию, если не удастся определить точное время

    # Пытаемся извлечь время из текстового описания лимита (e.g., "10 per 15 second")
    # Это исправляет ошибку 'RateLimitExceeded' object has no attribute 'failed_limit'
    try:
        parts = exc.detail.split(" ")
        if len(parts) >= 4 and parts[1] == "per":
            value = int(parts[2])
            unit = parts[3].lower()
            if "second" in unit:
                retry_after_seconds = value
            elif "minute" in unit:
                retry_after_seconds = value * 60
            elif "hour" in unit:
                retry_after_seconds = value * 3600
            elif "day" in unit:
                retry_after_seconds = value * 86400
    except (ValueError, IndexError):
        # Если не удалось разобрать строку, используем значение по умолчанию.
        pass

    response = JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": f"Превышен лимит запросов: {exc.detail}",
            "retry_after": retry_after_seconds
        }
    )

    # Добавляем стандартный заголовок для клиента
    response.headers["Retry-After"] = str(retry_after_seconds)

    return response


# Middleware для добавления заголовков rate limit
class RateLimitHeadersMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    try:
                        # slowapi автоматически добавляет заголовки при успешном ответе,
                        # поэтому здесь дополнительная логика не требуется.
                        pass
                    except Exception:
                        pass

                await send(message)

            await self.app(scope, receive, send_wrapper)
        else:
            await self.app(scope, receive, send)


# Конфигурация лимитов для разных типов операций
class RateLimits:
    # Чтение данных (более щадящие лимиты)
    READ_OPERATIONS = "200/minute"
    READ_OPERATIONS_BURST = "50/15seconds"

    # Поиск (может быть ресурсозатратным)
    SEARCH_OPERATIONS = "60/minute"
    SEARCH_OPERATIONS_BURST = "10/15seconds"

    # Создание/изменение данных (строже лимиты)
    WRITE_OPERATIONS = "30/minute"
    WRITE_OPERATIONS_BURST = "5/15seconds"

    # Аутентификация (защита от брутфорса)
    AUTH_OPERATIONS = "10/minute"
    AUTH_OPERATIONS_BURST = "3/15seconds"

    # Загрузка файлов
    UPLOAD_OPERATIONS = "10/minute"
    UPLOAD_OPERATIONS_BURST = "2/15seconds"

    # Аналитика (более высокие лимиты для tracking)
    ANALYTICS_OPERATIONS = "100/minute"
    ANALYTICS_OPERATIONS_BURST = "20/15seconds"


# Вспомогательные функции для применения лимитов
def apply_read_limit():
    """Декоратор для endpoints чтения"""
    return limiter.limit(f"{RateLimits.READ_OPERATIONS};{RateLimits.READ_OPERATIONS_BURST}")


def apply_search_limit():
    """Декоратор для endpoints поиска"""
    return limiter.limit(f"{RateLimits.SEARCH_OPERATIONS};{RateLimits.SEARCH_OPERATIONS_BURST}")


def apply_write_limit():
    """Декоратор для endpoints записи"""
    return limiter.limit(f"{RateLimits.WRITE_OPERATIONS};{RateLimits.WRITE_OPERATIONS_BURST}")


def apply_auth_limit():
    """Декоратор для endpoints аутентификации"""
    return limiter.limit(f"{RateLimits.AUTH_OPERATIONS};{RateLimits.AUTH_OPERATIONS_BURST}")


def apply_upload_limit():
    """Декоратор для endpoints загрузки"""
    return limiter.limit(f"{RateLimits.UPLOAD_OPERATIONS};{RateLimits.UPLOAD_OPERATIONS_BURST}")


def apply_analytics_limit():
    """Декоратор для analytics endpoints"""
    return limiter.limit(f"{RateLimits.ANALYTICS_OPERATIONS};{RateLimits.ANALYTICS_OPERATIONS_BURST}")


# Функция для получения статистики rate limiting
async def get_rate_limit_stats() -> dict:
    """Получает статистику rate limiting для клиента"""
    try:
        # Подключаемся к Redis для получения статистики
        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/1")
        redis_client = redis.from_url(redis_url, decode_responses=True)

        # Получаем общие ключи rate limiting
        keys = await redis_client.keys("LIMITER*")

        stats = {
            "total_keys": len(keys),
            "redis_connected": True,
            "limits": []
        }

        for key in keys:
            try:
                ttl = await redis_client.ttl(key)
                value = await redis_client.get(key)
                stats["limits"].append({
                    "key": key,
                    "current_count": value,
                    "reset_in": ttl
                })
            except Exception:
                continue

        await redis_client.close()
        return stats

    except Exception as e:
        logger.error(f"Ошибка получения статистики rate limiting: {e}")
        return {"error": "Unable to fetch rate limit stats"}