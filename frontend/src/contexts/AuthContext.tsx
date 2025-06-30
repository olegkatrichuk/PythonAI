// src/contexts/AuthContext.tsx
'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  exp: number;
}

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean; // <-- НОВОЕ СОСТОЯНИЕ
  login: (token: string) => void;
  logout: () => void;
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
  const [loading, setLoading] = useState(true); // <-- Начинаем с true

  useEffect(() => {
    // При первой загрузке сайта, пытаемся найти токен в localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        // Проверяем, не истек ли срок действия токена
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ email: decoded.sub });
        } else {
          // Если токен истек, удаляем его
          localStorage.removeItem('accessToken');
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('accessToken');
      }
    }
    // В любом случае, мы закончили первоначальную проверку
    setLoading(false);
  }, []);

  const login = (token: string) => {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      localStorage.setItem('accessToken', token);
      setUser({ email: decoded.sub });
    } catch (error) {
      console.error("Failed to decode token on login:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};