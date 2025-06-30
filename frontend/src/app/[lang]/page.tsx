// src/app/[lang]/page.tsx

import type { Metadata } from 'next';
import type { ITool, ICategory } from '@/types';

import Link from 'next/link';
import ToolCard from '@/components/ToolCard';
import FeaturedToolCard from '@/components/FeaturedToolCard';
import InteractiveHelper from '@/components/InteractiveHelper';
import { getTranslations } from '@/lib/translations';

// Улучшенная версия для максимального SEO-эффекта
export async function generateMetadata({ params: { lang } }: { params: { lang: string } }): Promise<Metadata> {
  const t = getTranslations(lang);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `http://localhost:3000/${lang}`;
  const title = t('home_title');
  const description = t('home_subtitle');

  return {
    // 1. Основные метаданные (у вас уже есть)
    title: title,
    description: description,

    // 2. Ключевые слова для поисковиков
    keywords: ['AI tools', 'нейросети', 'инструменты ИИ', 'каталог нейросетей', 'AI Tools Finder'],

    // 3. Canonical URL - указывает поисковику на "главную" версию страницы
    alternates: {
      canonical: siteUrl,
    },

    // 4. Open Graph - для красивых превью в соцсетях (Telegram, Facebook и т.д.)
    openGraph: {
      title: title,
      description: description,
      url: siteUrl,
      siteName: 'AI Tools Finder',
      // Укажите путь к вашему главному изображению для превью
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`, // Пример
          width: 1200,
          height: 630,
        },
      ],
      locale: lang,
      type: 'website',
    },

    // 5. Для Twitter
    twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        // Укажите путь к изображению
        images: [`${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`],
    },
  };
}

async function fetchData(url: string, lang: string) {
  try {
    const res = await fetch(url, {
        headers: { 'Accept-Language': lang },
        cache: 'no-store'
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

export default async function HomePage({ params: { lang } }: { params: { lang:string } }) {
  const t = getTranslations(lang);

  const [featuredToolResponse, latestToolsResponse, categories] = await Promise.all([
    fetchData(`http://localhost:8000/tools/featured`, lang),
    fetchData(`http://localhost:8000/tools/latest`, lang),
    fetchData(`http://localhost:8000/categories/`, lang)
  ]);

  return (
    <div>
      {/* Секция "Герой" */}
      <section className="text-center py-20 sm:py-24">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          {t('home_title')}
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          {t('home_subtitle')}
        </p>

        {/* --- ИЗМЕНЕНИЕ 1: Ссылка ведет на /tool (единственное число) --- */}
        <Link
          href={`/${lang}/tool`}
          className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          {t('home_view_all_tools')}
        </Link>
      </section>

      {/* Секция Категорий */}
      {categories && categories.length > 0 && (
        <section className="max-w-5xl mx-auto py-16">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home_what_to_do')}</h2>
          <InteractiveHelper categories={categories} lang={lang} />
        </section>
      )}

      {/* Инструмент Дня */}
      {featuredToolResponse && featuredToolResponse.items && featuredToolResponse.items.length > 0 && (
        <section className="max-w-4xl mx-auto py-16">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home_tool_of_the_day')}</h2>
          <FeaturedToolCard
            tool={featuredToolResponse.items[0]}
            lang={lang}
            buttonText={t('learn_more_button')}
          />
        </section>
      )}

      {/* Новые поступления */}
      {latestToolsResponse && latestToolsResponse.items && latestToolsResponse.items.length > 0 && (
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home_new_arrivals')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

            {/* --- ИЗМЕНЕНИЕ 2: Передаем пропс lang в ToolCard --- */}
            {latestToolsResponse.items.map((tool: ITool) => (
              <ToolCard key={tool.id} tool={tool} lang={lang} />
            ))}

          </div>
        </section>
      )}
    </div>
  );
}
