// lib/api.ts
export const getApiUrl = (): string => {
  // Если переменная окружения установлена, используем её
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }

  // В production обязательно должна быть переменная окружения
  throw new Error('NEXT_PUBLIC_API_URL is required in production');
};

export const apiUrl = getApiUrl();

// Добавьте для удобства axios instance
import axios from 'axios';

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor для добавления токена из localStorage (временно)
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor для обработки 401 ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Очищаем localStorage при 401 ошибке
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
      
      // Перенаправляем только если пользователь пытается получить доступ к защищенным ресурсам
      const url = error.config?.url || '';
      if (url.includes('/users/me/') || url.includes('/admin/')) {
        // Это проверка авторизации, не перенаправляем
        // Компонент сам решит, что делать
      } else {
        // Это попытка доступа к защищенному ресурсу, перенаправляем
        if (typeof window !== 'undefined') {
          window.location.href = '/ru/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Отдельный instance для публичных запросов (логин, регистрация)
export const publicApi = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});