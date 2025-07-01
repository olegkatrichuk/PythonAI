// src/app/sitemap.ts

import { MetadataRoute } from 'next';
import type { ITool } from '@/types';

// ⬇️ ИЗМЕНЕНИЕ №1: Используем переменную окружения для базового URL ⬇️
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Интерфейс для структуры ответа от API
interface ToolsResponse {
  items: ITool[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // ⬇️ ИЗМЕНЕНИЕ №2: Используем переменную окружения для URL API ⬇️
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/tools/?limit=1000`);

    if (!res.ok) {
      console.error('Failed to fetch tool for sitemap.');
      return [];
    }

    const toolsPage: ToolsResponse = await res.json();

    if (!toolsPage || !Array.isArray(toolsPage.items)) {
      console.error('Invalid data structure received for sitemap.');
      return [];
    }

    // В вашем коде здесь была ошибка, `tool.id` не подходит для slug.
    // Используем `tool.slug` для правильного URL.
    const toolUrls: MetadataRoute.Sitemap = toolsPage.items.map((tool): MetadataRoute.Sitemap[number] => ({
      url: `${BASE_URL}/ru/tool/${tool.slug}`, // Используем slug вместо id
      lastModified: tool.created_at ? new Date(tool.created_at) : new Date(),
    }));

    const now = new Date();

    const staticUrls: MetadataRoute.Sitemap = [
      {
        url: `${BASE_URL}/ru`,
        lastModified: now,
      },
      {
        url: `${BASE_URL}/en`,
        lastModified: now,
      },
      {
        url: `${BASE_URL}/ru/tool`, // Изменено с /tools на /tool
        lastModified: now,
      },
      {
        url: `${BASE_URL}/en/tool`, // Изменено с /tools на /tool
        lastModified: now,
      },
    ];

    return [...staticUrls, ...toolUrls];
  } catch (error) {
    console.error('An error occurred while generating sitemap:', error);
    return [];
  }
}