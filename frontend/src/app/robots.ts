// src/app/robots.ts

import { MetadataRoute } from 'next';

// Указываем базовый URL вашего сайта
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://getaifind.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      // Правила для всех поисковых роботов
      userAgent: '*',
      // Разрешаем сканировать все страницы
      allow: '/',
      // Запрещаем сканировать определенные страницы (если они у вас будут)
      // Например, можно запретить страницы админки или личного кабинета
      // disallow: '/admin/',
    },
    // Указываем путь к нашей карте сайта
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}