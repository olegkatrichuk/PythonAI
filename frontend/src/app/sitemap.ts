// src/app/sitemap.ts

import { MetadataRoute } from 'next';
import type { ITool } from '@/types';

// Замените это на URL вашего опубликованного сайта
const BASE_URL = 'https://your-domain.com';

// Интерфейс для структуры ответа от API
interface ToolsResponse {
  items: ITool[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const res = await fetch(`http://localhost:8000/tools/?limit=1000`);

    if (!res.ok) {
      console.error('Failed to fetch tool for sitemap.');
      return [];
    }

    const toolsPage: ToolsResponse = await res.json();

    if (!toolsPage || !Array.isArray(toolsPage.items)) {
      console.error('Invalid data structure received for sitemap.');
      return [];
    }

    // Явное создание объектов карты сайта
    const toolUrls: MetadataRoute.Sitemap = toolsPage.items.map((tool): MetadataRoute.Sitemap[number] => ({
      url: `${BASE_URL}/ru/tools/${tool.id}`,
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
        url: `${BASE_URL}/ru/tools`,
        lastModified: now,
      },
      {
        url: `${BASE_URL}/en/tools`,
        lastModified: now,
      },
    ];

    return [...staticUrls, ...toolUrls];
  } catch (error) {
    console.error('An error occurred while generating sitemap:', error);
    return [];
  }
}
