# seed_users.py

import secrets
import string
import sys
from pathlib import Path
import os

# Добавляем корневую папку проекта в путь для корректного импорта
# Убедитесь, что путь '..' действительно указывает на корень вашего проекта
sys.path.append(str(Path(__file__).resolve().parent.parent))

# Импортируем все необходимое из нашего приложения
from app.database import SessionLocal
from app.schemas import UserCreate
from app.crud import create_user, get_user_by_email
from sqlalchemy.orm import Session

# --- Определение учетных данных администратора ---
# Получаем из переменных окружения или используем значения по умолчанию
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "securepassword123")


# --- СПИСОК ПОЛЬЗОВАТЕЛЕЙ ДЛЯ СОЗДАНИЯ ---
USERS_TO_CREATE = [
    "alice.dev@example.com", "bob.tester@example.com", "charlie.pm@example.com",
    "diana.designer@example.com", "eva.analyst@example.com", "frank.data@example.com",
    "grace.ux@example.com", "henry.security@example.com", "isabel.infra@example.com",
    "jack.mobile@example.com", "karen.hr@example.com", "leo.support@example.com",
    "mona.research@example.com", "nick.devops@example.com", "olivia.product@example.com",
    "peter.sales@example.com", "quinn.qa@example.com", "rachel.backend@example.com",
    "sam.frontend@example.com", "tina.marketing@example.com", "uma.docs@example.com",
    "victor.seo@example.com", "wendy.api@example.com", "xavier.ml@example.com",
    "yara.ops@example.com",
]


def generate_secure_password(length: int = 12) -> str:
    """Генерирует случайный и криптографически надежный пароль."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    while True:
        password = ''.join(secrets.choice(alphabet) for _ in range(length))
        if (any(c.islower() for c in password)
                and any(c.isupper() for c in password)
                and any(c.isdigit() for c in password)
                and any(c in string.punctuation for c in password)):
            return password


def seed_data():
    """
    Основная функция для заполнения базы данных пользователями и администратором.
    """
    db: Session = SessionLocal()
    print("Начинаем заполнение базы данных...")

    try:
        # 1. Создание обычных пользователей
        print("\n--- Создание обычных пользователей ---")
        users_created_count = 0
        for email in USERS_TO_CREATE:
            if not get_user_by_email(db, email=email):
                new_password = generate_secure_password()
                user_schema = UserCreate(email=email, password=new_password)
                create_user(db=db, user=user_schema)
                print(f"Пользователь {email} создан.")
                users_created_count += 1
            else:
                print(f"Пользователь {email} уже существует. Пропускаем.")
        print(f"--> Обычных пользователей создано: {users_created_count}.")

        # 2. Создание или обновление администратора
        print("\n--- Создание/обновление администратора ---")
        admin_user = get_user_by_email(db, email=ADMIN_EMAIL)
        if not admin_user:
            # Если админа нет, создаем его
            admin_schema = UserCreate(email=ADMIN_EMAIL, password=ADMIN_PASSWORD)
            admin_user = create_user(db=db, user=admin_schema)
            print(f"Администратор {ADMIN_EMAIL} создан.")

        # Устанавливаем флаг is_admin в True
        if not admin_user.is_admin:
            admin_user.is_admin = True
            db.commit()
            print(f"Пользователю {ADMIN_EMAIL} предоставлены права администратора.")
        else:
            print(f"Пользователь {ADMIN_EMAIL} уже является администратором.")

        print("\n" + "=" * 50)
        print("Процесс заполнения базы данных успешно завершен.")
        print(f"Администратор: {ADMIN_EMAIL} | Пароль: {ADMIN_PASSWORD}")
        print("=" * 50)

    except Exception as e:
        print(f"\nПроизошла непредвиденная ошибка: {e}")
        db.rollback()  # Откатываем изменения в случае ошибки
    finally:
        db.close()
        print("\nСоединение с базой данных закрыто.")


if __name__ == "__main__":
    # Этот скрипт предполагает, что таблицы уже созданы через Alembic.
    # Строка Base.metadata.create_all(bind=engine) удалена,
    # так как управление схемой должно происходить через миграции.
    seed_data()
