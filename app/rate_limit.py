"""
Rate limiting middleware для защиты API от перегрузок
"""

import os
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import redis.asyncio as redis
from typing import Optional
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

# Кастомный обработчик ошибок rate limiting
async def rate_limit_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Кастомный обработчик превышения лимитов"""
    response = JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "message": f"Превышен лимит запросов: {exc.detail}",
            "retry_after": exc.retry_after
        }
    )
    
    # Добавляем заголовки для клиента
    response.headers["Retry-After"] = str(exc.retry_after)
    response.headers["X-RateLimit-Limit"] = str(exc.limit.amount)
    response.headers["X-RateLimit-Remaining"] = str(max(0, exc.limit.amount - exc.hits))
    response.headers["X-RateLimit-Reset"] = str(exc.retry_after)
    
    return response

# Middleware для добавления заголовков rate limit
class RateLimitHeadersMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            async def send_wrapper(message):
                if message["type"] == "http.response.start":
                    headers = dict(message.get("headers", []))
                    
                    # Добавляем заголовки rate limiting (если доступны)
                    try:
                        # Эти заголовки будут добавлены slowapi автоматически
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
    READ_OPERATIONS_BURST = "50/10seconds"
    
    # Поиск (может быть ресурсозатратным)
    SEARCH_OPERATIONS = "60/minute"
    SEARCH_OPERATIONS_BURST = "10/10seconds"
    
    # Создание/изменение данных (строже лимиты)
    WRITE_OPERATIONS = "30/minute"
    WRITE_OPERATIONS_BURST = "5/10seconds"
    
    # Аутентификация (защита от брутфорса)
    AUTH_OPERATIONS = "10/minute"
    AUTH_OPERATIONS_BURST = "3/10seconds"
    
    # Загрузка файлов
    UPLOAD_OPERATIONS = "10/minute"
    UPLOAD_OPERATIONS_BURST = "2/10seconds"

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