# Используем стабильный образ Python
FROM python:3.13-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Копируем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код приложения
COPY . .

# Копируем наш новый скрипт и делаем его исполняемым
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Указываем, что наш скрипт будет точкой входа
ENTRYPOINT ["entrypoint.sh"]

# Указываем порт
EXPOSE 8000

# Команда по умолчанию, которая будет передана в entrypoint.sh
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

