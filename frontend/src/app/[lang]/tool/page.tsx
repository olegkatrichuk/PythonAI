// src/app/[lang]/tool/page.tsx

import type { Metadata } from 'next';
import { getTranslations } from '@/lib/translations';
import type { ITool, ICategory } from '@/types';

// Импортируем все необходимые компоненты
import ToolList from '@/components/ToolList';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';

// --- ИСПРАВЛЕНИЕ №1: Добавляем 'slug' в тип PageTool ---
interface PageTool extends ITool {
    category: ICategory;
    slug: string; // <-- Это свойство нужно для генерации URL в метаданных
}
interface ApiResponse {
    items: PageTool[];
    total: number;
}

// Функция для получения данных остается без изменений
async function getTools(lang: string, searchParams: URLSearchParams): Promise<ApiResponse> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/tools/?${searchParams.toString()}`;

    // --- НАЧАЛО ОТЛАДОЧНОГО БЛОКА ---
    console.log("-----------------------------------------");
    console.log(`[SERVER DEBUG] Запрашиваю URL: ${apiUrl}`);
    // --- КОНЕЦ ОТЛАДОЧНОГО БЛОКА ---

    try {
        const res = await fetch(apiUrl, {
            headers: { 'Accept-Language': lang },
            cache: 'no-store'
        });

        // --- НАЧАЛО ОТЛАДОЧНОГО БЛОКА ---
        console.log(`[SERVER DEBUG] Статус ответа от API: ${res.status}`);
        // --- КОНЕЦ ОТЛАДОЧНОГО БЛОКА ---

        if (!res.ok) {
            console.error(`Network error on server: ${res.status}`);
            return { items: [], total: 0 };
        }

        const data = await res.json();

        // --- НАЧАЛО ОТЛАДОЧНОГО БЛОКА ---
        console.log(`[SERVER DEBUG] Полученные данные (items): ${data.items ? data.items.length : 0} шт.`);
        console.log("-----------------------------------------");
        // --- КОНЕЦ ОТЛАДОЧНОГО БЛОКА ---

        return {
            items: data.items || [],
            total: data.total || 0,
        };
    } catch (err) {
        console.error("Server-side fetch failed:", err);
        return { items: [], total: 0 };
    }
}

// --- ИСПРАВЛЕНИЕ №2: Безопасно работаем с searchParams в метаданных ---
export async function generateMetadata({ params, searchParams }: { params: { lang:string }, searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> {
    const { lang } = params;
    const t = getTranslations(lang);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Преобразуем специальный объект searchParams в стандартный URLSearchParams
    const queryParams = new URLSearchParams();
    for (const key in searchParams) {
        const value = searchParams[key];
        if (typeof value === 'string') {
            queryParams.append(key, value);
        }
    }

    const data = await getTools(lang, queryParams);
    const tools = data.items;

    const itemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": t('tools_page_title'),
        "description": t('tools_page_description'),
        "numberOfItems": data.total,
        "itemListElement": tools.map((tool, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": tool.name,
            "url": `${siteUrl}/${lang}/tool/${tool.slug}` // Теперь 'slug' доступен
        })),
    };

    return {
        title: t('tools_page_title'),
        description: t('tools_page_description'),
        alternates: {
            canonical: `${siteUrl}/${lang}/tools`,
        },
        other: {
            "application/ld+json": JSON.stringify(itemListSchema),
        },
    };
}


// --- ИСПРАВЛЕНИЕ №3: Безопасно работаем с searchParams в компоненте ---
export default async function ToolsPage({ params, searchParams }: { params: { lang: string }, searchParams: { [key: string]: string | string[] | undefined } }) {
    const { lang } = params;
    const t = getTranslations(lang);

    // Точно так же безопасно создаем queryParams
    const queryParams = new URLSearchParams();
    for (const key in searchParams) {
        const value = searchParams[key];
        if (typeof value === 'string') {
            queryParams.append(key, value);
        } else if (Array.isArray(value)) {
            value.forEach(item => queryParams.append(key, item));
        }
    }

    const { items: tools, total } = await getTools(lang, queryParams);
    const page = Number(queryParams.get('page') ?? '1');
    const limit = Number(queryParams.get('limit') ?? '12');

    return (
        <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-4">
                {t('tools_page_title')}
            </h1>

            <p className="max-w-3xl mx-auto text-center text-slate-300 mb-12">
                {t('tools_page_intro_text')}
            </p>

            <div className="mb-8 max-w-2xl mx-auto">
                <SearchBar />
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4 lg:w-1/5">
                    <CategoryFilter />
                </aside>

                <div className="flex-grow">
                    <ToolList
                        tools={tools}
                        total={total}
                        page={page}
                        limit={limit}
                        lang={lang}
                    />
                </div>
            </div>
        </div>
    );
}