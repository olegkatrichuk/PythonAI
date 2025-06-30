// src/app/[lang]/login/page.tsx

'use client';

import { useState, FormEvent, useContext, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { AuthContext } from '@/contexts/AuthContext';
import { getTranslations } from '@/lib/translations';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;

  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { login, user } = authContext;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push(`/${lang}`);
    }
  }, [user, router, lang]);

  if (!lang) return null;
  const t = getTranslations(lang);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (!response.ok) {
        // Попытаемся прочитать ошибку с сервера
        try {
            const errorData = await response.json();
            throw new Error(errorData.detail || t('login_error_credentials'));
        } catch {
            throw new Error(t('login_error_credentials'));
        }
      }

      const data = await response.json();

      if (data.access_token) {
        login(data.access_token);
        toast.success('Вы успешно вошли!');
        router.push(`/${lang}`);
      } else {
        throw new Error(t('login_error_token'));
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">
          {t('login_page_title')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-3 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
              {t('login_form_password')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-3 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              disabled={loading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:bg-blue-800 disabled:cursor-not-allowed"
            >
              {loading ? t('login_button_loading') : t('nav_login')}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          {t('login_no_account')}{' '}
          <Link href={`/${lang}/register`} className="font-medium text-blue-400 hover:text-blue-300">
            {t('nav_register')}
          </Link>
        </p>
      </div>
    </div>
  );
}