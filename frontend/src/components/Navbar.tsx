// src/components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';
import { useParams, useRouter } from 'next/navigation';
import { getTranslations } from '@/lib/translations';

export default function Navbar() {
  const { user, logout } = useAuth();
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;

  if (!lang) {
    return null;
  }

  const t = getTranslations(lang);

  const handleLogout = () => {
    logout();
    router.push(`/${lang}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          <Link href={`/${lang}`} className="text-2xl font-bold text-white transition-colors hover:text-blue-400">
            AI Tools Finder
          </Link>

          <div className="flex items-center gap-4 md:gap-6">
            <Link href={`/${lang}/tool`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              {t('nav_catalog')}
            </Link>

            {/* Проверяем, вошел ли пользователь */}
            {user ? (
              // --- МЕНЮ ДЛЯ ЗАЛОГИНЕННОГО ПОЛЬЗОВАТЕЛЯ ---
              <>
                <Link href={`/${lang}/my-tools`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  {t('nav_my_tools')}
                </Link>

                {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ --- */}
                <Link href={`/${lang}/tool/add`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  {t('nav_add_tool')}
                </Link>

                <span className="text-sm text-slate-400">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {t('nav_logout')}
                </button>
              </>
            ) : (
              // --- МЕНЮ ДЛЯ ГОСТЯ ---
              <>
                <Link href={`/${lang}/login`} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  {t('nav_login')}
                </Link>
                <Link
                  href={`/${lang}/register`}
                  className="bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t('nav_register')}
                </Link>
              </>
            )}

            <div className="border-l border-slate-700 pl-4 md:pl-6">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}