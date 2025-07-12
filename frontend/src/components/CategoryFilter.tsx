// src/components/CategoryFilter.tsx

'use client';

import Link from 'next/link';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { getTranslations } from '@/lib/translations';
import type { ICategory } from '@/types';

// Платформы остаются без изменений
const PLATFORM_OPTIONS = ['Web', 'API', 'Windows', 'macOS', 'iOS', 'Android'];

interface CategoryFilterProps {
    categories: ICategory[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const lang = pathname.split('/')[1] || 'ru';
    const t = getTranslations(lang);

    // --- ИЗМЕНЕНИЕ 1: Список для фильтра цен теперь использует переводы ---
    const PRICING_OPTIONS = [
        { key: 'free', label: t('pricing_free') },
        { key: 'freemium', label: t('pricing_freemium') },
        { key: 'paid', label: t('pricing_paid') },
        { key: 'trial', label: t('pricing_trial') }
    ];

    const SORT_OPTIONS = [
        { key: 'created_at', label: t('sort_newest') },
        { key: 'rating', label: t('sort_popular') },
        { key: 'review_count', label: t('sort_discussed') },
    ];

    // --- Улучшенная функция для создания URL ---
    const createFilterUrl = (paramName: string, paramValue: string | null) => {
        const params = new URLSearchParams(searchParams.toString());

        if (paramValue === null || params.get(paramName) === paramValue) {
            params.delete(paramName);
        } else {
            params.set(paramName, paramValue);
        }
        params.set('page', '1');

        return `${pathname}?${params.toString()}`;
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort_by', e.target.value);
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    // Определяем, какая категория активна сейчас, по slug из URL
    const currentCategorySlug = pathname.split('/').pop();

    // --- Общая стилизация для кнопок-фильтров ---
    const baseLinkStyle = "block w-full text-left px-3 py-2 rounded-md text-sm transition-colors text-slate-300 hover:bg-slate-700/50";
    const activeLinkStyle = "bg-blue-600 text-white font-semibold shadow-md";

    return (
        <aside className="w-full bg-cardBackground p-4 rounded-lg border border-foreground/10 space-y-6">
            {/* Блок сортировки (остается без изменений) */}
            
            {/* Блок категорий */}
            <div>
                <h3 className="font-bold text-lg mb-3 text-foreground font-jakarta">{t('categories_title')}</h3>
                <ul className="space-y-1">
                    <li>
                        {/* Ссылка на главную страницу для сброса категории */}
                        <Link
                            href={`/${lang}`}
                            className={`${baseLinkStyle} ${pathname === `/${lang}` ? activeLinkStyle : ''}`}
                        >
                            {t('all_categories_button')}
                        </Link>
                    </li>
                    {categories.map(category => (
                        <li key={category.id}>
                            <Link
                                href={`/${lang}/category/${category.slug}`}
                                className={`${baseLinkStyle} ${currentCategorySlug === category.slug ? activeLinkStyle : ''}`}
                            >
                                {category.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Блоки фильтров по цене и платформам (остаются без изменений) */}
            {/* ... */}
        </aside>
    );
}
