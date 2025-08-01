// src/app/[lang]/register/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { getTranslations } from '@/lib/translations';
import { publicApi } from '@/lib/api';
import { isAxiosError } from 'axios';
import { FormAnimation } from '@/components/SmoothAnimations';

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const t = getTranslations(lang);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // --- 1. Добавляем состояния для ошибок валидации ---
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  // --- 2. Создаем функцию для валидации и санитизации ---
  const sanitizeInput = (input: string): string => {
    // Удаляем HTML теги и опасные символы
    return input
      .replace(/<[^>]*>/g, '') // Удаляем HTML теги
      .replace(/[<>'"]/g, '') // Удаляем опасные символы
      .trim();
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    // Санитизация входных данных
    const cleanEmail = sanitizeInput(email);
    const cleanPassword = password.trim(); // Для пароля только удаляем пробелы

    // Валидация Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail) {
      newErrors.email = 'Email обязателен для заполнения.';
    } else if (!emailRegex.test(cleanEmail)) {
      newErrors.email = 'Введите корректный адрес электронной почты.';
    } else if (cleanEmail.length > 255) {
      newErrors.email = 'Email слишком длинный.';
    }

    // Валидация пароля
    if (!cleanPassword) {
      newErrors.password = 'Пароль обязателен для заполнения.';
    } else if (cleanPassword.length < 8) {
      newErrors.password = 'Пароль должен содержать не менее 8 символов.';
    } else if (cleanPassword.length > 128) {
      newErrors.password = 'Пароль слишком длинный (максимум 128 символов).';
    }
    // Можно добавить и другие проверки: на наличие цифр, спецсимволов и т.д.
    // else if (!/\d/.test(password)) {
    //   newErrors.password = 'Пароль должен содержать хотя бы одну цифру.';
    // } else if (!/[!@#$%^&*]/.test(password)) {
    //   newErrors.password = 'Пароль должен содержать хотя бы один спецсимвол.';
    // }

    setErrors(newErrors);
    // Возвращаем true, если ошибок нет
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    // --- 3. Вызываем валидацию перед отправкой ---
    if (!validateForm()) {
      return; // Прерываем отправку, если форма невалидна
    }

    setLoading(true);

    try {
      // Отправляем очищенные данные
      const cleanEmail = sanitizeInput(email);
      const cleanPassword = password.trim();
      
      await publicApi.post('/api/users/', { 
        email: cleanEmail, 
        password: cleanPassword 
      });

      toast.success('Регистрация прошла успешно! Теперь вы можете войти.');
      router.push(`/${lang}/login`);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const errorData = error.response.data;
        const errorMessage = errorData?.detail || 'Произошла ошибка при регистрации.';

        if (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('email')) {
          setErrors(prev => ({ ...prev, email: errorMessage }));
        } else {
          toast.error(errorMessage);
        }
      } else {
        console.error('Ошибка регистрации:', error);
        toast.error('Не удалось связаться с сервером. Проверьте ваше интернет-соединение.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Если язык еще не определился, не рендерим форму
  if (!lang) {
      return null;
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <FormAnimation className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">
          {t('nav_register')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // --- 4. Визуально выделяем поле с ошибкой ---
              className={`mt-1 block w-full bg-slate-700 border rounded-md shadow-sm p-3 focus:ring-opacity-50 ${
                errors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-600 focus:border-blue-500 focus:ring focus:ring-blue-500'
              }`}
              disabled={loading}
            />
            {/* --- 5. Отображаем сообщение об ошибке --- */}
            {errors.email && (
              <p className="mt-2 text-sm text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-1 block w-full bg-slate-700 border rounded-md shadow-sm p-3 focus:ring-opacity-50 ${
                errors.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-600 focus:border-blue-500 focus:ring focus:ring-blue-500'
              }`}
              disabled={loading}
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-400">{errors.password}</p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:bg-blue-800 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {loading ? 'Регистрация...' : t('nav_register')}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          Уже есть аккаунт?{' '}
          <Link href={`/${lang}/login`} className="font-medium text-blue-400 hover:text-blue-300">
            {t('nav_login')}
          </Link>
        </p>
      </FormAnimation>
    </div>
  );
}