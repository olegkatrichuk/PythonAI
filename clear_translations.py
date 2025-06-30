# clear_translations.py

import sys
from pathlib import Path
from sqlalchemy.orm import Session

# Та же логика для корректного импорта, что и в прошлом скрипте
sys.path.append(str(Path(__file__).resolve().parent))
from app.database import SessionLocal
from app import models


def clear_category_translations():
    """
    Полностью очищает таблицу category_translations.
    """

    # --- БЕЗОПАСНОСТЬ: Запрос подтверждения ---
    confirmation = input(
        "Вы уверены, что хотите удалить ВСЕ записи из таблицы 'category_translations'? "
        "Это действие необратимо. (y/n): "
    )

    # --- ИСПРАВЛЕННАЯ ЛОГИКА ПРОВЕРКИ ---
    # Добавлен .strip() для удаления случайных пробелов
    if confirmation.lower().strip() != 'y':
        print("Операция отменена.")
        return
    # --- КОНЕЦ ИСПРАВЛЕНИЯ ---

    db: Session = SessionLocal()
    print("\nПодключение к базе данных установлено...")

    try:
        # Эффективный способ удалить все записи из таблицы
        num_deleted_rows = db.query(models.CategoryTranslation).delete(synchronize_session=False)
        db.commit()
        print(f"Успешно удалено {num_deleted_rows} записей из таблицы 'category_translations'.")
    except Exception as e:
        print(f"Произошла ошибка при удалении: {e}")
        db.rollback()
    finally:
        db.close()
        print("Работа скрипта завершена.")


if __name__ == "__main__":
    clear_category_translations()