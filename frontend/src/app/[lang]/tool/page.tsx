// src/app/[lang]/tool/page.tsx

import type { Metadata } from 'next';
import { getTranslations } from '@/lib/translations';
import type { ITool, ICategory } from '@/types';

// Импортируем все необходимые компоненты
import ToolList from '@/components/ToolList';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';

// ✅ Определяем простой и понятный тип для пропсов
type ToolsPageProps = {
    params: { lang: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

interface ApiResponse {
    items: ITool[];
    total: number;
}

// ✅ Функция для получения данных (она у вас уже была правильной)
async function getTools(lang: string, searchParams: URLSearchParams): Promise<ApiResponse> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/tools/?${searchParams.toString()}`;

    console.log(`[SERVER DEBUG] Запрашиваю URL: ${apiUrl}`);

    try {
        const res = await fetch(apiUrl, {
            headers: { 'Accept-Language': lang },
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`Network error on server: ${res.status}`);
            return { items: [], total: 0 };
        }

        const data = await res.json();
        return {
            items: data.items || [],
            total: data.total || 0,
        };
    } catch (err) {
        console.error("Server-side fetch failed:", err);
        return { items: [], total: 0 };
    }
}

// ✅ Возвращаем метаданные к простому виду для Next.js 14
export async function generateMetadata({ params, searchParams }: ToolsPageProps): Promise<Metadata> {
    const { lang } = params;
    const t = getTranslations(lang);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Преобразуем searchParams в стандартный URLSearchParams
    const queryParams = new URLSearchParams(searchParams as any);

    // ... остальная логика для метаданных остается без изменений ...

    return {
        title: t('tools_page_title'),
        description: t('tools_page_description'),
        alternates: {
            canonical: `${siteUrl}/${lang}/tools`,
        },
    };
}


// ✅ Возвращаем компонент страницы к простому виду для Next.js 14
export default async function ToolsPage({ params, searchParams }: ToolsPageProps) {
    const { lang } = params;
    const t = getTranslations(lang);

    // Преобразуем searchParams в стандартный URLSearchParams
    const queryParams = new URLSearchParams(searchParams as any);

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