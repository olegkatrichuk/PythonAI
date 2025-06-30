// src/components/SortControl.tsx
'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { getTranslations } from '@/lib/translations';

export default function SortControl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lang = pathname.split('/')[1] || 'ru';
  const t = getTranslations(lang);

  const sortOptions = [
    { value: 'latest', label: t('sort_latest') },
    { value: 'rating', label: t('sort_rating') },
  ];

  const currentSort = searchParams.get('sort_by') || 'latest';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortValue = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort_by', newSortValue);
    params.set('page', '1'); // Сбрасываем на первую страницу при смене сортировки
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-sm font-medium text-slate-400">
        {t('sort_by_label')}:
      </label>
      <select
        id="sort-select"
        value={currentSort}
        onChange={handleSortChange}
        className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
