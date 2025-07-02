// src/app/[lang]/blog/[slug]/page.tsx

import type { Metadata } from 'next';
import Link from 'next/link';
// import Image from 'next/image'; // Image больше не нужен
import BackButton from '@/components/BackButton';

type PostPageProps = {
  params: Promise<{
    slug: string;
    lang: string;
  }>;
};

type Language = 'ru' | 'en' | 'uk';

// "База данных" статей
const articlesDb = {
  'top-5-ai-for-devs': {
    title: {
      ru: 'Топ-5 AI-помощников для программистов в 2025 году',
      en: 'Top 5 AI Assistants for Programmers in 2025',
      uk: 'Топ-5 AI-помічників для програмістів у 2025 році',
    },
    description: {
      ru: 'Откройте для себя лучшие AI-инструменты, которые ускорят вашу разработку, помогут найти ошибки и написать качественный код.',
      en: 'Discover the best AI tools that will speed up your development, help find bugs, and write quality code.',
      uk: 'Відкрийте для себе найкращі AI-інструменти, які прискорять вашу розробку, допоможуть знайти помилки та написати якісний код.',
    },
    author: { ru: 'Олег', en: 'Oleg', uk: 'Олег' },
    date: { ru: '2 июля 2025', en: 'July 2, 2025', uk: '2 липня 2025' },
    // ✅ ИЗМЕНЕНИЕ: Свойство imageUrl полностью удалено
    publishedTime: '2025-07-02T12:00:00Z',
    intro: {
        ru: 'Искусственный интеллект меняет правила игры во всех сферах...',
        en: 'Artificial intelligence is changing the game in all areas...',
        uk: 'Штучний інтелект змінює правила гри у всіх сферах...',
    },
    conclusion_title: { ru: 'Заключение', en: 'Conclusion', uk: 'Висновок' },
    conclusion_text: {
        ru: 'AI-ассистенты — это уже не будущее, а настоящее разработки...',
        en: 'AI assistants are no longer the future, but the present of development...',
        uk: 'AI-асистенти — це вже не майбутнє, а сьогодення розробки...',
    }
  }
};

const toolsDb = {
    'github-copilot': {
        name: 'GitHub Copilot',
        description: { ru: 'Бесспорный лидер рынка...', en: 'The undisputed market leader...', uk: 'Беззаперечний лідер ринку...' },
        learn_more: { ru: 'Узнать больше о GitHub Copilot', en: 'Learn more about GitHub Copilot', uk: 'Дізнатися більше про GitHub Copilot' },
    },
    'tabnine': {
        name: 'Tabnine',
        description: { ru: 'Отличный конкурент Copilot...', en: 'An excellent competitor to Copilot...', uk: 'Відмінний конкурент Copilot...' },
        learn_more: { ru: 'Узнать больше о Tabnine', en: 'Learn more about Tabnine', uk: 'Дізнатися більше про Tabnine' },
    },
    'codeium': {
        name: 'Codeium',
        description: { ru: 'Позиционирует себя как бесплатная альтернатива...', en: 'Positions itself as a free alternative...', uk: 'Позиціонує себе як безкоштовна альтернатива...' },
        learn_more: { ru: 'Узнать больше о Codeium', en: 'Learn more about Codeium', uk: 'Дізнатися більше про Codeium' },
    }
};

export async function generateMetadata({ params: paramsPromise }: PostPageProps): Promise<Metadata> {
  const { slug, lang } = await paramsPromise;
  const article = articlesDb[slug as keyof typeof articlesDb];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://getaifind.com";

  if (!article) return { title: 'Статья не найдена' };

  const title = article.title[lang as Language] || article.title['en'];
  const description = article.description[lang as Language] || article.description['en'];
  const url = `${siteUrl}/${lang}/blog/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    // ✅ ИЗМЕНЕНИЕ: Убраны теги 'images'
    openGraph: {
      title, description, url, siteName: 'getaifind.com',
      locale: lang, type: 'article', publishedTime: article.publishedTime,
      authors: [article.author.en],
    },
    twitter: { card: 'summary_large_image', title, description },
    other: { "application/ld+json": JSON.stringify({ "@context": "https://schema.org", "@type": "BlogPosting", "headline": title, "description": description, "datePublished": article.publishedTime, "author": { "@type": "Person", "name": article.author.en }}) }
  };
}


export default async function PostPage({ params: paramsPromise }: PostPageProps) {
  const { slug, lang } = await paramsPromise;
  const article = articlesDb[slug as keyof typeof articlesDb];

  if (!article) return <div>Статья не найдена</div>;

  const currentLang = lang as Language;

  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <BackButton />
      <article className="prose prose-invert lg:prose-xl mx-auto">
        <h1>{article.title[currentLang]}</h1>
        <p className="text-sm text-gray-400 mt-0">
          Автор: {article.author[currentLang]} • Опубликовано: {article.date[currentLang]}
        </p>

        {/* ✅ ИЗМЕНЕНИЕ: Блок с картинкой полностью удален */}

        <div className="p-4 bg-slate-800 rounded-lg my-8">
            <h2 className="text-xl font-bold mt-0">Содержание</h2>
            <ul className="list-disc pl-5">
                {Object.values(toolsDb).map((tool) => (
                    <li key={tool.name}><a href={`#${tool.name.toLowerCase().replace(/\s/g, '-')}`} className="no-underline hover:underline">{tool.name}</a></li>
                ))}
                <li><a href="#conclusion" className="no-underline hover:underline">{article.conclusion_title[currentLang]}</a></li>
            </ul>
        </div>

        <p>{article.intro[currentLang]}</p>

        {Object.entries(toolsDb).map(([toolSlug, toolData]) => (
            <div key={toolSlug}>
                <h2 id={toolData.name.toLowerCase().replace(/\s/g, '-')}>{toolData.name}</h2>
                <p>{toolData.description[currentLang]}</p>
                <strong><Link href={`/${lang}/tool/${toolSlug}`} className="text-blue-400 hover:underline">{toolData.learn_more[currentLang]} &rarr;</Link></strong>
            </div>
        ))}

        <h2 id="conclusion">{article.conclusion_title[currentLang]}</h2>
        <p>{article.conclusion_text[currentLang]}</p>

        <div className="mt-12 text-center p-8 bg-slate-800 rounded-lg">
            <h3 className="text-2xl font-bold">Нашли что-то интересное?</h3>
            <p className="mt-2 mb-4 text-gray-400">Перейдите в наш каталог, чтобы изучить еще сотни AI-инструментов!</p>
            <Link href={`/${lang}/tool`} className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                Смотреть все инструменты
            </Link>
        </div>
      </article>
    </div>
  );
}