// src/components/LanguageSwitcher.tsx

'use client';

import { usePathname, useParams } from 'next/navigation';
import Link from 'next/link';

// Наши языки, которые мы настроили в next.config.js
const locales = ['ru', 'en', 'uk'];

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const params = useParams();

  // Эта функция заменяет язык в текущем URL на новый
  const getRedirectedPath = (locale: string) => {
    if (!pathname) return '/';

    // pathname будет выглядеть как /ru/tool или /en/about
    // Нам нужно отрезать первый сегмент (язык)
    const segments = pathname.split('/');
    segments[1] = locale; // Заменяем его на новый язык
    return segments.join('/');
  };

  const currentLang = params.lang;

  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
      {locales.map((locale) => {
        const isActive = currentLang === locale;
        return (
          <Link
            key={locale}
            href={getRedirectedPath(locale)}
            style={{
              color: isActive ? '#fff' : '#888',
              fontWeight: isActive ? 'bold' : 'normal',
              textDecoration: 'none',
              fontSize: '16px',
            }}
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}