// src/app/[lang]/tool/page.tsx

import type { Metadata } from 'next';
import { getTranslations } from '@/lib/translations';
import type { ITool, ICategory } from '@/types';

// Импортируем все необходимые компоненты
import SimpleSearchBar from '@/components/SimpleSearchBar';
import Breadcrumbs from '@/components/Breadcrumbs';
import RealTimeFilters from '@/components/RealTimeFilters';
import { PageHeader, SearchAnimation, SidebarAnimation, MainContentAnimation } from '@/components/SmoothAnimations';


// Определяем простой и понятный тип для пропсов
type ToolsPageProps = {
    params: Promise<{ lang: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

interface ApiResponse {
    items: ITool[];
    total: number;
}

// Функция для получения данных (она у вас уже была правильной)
async function getTools(lang: string, searchParams: URLSearchParams): Promise<ApiResponse> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/tools/?${searchParams.toString()}`;

    console.log(`[SERVER DEBUG] Запрашиваю URL: ${apiUrl}`);

    try {
        const res = await fetch(apiUrl, {
            headers: { 'Accept-Language': lang },
            cache: 'no-store'
        });

        if (!res.ok) {
            // Handle rate limiting gracefully
            if (res.status === 429) {
                console.log(`[SERVER] Rate limited, returning empty results`);
                return { items: [], total: 0 };
            }
            
            // Handle other client errors silently
            if (res.status >= 400 && res.status < 500) {
                console.log(`[SERVER] Client error ${res.status}, returning empty results`);
                return { items: [], total: 0 };
            }
            
            // Only throw for server errors
            if (res.status >= 500) {
                throw new Error(`Server error: ${res.status}`);
            }
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

async function getCategories(lang: string): Promise<ICategory[]> {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/categories/`;
    try {
        const res = await fetch(apiUrl, {
            headers: { 'Accept-Language': lang },
            cache: 'no-store',
        });
        if (!res.ok) {
            // Silently handle all errors for categories
            if (res.status === 429) {
                console.log(`[SERVER] Categories rate limited`);
            }
            return [];
        }
        return res.json();
    } catch (error) {
        console.error(`Error fetching categories:`, error);
        return [];
    }
}

// Enhanced metadata with canonical URLs for filtered content
export async function generateMetadata({ params: paramsPromise, searchParams: searchParamsPromise }: ToolsPageProps): Promise<Metadata> {
    const params = await paramsPromise;
    const searchParams = await searchParamsPromise;
    const { lang } = params;
    const t = getTranslations(lang);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Build canonical URL based on search parameters
    const cleanParams = new URLSearchParams();
    const category_id = searchParams.category_id;
    const q = searchParams.q;
    
    // Only add parameters that should be indexed
    if (category_id && typeof category_id === 'string') {
        cleanParams.set('category_id', category_id);
    }
    if (q && typeof q === 'string') {
        cleanParams.set('q', q);
    }
    
    const canonicalPath = cleanParams.toString() 
        ? `${siteUrl}/${lang}/tool?${cleanParams.toString()}`
        : `${siteUrl}/${lang}/tool`;

    // Generate dynamic title and description based on filters
    let pageTitle = t('tools_page_title');
    let pageDescription = t('tools_page_intro_text');
    
    if (q && typeof q === 'string') {
        pageTitle = `${q} - ${t('tools_page_title')}`;
        pageDescription = `Find AI tools related to "${q}". ${t('tools_page_intro_text')}`;
    }

    // Enhanced keywords based on search context
    const keywords = [
        'AI tools catalog', 'нейросети каталог', 'artificial intelligence',
        'machine learning tools', 'neural networks', 'AI applications',
        'productivity AI', 'business automation', 'creative AI tools',
        'AI software directory', 'ML platforms', 'deep learning tools'
    ];

    if (q && typeof q === 'string') {
        keywords.push(q, `${q} AI`, `${q} tool`, `${q} neural network`);
    }

    return {
        title: pageTitle,
        description: pageDescription,
        keywords,
        authors: [{ name: 'GetAIFind Team' }],
        creator: 'GetAIFind',
        publisher: 'GetAIFind',
        alternates: {
            canonical: canonicalPath,
            languages: {
                'en': `${siteUrl}/en/tool${cleanParams.toString() ? `?${cleanParams.toString()}` : ''}`,
                'ru': `${siteUrl}/ru/tool${cleanParams.toString() ? `?${cleanParams.toString()}` : ''}`,
                'uk': `${siteUrl}/uk/tool${cleanParams.toString() ? `?${cleanParams.toString()}` : ''}`,
                'x-default': `${siteUrl}/en/tool${cleanParams.toString() ? `?${cleanParams.toString()}` : ''}`,
            },
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            url: canonicalPath,
            siteName: 'AI Tools Finder',
            locale: lang,
            type: 'website',
        },
    };
}


// Возвращаем компонент страницы к простому виду для Next.js 15
export default async function ToolsPage({ params: paramsPromise, searchParams: searchParamsPromise }: ToolsPageProps) {
    const params = await paramsPromise;
    const searchParams = await searchParamsPromise;
    const { lang } = params;
    const t = getTranslations(lang);

    // Преобразуем searchParams в стандартный URLSearchParams
    const queryParams = new URLSearchParams(searchParams as any);

    const [toolsData, categories] = await Promise.all([
        getTools(lang, queryParams),
        getCategories(lang),
    ]);

    const { items: tools, total } = toolsData;
    const page = Number(queryParams.get('page') ?? '1');
    const limit = Number(queryParams.get('limit') ?? '12');

    return (
        <div>
            <Breadcrumbs lang={lang} />
            
            <PageHeader 
                title={t('tools_page_title')}
                subtitle={t('tools_page_intro_text')}
                className="mb-12"
            />

            <SearchAnimation className="mb-8">
                <SimpleSearchBar />
            </SearchAnimation>

            <MainContentAnimation>
                <RealTimeFilters
                    initialTools={tools}
                    initialTotal={total}
                    categories={categories}
                    initialPage={page}
                    initialLimit={limit}
                />
            </MainContentAnimation>
        </div>
    );
}