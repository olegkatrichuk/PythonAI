// src/contexts/AuthContext.tsx
'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { trackEvents, setCustomDimensions } from '@/lib/gtag';
import { api } from '@/lib/api';
import { errorHandler, handleApiError } from '@/lib/errorHandler';

interface DecodedToken {
  sub: string;
  exp: number;
}

interface User {
  id: number;
  email: string;
  is_active: boolean;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => void;
  logout: () => void;
  fetchUserInfo: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserInfo = async () => {
    try {
      // Теперь токен приходит из httpOnly cookie автоматически
      const response = await api.get('/api/users/me/');

      setUser(response.data);
      setToken('authenticated'); // Просто флаг, что пользователь авторизован
      
      // Track user login success and set custom dimensions
      setCustomDimensions(response.data);
    } catch (error: any) {
      // Если 401 - это нормально, пользователь не авторизован
      if (error.response?.status === 401) {
        setToken(null);
        setUser(null);
      } else {
        // Другие ошибки логируем
        errorHandler.logError(error as Error);
        setToken(null);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Временная поддержка старой логики для существующих пользователей
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      // Если есть токен в localStorage, используем его для входа
      try {
        const decoded: DecodedToken = jwtDecode(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          // Токен еще действителен, используем его временно
          migrateFromLocalStorage(storedToken);
          return;
        } else {
          localStorage.removeItem('accessToken');
        }
      } catch (error) {
        localStorage.removeItem('accessToken');
      }
    }
    
    // Проверяем авторизацию через API call, токен в httpOnly cookie
    fetchUserInfo();
  }, []);

  const login = (newToken: string) => {
    // Токен уже установлен в httpOnly cookie на backend
    // Просто обновляем информацию о пользователе
    setToken('authenticated');
    fetchUserInfo();
  };

  const migrateFromLocalStorage = async (oldToken: string) => {
    // Пока просто используем старую логику с localStorage
    // TODO: Позже можно будет удалить
    setToken(oldToken);
    fetchUserInfo();
  };

  const logout = async () => {
    try {
      // Вызываем API для удаления cookie
      await api.post('/api/logout');
    } catch (error) {
      // Используем централизованный error handler
      errorHandler.logError(error as Error);
    }
    
    // Очищаем localStorage
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
  };

  const value = { user, token, loading, login, logout, fetchUserInfo };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};