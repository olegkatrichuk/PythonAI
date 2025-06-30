// src/types/index.ts

// Интерфейс для категории (остается без изменений)
export interface ICategory {
  id: number;
  name: string;
}

// --- НОВЫЙ ИНТЕРФЕЙС ДЛЯ ОТЗЫВОВ ---
// Он заменяет старый IComment
export interface IReview {
  id: number;
  text: string | null;
  rating: number;
  created_at: string;
  author: {
    id: number;
    email: string;
  };
}

// --- ОБНОВЛЕННЫЙ ИНТЕРФЕЙС ДЛЯ ИНСТРУМЕНТА ---
export interface ITool {
  id: number;
  name: string;
  description: string;
  url: string;
  slug: string;
  icon_url?: string;
  is_featured?: boolean;
  created_at?: string;

  // Поля для фильтров
  pricing_model: 'free' | 'freemium' | 'paid' | 'trial';
  platforms: string[] | null;

  // Связь с категорией
  category: ICategory;

  // Новые поля для рейтинга
  review_count: number;
  average_rating: number;

  // Связь с отзывами
  reviews: IReview[];
}