// frontend/src/app/[lang]/category/[slug]/page.tsx

import { Suspense } from 'react';
import type { Metadata } from 'next';
import type { ITool, ICategory } from '@/types';
import { getTranslations } from '@/lib/translations';
import { notFound } from 'next/navigation';

import ToolList from '@/components/ToolList';
import CategoryFilter from '@/components/CategoryFilter';
import SearchBar from '@/components/SearchBar';
import CategoryTracker from '@/components/CategoryTracker';


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
            // Handle rate limiting and other errors gracefully
            if (res.status === 429) {
                console.log(`[SERVER] Category tools rate limited`);
                return { items: [], total: 0 };
            }
            
            // Handle other client errors silently
            if (res.status >= 400 && res.status < 500) {
                console.log(`[SERVER] Category tools client error ${res.status}`);
                return { items: [], total: 0 };
            }
            
            // Only throw for server errors
            if (res.status >= 500) {
                throw new Error(`Server error: ${res.status}`);
            }
            
            return { items: [], total: 0 };
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

// Генерация метаданных для страниц категорий
export async function generateMetadata({ params: paramsPromise }: PageProps): Promise<Metadata> {
    const params = await paramsPromise;
    const { lang, slug } = params;
    const category = await getCategory(slug, lang);

    if (!category) {
        return {
            title: 'Категория не найдена',
            description: 'К сожалению, запрашиваемая категория не найдена.',
        };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const pageUrl = `${siteUrl}/${lang}/category/${slug}`;
    const pageTitle = `${category.name} AI инструменты | AI Tools Finder`;
    const pageDescription = `Найдите лучшие AI инструменты в категории ${category.name}. Сравнивайте возможности, цены и отзывы пользователей на AI Tools Finder.`;

    // Генерируем динамическое OG изображение для категории
    const ogImageParams = new URLSearchParams({
        title: category.name,
        description: `AI инструменты категории ${category.name}`,
        category: category.name,
        rating: '',
        price: 'Различные варианты',
    });
    const dynamicOgImage = `${siteUrl}/api/og?${ogImageParams.toString()}`;

    return {
        title: pageTitle,
        description: pageDescription,
        alternates: {
            canonical: pageUrl,
            languages: {
                'en': `${siteUrl}/en/category/${slug}`,
                'ru': `${siteUrl}/ru/category/${slug}`,
                'uk': `${siteUrl}/uk/category/${slug}`,
                'x-default': `${siteUrl}/en/category/${slug}`,
            },
        },
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            url: pageUrl,
            siteName: 'AI Tools Finder',
            images: [{ 
                url: dynamicOgImage, 
                width: 1200, 
                height: 630, 
                alt: `${category.name} AI инструменты - AI Tools Finder`,
                type: 'image/png'
            }],
            locale: lang,
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: pageDescription,
            images: [dynamicOgImage],
            creator: '@ilikenewcoin',
        },
    };
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
            <CategoryTracker categoryName={category.name} />
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
