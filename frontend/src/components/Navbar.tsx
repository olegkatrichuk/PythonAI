// src/components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useParams, useRouter } from 'next/navigation';
import { getTranslations } from '@/lib/translations';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const params = useParams();
  const router = useRouter();
  const lang = params.lang as string;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!lang) {
    return null;
  }

  const t = getTranslations(lang);

  const handleLogout = () => {
    logout();
    router.push(`/${lang}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-foreground/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link href={`/${lang}`} className="text-xl md:text-2xl font-bold text-foreground transition-colors hover:text-primary flex-shrink-0">
            AI Tools Finder
          </Link>

          {/* Десктопное меню */}
          <div className="hidden lg:flex items-center gap-4 md:gap-6">
            <Link href={`/${lang}/tool`} className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              {t('nav_catalog')}
            </Link>

            {user ? (
              <>
                <Link href={`/${lang}/my-tools`} className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                  {t('nav_my_tools')}
                </Link>
                <Link href={`/${lang}/tool/add`} className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                  {t('nav_add_tool')}
                </Link>
                {user.is_admin && (
                  <Link href={`/${lang}/admin`} className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors">
                    Админ панель
                  </Link>
                )}
                <span className="text-sm text-foreground/60 hidden xl:block">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                >
                  {t('nav_logout')}
                </button>
              </>
            ) : (
              <>
                <Link href={`/${lang}/login`} className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
                  {t('nav_login')}
                </Link>
                <Link
                  href={`/${lang}/register`}
                  className="bg-primary text-primaryForeground text-sm font-bold py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
                >
                  {t('nav_register')}
                </Link>
              </>
            )}

            <div className="border-l border-foreground/10 pl-4 md:pl-6 flex items-center gap-4">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>

          {/* Мобильное меню - кнопка бургер и переключатели */}
          <div className="lg:hidden flex items-center gap-3">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-foreground/70 hover:text-foreground transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Мобильное выпадающее меню */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-foreground/10 py-4">
            <div className="flex flex-col gap-4">
              <Link 
                href={`/${lang}/tool`} 
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav_catalog')}
              </Link>

              {user ? (
                <>
                  <Link 
                    href={`/${lang}/my-tools`} 
                    className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav_my_tools')}
                  </Link>
                  <Link 
                    href={`/${lang}/tool/add`} 
                    className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav_add_tool')}
                  </Link>
                  <div className="text-sm text-foreground/60 py-2 border-t border-foreground/10">
                    {user.email}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors text-left"
                  >
                    {t('nav_logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href={`/${lang}/login`} 
                    className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav_login')}
                  </Link>
                  <Link
                    href={`/${lang}/register`}
                    className="bg-primary text-primaryForeground text-sm font-bold py-2 px-4 rounded-md hover:bg-primary/90 transition-colors inline-block text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav_register')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}