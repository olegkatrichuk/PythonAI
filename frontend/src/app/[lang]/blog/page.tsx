// src/app/[lang]/blog/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';

type BlogPageProps = {
  params: Promise<{
    lang: string;
  }>;
};

type Language = 'ru' | 'en' | 'uk';

const articles = [
    {
      slug: 'top-5-ai-for-devs',
      date: '2 июля 2025',
      title: {
        ru: 'Топ-5 AI-помощников для программистов в 2025 году',
        en: 'Top 5 AI Assistants for Programmers in 2025',
        uk: 'Топ-5 AI-помічників для програмістів у 2025 році',
      },
      description: {
        ru: 'Откройте для себя лучшие AI-инструменты, которые ускорят вашу разработку...',
        en: 'Discover the best AI tools that will speed up your development...',
        uk: 'Відкрийте для себе найкращі AI-инструменти, які прискорять вашу розробку...',
      }
    }
];

export async function generateMetadata({ params: paramsPromise }: BlogPageProps): Promise<Metadata> {
    const { lang } = await paramsPromise;
    const currentLang = lang as Language;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://getaifind.com";

    const translations = {
        title: { ru: 'Блог | getaifind.com', en: 'Blog | getaifind.com', uk: 'Блог | getaifind.com' },
        description: { ru: 'Статьи, обзоры и новости из мира искусственного интеллекта и нейросетей.', en: 'Articles, reviews, and news from the world of artificial intelligence and neural networks.', uk: 'Статті, огляди та новини зі світу штучного інтелекту та нейромереж.' },
    };

    const title = translations.title[currentLang];
    const description = translations.description[currentLang];

    return {
        title,
        description,
        alternates: {
            canonical: `${siteUrl}/${lang}/blog`,
        },
        openGraph: {
            title,
            description,
            url: `${siteUrl}/${lang}/blog`,
            siteName: 'getaifind.com',
        },
    };
}


export default async function BlogPage({ params: paramsPromise }: BlogPageProps) {
  const { lang } = await paramsPromise;
  const currentLang = lang as Language;

  const t = (key: 'blog_title' | 'blog_description' | 'read_more') => {
    const translations = {
      blog_title: { ru: 'Блог', en: 'Blog', uk: 'Блог' },
      blog_description: { ru: 'Статьи, обзоры и новости из мира искусственного интеллекта.', en: 'Articles, reviews, and news from the world of AI.', uk: 'Статті, огляди та новини зі світу штучного інтелекту.' },
      read_more: { ru: 'Читать далее →', en: 'Read more →', uk: 'Читати далі →' },
    };
    return translations[key][currentLang];
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold">{t('blog_title')}</h1>
        <p className="mt-2 text-lg text-slate-400">{t('blog_description')}</p>
      </div>

      {articles.length > 0 ? (
        <div className="space-y-8">
          {articles.map(article => (
            // ✅ ИСПРАВЛЕНИЕ: Убран 'legacyBehavior' и вложенный тег <a>
            <Link
              key={article.slug}
              href={`/${currentLang}/blog/${article.slug}`}
              className="block p-8 bg-slate-800 rounded-lg hover:bg-slate-700/50 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
            >
              <p className="text-sm text-slate-400 mb-2">{article.date}</p>
              <h2 className="text-2xl font-bold text-white mb-3">{article.title[currentLang]}</h2>
              <p className="text-slate-400 mb-4">{article.description[currentLang]}</p>
              <span className="font-semibold text-blue-400 hover:text-blue-300">{t('read_more')}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold">Пока здесь нет статей</h2>
          <p className="text-slate-400 mt-2">Мы уже работаем над новым контентом. Заходите позже!</p>
        </div>
      )}
    </div>
  );
}