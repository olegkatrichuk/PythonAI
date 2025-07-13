// src/contexts/AuthContext.tsx
'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { trackEvents, setCustomDimensions } from '@/lib/gtag';

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
    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      // Жестко задаем URL, так как переменные окружения не подхватываются
      const apiUrl = 'http://localhost:8000';
      console.log('API URL:', apiUrl);
      console.log('Stored token:', storedToken?.substring(0, 20) + '...');
      console.log('Fetching user info from:', `${apiUrl}/api/users/me/`);
      
      const response = await fetch(`${apiUrl}/api/users/me/`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setToken(storedToken);
        
        // Track user login success and set custom dimensions
        setCustomDimensions(userData);
      } else {
        console.error('Failed to fetch user info:', response.status);
        localStorage.removeItem('accessToken');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      localStorage.removeItem('accessToken');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      try {
        const decoded: DecodedToken = jwtDecode(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          fetchUserInfo();
        } else {
          localStorage.removeItem('accessToken');
          setLoading(false);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('accessToken');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const decoded: DecodedToken = jwtDecode(newToken);
      localStorage.setItem('accessToken', newToken);
      setToken(newToken);
      fetchUserInfo();
    } catch (error) {
      console.error("Failed to decode token on login:", error);
    }
  };

  const logout = () => {
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