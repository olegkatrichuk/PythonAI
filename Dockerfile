# Используем стабильный образ Python
FROM python:3.13-slim

# Установка системных зависимостей, необходимых для psycopg2
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Отключаем буферизацию Python для корректного вывода логов
ENV PYTHONUNBUFFERED=1

# Копируем только файл с зависимостями для кэширования этого слоя
COPY requirements.txt .

# Устанавливаем зависимости из одного источника
# --no-cache-dir гарантирует чистую установку без кэша pip
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код приложения
COPY . .

# Указываем порт, который слушает приложение
EXPOSE 8000

# Команда для запуска ТОЛЬКО веб-сервера. Миграции будут выполняться отдельно.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
