// frontend/src/app/[lang]/category/[slug]/page.tsx

import { Suspense } from 'react';
import type { ITool, ICategory } from '@/types';
import { getTranslations } from '@/lib/translations';
import { notFound } from 'next/navigation';

import ToolList from '@/components/ToolList';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';


type PageProps = {
    params: Promise<{
        lang: string;
        slug: string;
    }>;
    searchParams: Promise<{
        page?: string;
        limit?: string;
        q?: string;
    }>;
};

// Функция для получения данных о категории по slug
async function getCategory(slug: string, lang: string): Promise<ICategory | null> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${slug}`;
    try {
        const res = await fetch(apiUrl, {
            headers: { 'Accept-Language': lang },
            cache: 'no-store',
        });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error(`[ERROR] Fetching category by slug failed for URL: ${apiUrl}`, error);
        return null;
    }
}

// --- ИЗМЕНЕНИЕ 1: Обновляем возвращаемый тип, чтобы он соответствовал API ---
async function getToolsForCategory(categoryId: number, searchParams: Awaited<PageProps['searchParams']>, lang: string): Promise<{ items: ITool[], total: number }> {
    const {
        page = '1',
        limit = '12',
        q,
    } = searchParams;

    const params = new URLSearchParams({
        page,
        limit,
        category_id: String(categoryId),
    });

    if (q) params.append('q', q);

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/tools/?${params.toString()}`;

    try {
        const res = await fetch(apiUrl, {
            headers: { 'Accept-Language': lang },
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch tools: ${res.statusText}`);
        }

        return res.json();
    } catch (error) {
        console.error("[ERROR] Fetching tools for category failed:", error);
        // Возвращаем объект с полем 'items', а не 'tools', чтобы соответствовать типу
        return { items: [], total: 0 };
    }
}

async function getCategories(lang: string): Promise<ICategory[]> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/categories/`;
    try {
        const res = await fetch(apiUrl, {
            headers: { 'Accept-Language': lang },
            cache: 'no-store',
        });
        if (!res.ok) {
            return [];
        }
        return res.json();
    } catch (error) {
        console.error(`Error fetching categories:`, error);
        return [];
    }
}

export default async function CategoryPage({ params: paramsPromise, searchParams: searchParamsPromise }: PageProps) {
    const params = await paramsPromise;
    const searchParams = await searchParamsPromise;
    const { lang, slug } = params;
    const t = getTranslations(lang);
    const page = Number(searchParams.page) || 1;
    const limit = Number(searchParams.limit) || 12;

    const [category, categories] = await Promise.all([
        getCategory(slug, lang),
        getCategories(lang),
    ]);

    if (!category) {
        notFound();
    }

    // --- ИЗМЕНЕНИЕ 2: Переименовываем 'items' в 'tools' при получении данных ---
    const { items: tools, total } = await getToolsForCategory(category.id, searchParams, lang);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-4 font-jakarta">
                    {category.name}
                </h1>
                {/* Можно добавить описание категории, если оно будет в модели */}
                {/* <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
                    {category.description}
                </p> */}
                <div className="mt-8 max-w-xl mx-auto">
                    <SearchBar />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1">
                    {/* Фильтр категорий здесь, возможно, нужно будет адаптировать */}
                    <CategoryFilter categories={categories} />
                </div>
                <main className="md:col-span-3">
                    <Suspense fallback={<p>Loading tools...</p>}>
                        <ToolList
                            tools={tools}
                            total={total}
                            page={page}
                            limit={limit}
                            lang={lang}
                            basePath={`/${lang}/category/${slug}`}
                        />
                    </Suspense>
                </main>
            </div>
        </div>
    );
}
