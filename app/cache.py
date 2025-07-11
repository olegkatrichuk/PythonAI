"""
Redis кэширование для оптимизации производительности API
"""

import json
import redis.asyncio as redis
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import os
import logging
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

class RedisCache:
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        self.redis_client: Optional[redis.Redis] = None
        self.default_ttl = 300  # 5 минут по умолчанию
        
    async def connect(self):
        """Подключение к Redis"""
        try:
            self.redis_client = redis.from_url(
                self.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            # Проверяем подключение
            await self.redis_client.ping()
            logger.info("✅ Redis подключен успешно")
        except Exception as e:
            logger.warning(f"⚠️ Redis недоступен: {e}. Работаем без кэша")
            self.redis_client = None
    
    async def disconnect(self):
        """Отключение от Redis"""
        if self.redis_client:
            await self.redis_client.close()
            logger.info("Redis отключен")
    
    @asynccontextmanager
    async def get_client(self):
        """Контекстный менеджер для безопасной работы с Redis"""
        if not self.redis_client:
            yield None
            return
        
        try:
            yield self.redis_client
        except Exception as e:
            logger.error(f"Ошибка Redis: {e}")
            yield None
    
    async def get(self, key: str) -> Optional[Any]:
        """Получить значение из кэша"""
        async with self.get_client() as client:
            if not client:
                return None
            
            try:
                value = await client.get(key)
                if value:
                    return json.loads(value)
                return None
            except Exception as e:
                logger.error(f"Ошибка чтения кэша {key}: {e}")
                return None
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Сохранить значение в кэш"""
        async with self.get_client() as client:
            if not client:
                return False
            
            try:
                ttl = ttl or self.default_ttl
                serialized_value = json.dumps(value, ensure_ascii=False, default=str)
                await client.setex(key, ttl, serialized_value)
                return True
            except Exception as e:
                logger.error(f"Ошибка записи кэша {key}: {e}")
                return False
    
    async def delete(self, key: str) -> bool:
        """Удалить ключ из кэша"""
        async with self.get_client() as client:
            if not client:
                return False
            
            try:
                await client.delete(key)
                return True
            except Exception as e:
                logger.error(f"Ошибка удаления кэша {key}: {e}")
                return False
    
    async def delete_pattern(self, pattern: str) -> int:
        """Удалить все ключи по паттерну"""
        async with self.get_client() as client:
            if not client:
                return 0
            
            try:
                keys = await client.keys(pattern)
                if keys:
                    return await client.delete(*keys)
                return 0
            except Exception as e:
                logger.error(f"Ошибка удаления по паттерну {pattern}: {e}")
                return 0
    
    async def invalidate_tools_cache(self):
        """Инвалидация всего кэша инструментов"""
        patterns = [
            "tools:*",
            "tool:*", 
            "categories:*",
            "tool_count:*"
        ]
        
        total_deleted = 0
        for pattern in patterns:
            deleted = await self.delete_pattern(pattern)
            total_deleted += deleted
        
        logger.info(f"Инвалидирован кэш: удалено {total_deleted} ключей")
        return total_deleted

# Глобальный экземпляр кэша
cache = RedisCache()

# Вспомогательные функции для кэширования инструментов
async def get_cached_tools(
    language: str = "ru",
    category_slug: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> Optional[List[Dict]]:
    """Получить кэшированный список инструментов"""
    cache_key = f"tools:{language}:{category_slug or 'all'}:{skip}:{limit}"
    return await cache.get(cache_key)

async def cache_tools(
    tools: List[Dict],
    language: str = "ru", 
    category_slug: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    ttl: int = 300
) -> bool:
    """Кэшировать список инструментов"""
    cache_key = f"tools:{language}:{category_slug or 'all'}:{skip}:{limit}"
    return await cache.set(cache_key, tools, ttl)

async def get_cached_tool(tool_slug: str, language: str = "ru") -> Optional[Dict]:
    """Получить кэшированный инструмент"""
    cache_key = f"tool:{tool_slug}:{language}"
    return await cache.get(cache_key)

async def cache_tool(tool: Dict, tool_slug: str, language: str = "ru", ttl: int = 600) -> bool:
    """Кэшировать инструмент"""
    cache_key = f"tool:{tool_slug}:{language}"
    return await cache.set(cache_key, tool, ttl)

async def get_cached_categories(language: str = "ru") -> Optional[List[Dict]]:
    """Получить кэшированные категории"""
    cache_key = f"categories:{language}"
    return await cache.get(cache_key)

async def cache_categories(categories: List[Dict], language: str = "ru", ttl: int = 600) -> bool:
    """Кэшировать категории"""
    cache_key = f"categories:{language}"
    return await cache.set(cache_key, categories, ttl)

async def get_cached_tool_count(category_slug: Optional[str] = None) -> Optional[int]:
    """Получить кэшированное количество инструментов"""
    cache_key = f"tool_count:{category_slug or 'all'}"
    return await cache.get(cache_key)

async def cache_tool_count(count: int, category_slug: Optional[str] = None, ttl: int = 300) -> bool:
    """Кэшировать количество инструментов"""
    cache_key = f"tool_count:{category_slug or 'all'}"
    return await cache.set(cache_key, count, ttl)