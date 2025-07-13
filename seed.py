# seed.py

import sys
import json
import random
from pathlib import Path
from sqlalchemy.orm import Session
from slugify import slugify

# --- Настройка путей для импорта ---
sys.path.append(str(Path(__file__).resolve().parent))
from app.database import SessionLocal, engine
from app import models
from app.models import Base  # Импортируем Base для создания таблиц

# --- 1. КОНФИГУРАЦИЯ КАТЕГОРИЙ (ВАЖНО!) ---
CATEGORIES_CONFIG =  {
    "Генерация текста": {"en": "Text Generation", "uk": "Генерація тексту",
                         "keywords": ["text", "writing", "copywriting", "gpt", "llm", "translator"]},
    "Генерация изображений": {"en": "Image Generation", "uk": "Генерація зображень",
                              "keywords": ["image", "art", "photo", "diffusion", "imaging", "picture", "logo"]},
    "Работа с кодом": {"en": "Code Assistant", "uk": "Робота з кодом",
                       "keywords": ["code", "developer", "github", "programming", "api"]},
    "Видео и Аудио": {"en": "Video & Audio", "uk": "Відео та Аудіо",
                      "keywords": ["video", "audio", "music", "speech", "voice", "sound", "editing", "avatars"]},
    "Продуктивность": {"en": "Productivity", "uk": "Продуктивність",
                       "keywords": ["productivity", "notes", "assistant", "automation", "business"]},
    "Дизайн и 3D": {"en": "Design & 3D", "uk": "Дизайн та 3D",
                    "keywords": ["design", "3d", "ui", "ux", "color", "website"]},
    "Бизнес и Аналитика": {"en": "Business & Analytics", "uk": "Бізнес та Аналітика",
                           "keywords": ["business", "analytics", "data", "finance", "marketing"]},
    "Прочее": {"en": "Other", "uk": "Інше", "keywords": []}
}


# --- Вспомогательная функция для определения категории ---
def map_tool_to_category(tool_tags: list) -> str:
    tool_tags_lower = [tag.lower() for tag in tool_tags]
    for category_ru, config in CATEGORIES_CONFIG.items():
        for keyword in config["keywords"]:
            if any(keyword in tag for tag in tool_tags_lower):
                return category_ru
    return "Прочее"


# --- Основная логика ---
def seed_database(force: bool = False):
    db: Session = SessionLocal()

    if not force:
        confirmation = input(
            "Вы уверены, что хотите ОЧИСТИТЬ и перезаполнить ИНСТРУМЕНТЫ и КАТЕГОРИИ? (y/n): "
        )
        if confirmation.lower().strip() != 'y':
            print("Операция отменена.")
            db.close()
            return
    else:
        print("Запуск в принудительном режиме (--force). Пропускаем подтверждение.")

    try:
        # --- ИСПРАВЛЕНИЕ: Изменен порядок удаления ---
        print("Очистка старых инструментов, комментариев и категорий...")
        # Сначала удаляем зависимые записи
        db.query(models.Review).delete()
        db.query(models.ToolTranslation).delete()
        # Теперь можно удалять основные записи
        db.query(models.Tool).delete()
        db.query(models.CategoryTranslation).delete()
        db.query(models.Category).delete()
        db.commit()
        print("Старые данные (кроме пользователей) удалены.")

        print("\nНачинаем заполнение базы...")

        # Создание категорий
        created_categories = {}
        print("  Создание категорий...")
        for ru_name, config in CATEGORIES_CONFIG.items():
            new_category = models.Category()
            db.add(new_category)
            created_categories[ru_name] = new_category
        db.flush()
        for ru_name, category_obj in created_categories.items():
            config = CATEGORIES_CONFIG[ru_name]
            db.add(models.CategoryTranslation(category_id=category_obj.id, language_code='ru', name=ru_name))
            db.add(models.CategoryTranslation(category_id=category_obj.id, language_code='en', name=config['en']))
            db.add(models.CategoryTranslation(category_id=category_obj.id, language_code='uk', name=config['uk']))
        print("    -> Категории успешно добавлены в сессию.")

        # Получаем всех пользователей для случайного назначения
        all_users = db.query(models.User).all()
        if not all_users:
            print("[ОШИБКА] В базе нет пользователей. Сначала запустите seed_users.py.")
            db.rollback()
            return

        # Загрузка инструментов из файла
        tools_file_path = Path(__file__).resolve().parent / 'data' / 'tools.json'
        print(f"\nЗагрузка инструментов из файла {tools_file_path}...")
        with open(tools_file_path, 'r', encoding='utf-8') as f:
            tools_to_process = json.load(f)
        print(f"Успешно загружено {len(tools_to_process)} инструментов.")

        print("\nОбработка и добавление инструментов...")
        for tool_data in tools_to_process:
            name = tool_data.get('name')
            if not name:
                continue

            category_ru_name = map_tool_to_category(tool_data.get('tags', []))
            category_obj = created_categories.get(category_ru_name, created_categories["Прочее"])

            base_slug = slugify(name)
            unique_slug = base_slug
            counter = 1
            while db.query(models.Tool).filter(models.Tool.slug == unique_slug).first():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1

            pricing_model_str = tool_data.get('pricing_model', 'free')
            try:
                pricing_model_enum = models.PricingModel[pricing_model_str.upper()]
            except KeyError:
                print(
                    f"  [ПРЕДУПРЕЖДЕНИЕ] Неверная модель цены '{pricing_model_str}' для '{name}'. Установлено 'free'.")
                pricing_model_enum = models.PricingModel.FREE

            # ИЗМЕНЕНИЕ: Добавляем обработку платформ
            platforms_list = tool_data.get('platforms', [])
            platforms_str = ",".join(platforms_list) if platforms_list else None

            new_tool = models.Tool(
                slug=unique_slug,
                url=tool_data.get('url'),
                is_featured=tool_data.get('is_featured', False),
                category_id=category_obj.id,
                owner_id=random.choice(all_users).id,
                pricing_model=pricing_model_enum,
                platforms=platforms_str  # <-- Добавляем платформы
            )
            db.add(new_tool)
            db.flush()

            description = tool_data.get('description', '')
            db.add(models.ToolTranslation(tool_id=new_tool.id, language_code='ru', name=name, description=description))
            db.add(models.ToolTranslation(tool_id=new_tool.id, language_code='en', name=name, description=description))
            db.add(models.ToolTranslation(tool_id=new_tool.id, language_code='uk', name=name, description=description))
            print(f"  + Инструмент '{name}' (Цена: {pricing_model_enum.value}) добавлен в сессию.")

        print("\nСохранение всех изменений в базе данных...")
        db.commit()
        print("\nЗаполнение базы данных успешно завершено!")

    except Exception as e:
        print(f"\n[КРИТИЧЕСКАЯ ОШИБКА] Произошла ошибка: {e}")
        print("Откатываем все изменения...")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Проверка и создание таблиц (если необходимо)...")
    Base.metadata.create_all(bind=engine)
    # Проверяем, есть ли флаг --force
    force_run = '--force' in sys.argv
    seed_database(force=force_run)