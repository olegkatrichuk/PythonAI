// src/components/SearchBar.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { getTranslations } from '@/lib/translations';

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = params.lang as string;

  const initialQuery = searchParams.get('q') || ''; // Стандартное имя для поиска - 'q'
  const [query, setQuery] = useState(initialQuery);

  // Проверка на случай, если lang еще не определен
  // Примечание: Хуки должны вызываться безусловно.
  // Если lang может быть неопределенным, это должно быть обработано на более высоком уровне,
  // или предоставлено значение по умолчанию.
  const t = getTranslations(lang || 'en'); // Предоставляем значение по умолчанию 'en'

  if (!lang) {
    return null;
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();

    const newParams = new URLSearchParams(searchParams.toString());

    // Устанавливаем или удаляем поисковый запрос
    if (query) {
      newParams.set('q', query); // Используем 'q'
    } else {
      newParams.delete('q');
    }
    // При новом поиске всегда сбрасываем на первую страницу
    newParams.set('page', '1');

    // ИСПРАВЛЕНИЕ: Перенаправляем на страницу /tool
    router.push(`/${lang}/tool?${newParams.toString()}`);
  };

  return (
    // ИЗМЕНЕНИЕ: Стили переписаны на Tailwind CSS для единообразия
    <form onSubmit={handleSearch} className="flex gap-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('search_placeholder')}
        className="flex-grow bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3"
      />
      <button
        type="submit"
        className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-bold rounded-lg text-sm px-6 py-3"
      >
        {t('search_button')}
      </button>
    </form>
  );
}