// src/app/sitemap.ts

import { MetadataRoute } from 'next';
import type { ITool } from '@/types';

// ✅ Определяем базовые константы из переменных окружения
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://getaifind.com';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ Список поддерживаемых языков
const languages = ['en', 'ru', 'uk'];

interface ToolsResponse {
  items: ITool[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ✅ 1. Генерируем URL для статических страниц для каждого языка
  const staticPages = ['tool', 'blog', 'about', 'contacts', 'privacy', 'terms'];
  const staticUrls = languages.flatMap(lang => {
    // Добавляем главную страницу для каждого языка
    const langUrls: MetadataRoute.Sitemap = [{
        url: `${BASE_URL}/${lang}`,
        lastModified: now,
    }];
    // Добавляем остальные статические страницы
    staticPages.forEach(page => {
        langUrls.push({
            url: `${BASE_URL}/${lang}/${page}`,
            lastModified: now,
        });
    });
    return langUrls;
  });


  // ✅ 2. Генерируем URL для динамических страниц (инструменты)
  let toolUrls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/api/tools/?limit=1000`);
    if (res.ok) {
      const toolsResponse: ToolsResponse = await res.json();
      if (toolsResponse && Array.isArray(toolsResponse.items)) {
        // Создаем URL для каждого инструмента на каждом языке
        toolUrls = toolsResponse.items.flatMap(tool =>
          languages.map(lang => ({
            url: `${BASE_URL}/${lang}/tool/${tool.slug}`,
            lastModified: tool.updated_at ? new Date(tool.updated_at) : new Date(),
          }))
        );
      }
    }
  } catch (error) {
    // Silently ignore the error
  }

  // ✅ 3. Генерируем URL для статей блога (пока что одна)
  const blogSlugs = ['top-5-ai-for-devs'];
  const blogUrls = blogSlugs.flatMap(slug =>
    languages.map(lang => ({
        url: `${BASE_URL}/${lang}/blog/${slug}`,
        lastModified: now, // В будущем можно будет брать дату из API
    }))
  );


  // ✅ 4. Объединяем все URL в один массив
  return [...staticUrls, ...toolUrls, ...blogUrls];
}