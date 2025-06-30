// src/components/InteractiveHelper.tsx

'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { ICategory } from '@/types';

// --- ИЗМЕНЕНИЕ 2: Исправлена иконка для дизайна ---
const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('текст') || name.includes('text')) return '✍️';
  if (name.includes('изображен') || name.includes('image')) return '🎨';
  if (name.includes('код') || name.includes('code')) return '💻';
  if (name.includes('видео') || name.includes('аудио') || name.includes('video') || name.includes('audio')) return '🎬';
  if (name.includes('дизайн') || name.includes('design')) return '✏️'; // <-- ИСПРАВЛЕНО
  if (name.includes('бизнес') || name.includes('business')) return '📈';
  if (name.includes('продуктивность') || name.includes('productivity')) return '🚀';
  return '✨';
};

export default function InteractiveHelper({ categories, lang }: { categories: ICategory[], lang: string }) {
  const displayedCategories = categories.slice(0, 7);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
      {displayedCategories.map(category => (
        <Link
          key={category.id}
          // --- ИЗМЕНЕНИЕ 1: Ссылка ведет на /tool (единственное число) ---
          href={`/${lang}/tool?category_id=${category.id}`}
          className="flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-800/50 rounded-lg text-center transition-all duration-300 ease-in-out border border-transparent hover:border-blue-500 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/20"
          onMouseEnter={() => setHoveredId(category.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div className="text-4xl sm:text-5xl mb-3">
            {getCategoryIcon(category.name)}
          </div>
          <span className="text-sm sm:text-base font-medium text-slate-200">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
