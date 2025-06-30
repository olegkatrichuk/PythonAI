# seed_reviews.py

import random
import sys
from pathlib import Path
from sqlalchemy.orm import Session
from sqlalchemy import func

# --- Настройка путей для импорта ---
sys.path.append(str(Path(__file__).resolve().parent))
from app.database import SessionLocal, engine
from app.models import User, Tool, Review, Base

# --- СПИСОК ТЕСТОВЫХ ОТЗЫВОВ ---
REVIEWS_TO_ADD = [
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


def seed_reviews():
    """
    Основная функция для заполнения базы данных тестовыми отзывами и рейтингами.
    """
    db: Session = SessionLocal()

    confirmation = input(
        "Вы уверены, что хотите ОЧИСТИТЬ старые отзывы и добавить новые? (y/n): "
    )
    if confirmation.lower().strip() != 'y':
        print("Операция отменена.")
        db.close()
        return

    print("Подключение к базе данных установлено...")

    try:
        # 1. Очищаем старые отзывы и сбрасываем рейтинги у инструментов
        print("Очистка старых отзывов и сброс рейтингов...")
        db.query(Review).delete(synchronize_session=False)
        db.query(Tool).update({"average_rating": 0.0, "review_count": 0}, synchronize_session=False)
        print("Старые данные очищены.")

        # 2. Получаем всех пользователей и все инструменты из БД
        users = db.query(User).all()
        tools = db.query(Tool).all()

        if not users or not tools:
            print("Ошибка: В базе данных нет пользователей или инструментов.")
            db.close()
            return

        print(f"Найдено пользователей: {len(users)}. Найдено инструментов: {len(tools)}.")
        print("Начинаем генерацию отзывов...")

        reviews_created_count = 0

        # --- НОВАЯ УЛУЧШЕННАЯ ЛОГИКА ---

        # 3. Первый проход: создаем все объекты отзывов и добавляем их в сессию
        for tool in tools:
            num_reviews = random.randint(2, 7)
            print(f"  + Подготовка {num_reviews} отзывов для '{tool.slug}'...")
            for _ in range(num_reviews):
                random_author = random.choice(users)
                review_text = random.choice(REVIEWS_TO_ADD)
                random_rating = random.randint(3, 5)  # Генерируем в основном хорошие оценки
                new_review = Review(
                    text=review_text,
                    rating=random_rating,
                    tool_id=tool.id,
                    author_id=random_author.id
                )
                db.add(new_review)
                reviews_created_count += 1

        # 4. Выполняем FLUSH, чтобы отзывы получили ID и стали доступны для запросов внутри транзакции
        print("\nОтправка отзывов в БД (flush)...")
        db.flush()
        print(f"Успешно подготовлено {reviews_created_count} отзывов.")

        # 5. Второй проход: теперь, когда отзывы "видны", обновляем рейтинги
        print("\nПересчет среднего рейтинга для всех инструментов...")
        for tool in tools:
            # Этот запрос теперь будет видеть отзывы, которые мы только что добавили
            result = db.query(
                func.avg(Review.rating).label("average_rating"),
                func.count(Review.id).label("review_count")
            ).filter(Review.tool_id == tool.id).one()

            tool.average_rating = float(result.average_rating or 0)
            tool.review_count = int(result.review_count or 0)

        # 6. Сохраняем ВСЁ (новые отзывы и обновленные рейтинги) ОДНИМ коммитом
        print("Сохранение всех изменений...")
        db.commit()
        print("-" * 30)
        print("Процесс успешно завершен!")

    except Exception as e:
        print(f"\n[КРИТИЧЕСКАЯ ОШИБКА] Произошла ошибка: {e}")
        db.rollback()
    finally:
        db.close()
        print("Соединение с базой данных закрыто.")


if __name__ == "__main__":
    print("Проверка и создание таблиц (если необходимо)...")
    Base.metadata.create_all(bind=engine)
    seed_reviews()