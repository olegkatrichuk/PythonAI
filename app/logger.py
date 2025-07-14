# app/logger.py
import logging
import sys
from datetime import datetime
from typing import Optional

# Настройка логирования
def setup_logger(name: str = "app", level: str = "INFO") -> logging.Logger:
    """Настраивает централизованный логгер для приложения."""
    
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, level.upper()))
    
    # Избегаем дублирования handlers
    if logger.handlers:
        return logger
    
    # Создаем форматтер
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler для более подробных логов
    file_handler = logging.FileHandler('app.log')
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    return logger

# Глобальный логгер для всего приложения
logger = setup_logger()

def log_error(message: str, error: Optional[Exception] = None, user_id: Optional[int] = None):
    """Логирует ошибки с дополнительным контекстом."""
    extra_info = []
    if user_id:
        extra_info.append(f"user_id={user_id}")
    if error:
        extra_info.append(f"error_type={type(error).__name__}")
    
    log_message = f"{message}"
    if extra_info:
        log_message += f" | {' | '.join(extra_info)}"
    
    if error:
        logger.error(log_message, exc_info=True)
    else:
        logger.error(log_message)

def log_info(message: str, user_id: Optional[int] = None):
    """Логирует информационные сообщения."""
    if user_id:
        message += f" | user_id={user_id}"
    logger.info(message)

def log_warning(message: str, user_id: Optional[int] = None):
    """Логирует предупреждения."""
    if user_id:
        message += f" | user_id={user_id}"
    logger.warning(message)