#!/usr/bin/env python3
"""
Скрипт для создания администратора
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app import crud, schemas

def create_admin():
    email = input("Введите email для администратора: ")
    password = input("Введите пароль: ")
    
    db = SessionLocal()
    try:
        # Проверяем, существует ли пользователь
        existing_user = crud.get_user_by_email(db, email=email)
        
        if existing_user:
            # Делаем существующего пользователя админом
            existing_user.is_admin = True
            db.commit()
            print(f"Пользователь {email} теперь администратор!")
        else:
            # Создаем нового пользователя-админа
            user_data = schemas.UserCreate(email=email, password=password)
            new_user = crud.create_user(db=db, user=user_data)
            new_user.is_admin = True
            db.commit()
            print(f"Создан новый администратор: {email}")
            
    except Exception as e:
        print(f"Ошибка: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()