#!/bin/sh

# Выход из скрипта при любой ошибке
set -e

# 1. Применяем миграции базы данных
echo "Applying database migrations..."
alembic upgrade head

# 2. Запускаем основной процесс (веб-сервер)
# exec "$@" означает "заменить этот скрипт на команду,
# переданную в CMD в Dockerfile"
echo "Starting the main application..."
exec "$@"