# add_tool_translations.py

import sys
from pathlib import Path
from sqlalchemy.orm import Session, joinedload

# Добавляем корень проекта в системные пути для корректного импорта
sys.path.append(str(Path(__file__).resolve().parent))
from app.database import SessionLocal
from app import models

# --- ШАГ 1: ЗАПОЛНИТЕ ЭТИ ДАННЫЕ ---
# Сопоставьте ID вашего инструмента с его переводами.
# ID можно посмотреть в вашей таблице `tool`.
TOOL_DATA = {
    # ID: {
    #     "ru": {"name": "Русское имя", "description": "Русское описание"},
    #     "en": {"name": "Английское имя", "description": "Английское описание"}
    # }
    12: {
        "ru": {"name": "GitHub Copilot", "description": "Ваш ИИ-напарник для программирования от GitHub."},
        "en": {"name": "GitHub Copilot", "description": "Your AI pair programmer from GitHub."},
        "uk": {"name": "GitHub Copilot", "description": "Ваш ШІ-напарник для програмування від GitHub."}
    },
    9: {
        "ru": {"name": "Midjourney",
               "description": "Генерация высококачественных изображений по текстовому описанию через Discord."},
        "en": {"name": "Midjourney",
               "description": "High-quality image generation from text descriptions via Discord."},
        "uk": {"name": "Midjourney",
               "description": "Генерація високоякісних зображень за текстовим описом через Discord."}
    },
    # Добавьте сюда переводы для остальных ваших инструментов по их ID
    # Пример для инструмента с ID 13 (Cursor):
    13: {
        "ru": {"name": "Cursor", "description": "Редактор кода, созданный для программирования с помощью ИИ."},
        "en": {"name": "Cursor", "description": "The code editor designed for programming with AI."},
        "uk": {"name": "Cursor", "description": "Редактор коду, створений для програмування за допомогою ШІ."}
    }
}


def add_missing_tool_translations():
    """
    Скрипт для добавления переводов к существующим инструментам, у которых их нет.
    """
    db: Session = SessionLocal()
    print("Подключение к базе данных установлено.")

    # Получаем все инструменты, сразу подгружая связанные с ними переводы
    all_tools = db.query(models.Tool).options(joinedload(models.Tool.translations)).all()
    print(f"Найдено всего инструментов в базе: {len(all_tools)}")

    added_count = 0
    for tool in all_tools:
        if tool.id in TOOL_DATA:
            # Создаем множество существующих языков для быстрой проверки
            existing_langs = {t.language_code for t in tool.translations}

            translations_to_add = TOOL_DATA[tool.id]

            for lang_code, trans_data in translations_to_add.items():
                # Добавляем перевод, только если для этого языка его еще нет
                if lang_code not in existing_langs:
                    print(f"  -> Для Tool ID {tool.id} добавляем перевод: [{lang_code}] {trans_data['name']}")
                    new_translation = models.ToolTranslation(
                        tool_id=tool.id,
                        language_code=lang_code,
                        name=trans_data["name"],
                        description=trans_data["description"]
                    )
                    db.add(new_translation)
                    added_count += 1
        else:
            print(f"ПРЕДУПРЕЖДЕНИЕ: В словаре TOOL_DATA не найдены данные для инструмента с ID {tool.id}")

    if added_count > 0:
        db.commit()
        print(f"\nУспешно добавлено {added_count} новых записей о переводах инструментов.")
    else:
        print("\nНовых переводов для добавления не найдено (возможно, все уже было добавлено ранее).")

    db.close()
    print("Работа скрипта завершена.")


if __name__ == "__main__":
    add_missing_tool_translations()