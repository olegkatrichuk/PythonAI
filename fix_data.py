# fix_data.py

from app.database import SessionLocal, engine
from app import crud, models, schemas

# Получаем сессию для работы с БД
db = SessionLocal()

print("Начинаем проверку целостности данных...")

# --- 1. Убедимся, что категория по умолчанию существует ---
default_cat_name = "Без категории"
default_category = crud.get_category_by_name(db, name=default_cat_name)

if not default_category:
    print(f"Создаем категорию по умолчанию: '{default_cat_name}'")
    default_category = crud.create_category(db, category=schemas.CategoryCreate(name=default_cat_name))
else:
    print(f"Категория по умолчанию '{default_cat_name}' уже существует.")

# --- 2. Найдем и исправим все инструменты без категории ---
print("Ищем инструменты без категорий...")
orphan_tools = db.query(models.Tool).filter(models.Tool.category_id == None).all()

if not orphan_tools:
    print("Отлично! Инструментов без категорий не найдено.")
else:
    print(f"Найдено {len(orphan_tools)} инструментов без категорий. Исправляем...")
    for tool in orphan_tools:
        print(f"  - Присваиваем категорию инструменту '{tool.name}' (ID: {tool.id})")
        tool.category_id = default_category.id

    # Сохраняем все изменения в базе данных
    db.commit()
    print("Все инструменты исправлены.")

# Закрываем сессию
db.close()

print("Проверка завершена!")