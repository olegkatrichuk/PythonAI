# seed_users.py

import secrets
import string
import sys
from pathlib import Path

# Добавляем корневую папку проекта в путь для корректного импорта
sys.path.append(str(Path(__file__).resolve().parent))

# Импортируем все необходимое из нашего приложения
from app.database import SessionLocal, engine
from app.schemas import UserCreate
from app.crud import create_user, get_user_by_email
from app.models import Base  # Импортируем Base для создания таблиц
from sqlalchemy.orm import Session

# --- СПИСОК ПОЛЬЗОВАТЕЛЕЙ ДЛЯ СОЗДАНИЯ ---
# Теперь здесь 25 пользователей
USERS_TO_CREATE = [
    # Старые пользователи
    "alice.dev@example.com",
    "bob.tester@example.com",
    "charlie.pm@example.com",
    "diana.designer@example.com",
    "eva.analyst@example.com",
    # Новые 20 пользователей
    "frank.data@example.com",
    "grace.ux@example.com",
    "henry.security@example.com",
    "isabel.infra@example.com",
    "jack.mobile@example.com",
    "karen.hr@example.com",
    "leo.support@example.com",
    "mona.research@example.com",
    "nick.devops@example.com",
    "olivia.product@example.com",
    "peter.sales@example.com",
    "quinn.qa@example.com",
    "rachel.backend@example.com",
    "sam.frontend@example.com",
    "tina.marketing@example.com",
    "uma.docs@example.com",
    "victor.seo@example.com",
    "wendy.api@example.com",
    "xavier.ml@example.com",
    "yara.ops@example.com",
]


def generate_secure_password(length: int = 12) -> str:
    """Генерирует случайный и криптографически надежный пароль."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    # Убедимся, что пароль содержит хотя бы по одному символу каждого типа
    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        if (any(c.islower() for c in password)
                and any(c.isupper() for c in password)
                and any(c.isdigit() for c in password)
                and any(c in string.punctuation for c in password)):
            return password


def seed_users():
    """
    Основная функция для заполнения базы данных тестовыми пользователями.
    """
    db: Session = SessionLocal()
    print("Начинаем добавление пользователей в базу данных...")

    users_created_count = 0
    try:
        print("\n--- Созданные пользователи и их пароли (сохраните их!) ---")
        for email in USERS_TO_CREATE:
            db_user = get_user_by_email(db, email=email)
            if db_user:
                print(f"Пользователь {email} уже существует. Пропускаем.")
                continue

            new_password = generate_secure_password()
            user_schema = UserCreate(
                email=email,
                password=new_password
            )
            create_user(db=db, user=user_schema)

            print(f"Email: {email:<30} | Пароль: {new_password}")
            users_created_count += 1

        print("-" * 60)
        print(f"Процесс завершен. Всего создано новых пользователей: {users_created_count}.")

    except Exception as e:
        print(f"Произошла непредвиденная ошибка: {e}")
    finally:
        db.close()
        print("Соединение с базой данных закрыто.")


if __name__ == "__main__":
    # Убедимся, что таблицы существуют перед запуском
    print("Проверка и создание таблиц в базе данных...")
    Base.metadata.create_all(bind=engine)

    seed_users()
