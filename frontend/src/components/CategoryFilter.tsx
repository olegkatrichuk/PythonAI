// src/components/CategoryFilter.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { getTranslations } from '@/lib/translations';
import type { ICategory } from '@/types';
import axios from 'axios';

// Платформы остаются без изменений
const PLATFORM_OPTIONS = ['Web', 'API', 'Windows', 'macOS', 'iOS', 'Android'];


export default function CategoryFilter() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lang = pathname.split('/')[1] || 'ru';
    const t = getTranslations(lang);

    const [categories, setCategories] = useState<ICategory[]>([]);

    // --- ИЗМЕНЕНИЕ 1: Список для фильтра цен теперь использует переводы ---
    const PRICING_OPTIONS = [
        { key: 'free', label: t('pricing_free') },
        { key: 'freemium', label: t('pricing_freemium') },
        { key: 'paid', label: t('pricing_paid') },
        { key: 'trial', label: t('pricing_trial') }
    ];

    // Загружаем категории при монтировании
    useEffect(() => {
        const fetchCategories = async () => {
            const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/categories/`;
            try {
                const res = await axios.get(apiUrl, { headers: { 'Accept-Language': lang } });
                setCategories(res.data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        void fetchCategories();
    }, [lang]);

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

    // Определяем, какие фильтры активны сейчас, для подсветки
    const activeCategoryId = searchParams.get('category_id');
    const activePricing = searchParams.get('pricing_model');
    const activePlatform = searchParams.get('platform');

    // --- Общая стилизация для кнопок-фильтров ---
    const baseLinkStyle = "block w-full text-left px-3 py-2 rounded-md text-sm transition-colors text-slate-300 hover:bg-slate-700/50";
    const activeLinkStyle = "bg-blue-600 text-white font-semibold shadow-md";

    return (
        <aside className="w-full bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 space-y-6">
            {/* Блок категорий */}
            <div>
                <h3 className="font-bold text-lg mb-3 text-white">{t('categories_title')}</h3>
                <ul className="space-y-1">
                    <li>
                        <Link
                            href={createFilterUrl('category_id', null)}
                            className={`${baseLinkStyle} ${!activeCategoryId ? activeLinkStyle : ''}`}
                        >
                            {t('all_categories_button')}
                        </Link>
                    </li>
                    {categories.map(category => (
                        <li key={category.id}>
                            <Link
                                href={createFilterUrl('category_id', String(category.id))}
                                className={`${baseLinkStyle} ${activeCategoryId === String(category.id) ? activeLinkStyle : ''}`}
                            >
                                {category.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Блок "Модель цены" */}
            <div>
                {/* --- ИЗМЕНЕНИЕ 2: Заголовок использует перевод --- */}
                <h3 className="font-bold text-lg mb-3 text-white">{t('pricing_model_title')}</h3>
                <ul className="space-y-1">
                    {PRICING_OPTIONS.map(option => (
                        <li key={option.key}>
                            <Link
                                href={createFilterUrl('pricing_model', option.key)}
                                className={`${baseLinkStyle} ${activePricing === option.key ? activeLinkStyle : ''}`}
                            >
                                {option.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Блок "Платформы" */}
            <div>
                 {/* --- ИЗМЕНЕНИЕ 3: Заголовок использует перевод --- */}
                <h3 className="font-bold text-lg mb-3 text-white">{t('platforms_title')}</h3>
                 <ul className="space-y-1">
                    {PLATFORM_OPTIONS.map(platform => (
                        <li key={platform}>
                            <Link
                                href={createFilterUrl('platform', platform.toLowerCase())}
                                className={`${baseLinkStyle} ${activePlatform === platform.toLowerCase() ? activeLinkStyle : ''}`}
                            >
                                {platform}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
