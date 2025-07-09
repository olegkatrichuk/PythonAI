// src/app/[lang]/page.tsx

import type { Metadata } from 'next';
import type { ITool, ICategory } from '@/types';

import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import FeaturedToolCard from '@/components/FeaturedToolCard';
import InteractiveHelper from '@/components/InteractiveHelper';
import { getTranslations } from '@/lib/translations';

export const dynamic = 'force-dynamic';

// ✅ Тип параметров
type PageProps = {
  params: Promise<{
    lang: string;
  }>;
};

// ✅ Метаданные для SEO
export async function generateMetadata({ params: paramsPromise }: PageProps): Promise<Metadata> {
  const params = await paramsPromise;
  const { lang } = params;
  const t = getTranslations(lang);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:3000/${lang}`;
  const title = t('home_title');
  const description = t('home_subtitle');

  return {
    title,
    description,
    keywords: ['AI tools', 'нейросети', 'инструменты ИИ', 'каталог нейросетей', 'AI Tools Finder'],
    alternates: {
      canonical: siteUrl,
      languages: {
        'en': `${process.env.NEXT_PUBLIC_SITE_URL}/en`,
        'ru': `${process.env.NEXT_PUBLIC_SITE_URL}/ru`,
        'uk': `${process.env.NEXT_PUBLIC_SITE_URL}/uk`,
        'x-default': `${process.env.NEXT_PUBLIC_SITE_URL}/en`,
      },
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: 'AI Tools Finder',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
        },
      ],
      locale: lang,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`],
    },
  };
}

// 🔄 Получение данных
async function fetchData(url: string, lang: string) {
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': lang },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

// ✅ Главная страница
export default async function HomePage({ params: paramsPromise }: PageProps) {
  const params = await paramsPromise;
  const { lang } = params;
  const t = getTranslations(lang);

  // ⬇️ ИЗМЕНЕНИЕ: Используем переменную окружения для URL API ⬇️
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  console.log("API URL:", apiUrl);

  const [featuredToolResponse, latestToolsResponse, categories] = await Promise.all([
    fetchData(`${apiUrl}/api/tools/featured`, lang),
    fetchData(`${apiUrl}/api/tools/latest`, lang),
    fetchData(`${apiUrl}/api/categories/`, lang),
  ]);

  console.log("Featured Tools Response:", featuredToolResponse);
  console.log("Latest Tools Response:", latestToolsResponse);

  return (
    <div>
      {/* Секция "Герой" */}
      <section className="text-center py-20 sm:py-24">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-foreground font-jakarta">
          {t('home_title')}
        </h1>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto mb-8">
          {t('home_subtitle')}
        </p>

        <Link
          href={`/${lang}/tool`}
          className="inline-block bg-primary text-primaryForeground font-bold py-3 px-8 rounded-lg text-lg hover:bg-primary/90 transition-colors shadow-lg"
        >
          {t('home_view_all_tools')}
        </Link>
      </section>

      {/* Категории */}
      {categories && categories.length > 0 && (
        <section className="max-w-5xl mx-auto py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground font-jakarta">{t('home_what_to_do')}</h2>
          <InteractiveHelper categories={categories} lang={lang} />
        </section>
      )}

      {/* Инструмент дня */}
      {featuredToolResponse?.items?.length > 0 && (
        <section className="max-w-4xl mx-auto py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground font-jakarta">{t('home_tool_of_the_day')}</h2>
          <FeaturedToolCard
            tool={featuredToolResponse.items[0]}
            lang={lang}
            buttonText={t('learn_more_button')}
          />
        </section>
      )}

      {/* Новинки */}
      {latestToolsResponse?.items?.length > 0 && (
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground font-jakarta">{t('home_new_arrivals')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {latestToolsResponse.items.map((tool: ITool) => (
              <ToolCard key={tool.id} tool={tool} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
