# seed_comments.py

import random
import sys
from pathlib import Path
from sqlalchemy.orm import Session

# --- Настройка путей для импорта ---
sys.path.append(str(Path(__file__).resolve().parent))
from app.database import SessionLocal, engine
from app.models import User, Tool, Comment, Base

# --- СПИСОК ТЕСТОВЫХ КОММЕНТАРИЕВ ---
# Можете добавить сюда свои варианты
COMMENTS_TO_ADD = [
    "Отличный инструмент! Очень помогает в ежедневной работе, рекомендую.",
    "Пользуюсь уже несколько месяцев, все нравится. Стабильно и без нареканий.",
    "Есть некоторые шероховатости в интерфейсе, но в целом продукт очень хороший.",
    "Это просто находка для нашей команды! Экономит кучу времени и нервов.",
    "Не совсем то, что я искал, но для определенных задач подойдет идеально.",
    "Подскажите, пожалуйста, планируется ли интеграция с Figma или Sketch?",
    "На удивление быстро работает даже с большими объемами данных. Разработчикам респект!",
    "Наверное, лучшее решение на рынке в своей ценовой категории. Аналоги стоят дороже.",
    "Надеюсь, в будущем разработчики добавят больше возможностей для кастомизации.",
    "Простой и интуитивно понятный интерфейс, разобрался буквально за 5 минут.",
    "Функционал полностью соответствует заявленному. Спасибо!",
    "Давно ждал что-то подобное. Однозначно лайк и подписка.",
    "Неплохо, но есть аналоги и получше. Впрочем, для старта сойдет.",
    "Техподдержка отвечает быстро, помогли разобраться с проблемой.",
    "Использую бесплатную версию, и ее функционала мне пока хватает. Думаю о покупке Pro.",
]


def seed_comments():
    """
    Основная функция для заполнения базы данных тестовыми комментариями.
    """
    db: Session = SessionLocal()

    confirmation = input(
        "Вы уверены, что хотите добавить случайные комментарии к инструментам? (y/n): "
    )
    if confirmation.lower().strip() != 'y':
        print("Операция отменена.")
        db.close()
        return

    print("Подключение к базе данных установлено...")

    try:
        # 1. Получаем всех пользователей и все инструменты из БД
        users = db.query(User).all()
        tools = db.query(Tool).all()

        # 2. Проверяем, есть ли кого и что комментировать
        if not users:
            print("Ошибка: В базе данных нет пользователей. Сначала запустите seed_users.py.")
            return
        if not tools:
            print("Ошибка: В базе данных нет инструментов. Сначала запустите seed.py.")
            return

        print(f"Найдено пользователей: {len(users)}. Найдено инструментов: {len(tools)}.")
        print("Начинаем генерацию комментариев...")

        comments_created_count = 0
        # 3. Проходим по каждому инструменту
        for tool in tools:
            # Проверяем, есть ли у инструмента уже комментарии
            existing_comments_count = db.query(Comment).filter(Comment.tool_id == tool.id).count()
            if existing_comments_count > 0:
                print(f"  - У инструмента '{tool.slug}' уже есть комментарии. Пропускаем.")
                continue

            # Для каждого инструмента создаем от 1 до 3 случайных комментариев
            num_comments_for_tool = random.randint(1, 3)

            print(f"  + Добавляем {num_comments_for_tool} комментариев для '{tool.slug}'...")
            for _ in range(num_comments_for_tool):
                random_author = random.choice(users)
                comment_text = random.choice(COMMENTS_TO_ADD)

                new_comment = Comment(
                    text=comment_text,
                    tool_id=tool.id,
                    author_id=random_author.id
                )
                db.add(new_comment)
                comments_created_count += 1

        if comments_created_count > 0:
            # 4. Сохраняем все созданные комментарии в базу данных
            db.commit()
            print("-" * 30)
            print(f"Успешно добавлено {comments_created_count} новых комментариев!")
        else:
            print("\nНовых комментариев для добавления не найдено. Все инструменты уже имеют комментарии.")

    except Exception as e:
        print(f"Произошла ошибка: {e}")
        db.rollback()
    finally:
        # 5. Обязательно закрываем сессию
        db.close()
        print("Соединение с базой данных закрыто.")


if __name__ == "__main__":
    print("Проверка и создание таблиц (если необходимо)...")
    Base.metadata.create_all(bind=engine)
    seed_comments()