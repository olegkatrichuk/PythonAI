// src/app/[lang]/tool/[slug]/page.tsx

import type { Metadata } from 'next';
import type { ITool } from '@/types';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import StarRating from '@/components/StarRating';
import ReviewsSection from '@/components/ReviewsSection';

type PageProps = {
  params: {
    lang: string;
    slug: string;
  };
};

const PRICING_INFO = {
  free: { text: 'Free', className: 'bg-green-600/20 text-green-300' },
  freemium: { text: 'Freemium', className: 'bg-yellow-600/20 text-yellow-300' },
  paid: { text: 'Paid', className: 'bg-red-600/20 text-red-300' },
  trial: { text: 'Free Trial', className: 'bg-purple-600/20 text-purple-300' },
};

// 🔄 Получение одного инструмента
async function getToolBySlug(slug: string, lang: string): Promise<ITool | null> {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/tools/${slug}`;
  try {
    const res = await fetch(apiUrl, {
      headers: { 'Accept-Language': lang },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error(`[ERROR] Fetching tool by slug failed for URL: ${apiUrl}`, error);
    return null;
  }
}

// 🔎 Генерация SEO-метаданных (возвращаем к простому виду)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = params;
  const tool = await getToolBySlug(slug, lang);

  if (!tool) {
    return { title: 'Инструмент не найден' };
  }

  const pageTitle = `${tool.name} | AI Tools Finder`;
  const pageDescription = tool.description
    ? `${tool.description.substring(0, 155)}...`
    : `Узнайте все о ${tool.name}: возможности, цены и отзывы на AI Tools Finder.`;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lang}/tool/${slug}`,
      siteName: 'AI Tools Finder',
      images: tool.icon_url ? [{ url: tool.icon_url }] : [],
      locale: lang,
      type: 'website',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${lang}/tool/${slug}`,
      languages: {
        'en': `${process.env.NEXT_PUBLIC_SITE_URL}/en/tool/${slug}`,
        'ru': `${process.env.NEXT_PUBLIC_SITE_URL}/ru/tool/${slug}`,
        'uk': `${process.env.NEXT_PUBLIC_SITE_URL}/uk/tool/${slug}`,
        'x-default': `${process.env.NEXT_PUBLIC_SITE_URL}/en/tool/${slug}`,
      },
    },
  };
}

// 🧠 Основной компонент страницы (возвращаем к простому виду)
export default async function ToolDetailPage({ params }: PageProps) {
  const { slug, lang } = params;
  const tool = await getToolBySlug(slug, lang);

  if (!tool) {
    notFound();
  }

  const pricingInfo = tool.pricing_model
    ? PRICING_INFO[tool.pricing_model.toLowerCase() as keyof typeof PRICING_INFO]
    : null;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": tool.name,
    "description": tool.description,
    "image": tool.icon_url || `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL}/${lang}/tool/${tool.slug}`,
    "brand": {
      "@type": "Brand",
      "name": tool.name
    },
    "offers": {
      "@type": "Offer",
      "url": tool.url,
      "priceCurrency": "USD",
      "price": tool.pricing_model === "free" || tool.pricing_model === "freemium" ? "0" : "0",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": tool.average_rating.toFixed(1),
      "reviewCount": tool.review_count
    },
    "review": []
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <div className="grid md:grid-cols-3 gap-8 md:gap-12">
        <aside className="md:col-span-1 flex flex-col items-center md:items-start">
          <div className="relative w-32 h-32 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden mb-6">
            {tool.icon_url ? (
              <Image
                src={tool.icon_url}
                alt={`${tool.name} logo`}
                fill
                sizes="128px"
                className="object-contain p-2"
              />
            ) : (
              <span className="text-4xl font-bold text-slate-500">
                {tool.name.charAt(0)}
              </span>
            )}
          </div>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="w-full text-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Перейти на сайт &rarr;
          </a>
        </aside>

        <article className="md:col-span-2">
          {tool.category && (
            <Link
              href={`/${lang}/tool?category_id=${tool.category.id}`}
              className="text-blue-400 font-semibold text-sm hover:underline"
            >
              {tool.category.name}
            </Link>
          )}

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight my-2 text-white">
            {tool.name}
          </h1>

          <div className="flex items-center gap-3 mt-2 text-slate-400">
            <StarRating
              initialRating={tool.average_rating}
              isInteractive={false}
              size="sm"
            />
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-white">{tool.average_rating.toFixed(1)}</span>
              <span>/</span>
              <span>5</span>
              <span className="ml-2">({tool.review_count} отзывов)</span>
            </div>
          </div>

          <ul className="flex flex-wrap items-center gap-2 mt-4">
            {pricingInfo && (
              <li>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${pricingInfo.className}`}
                >
                  {pricingInfo.text}
                </span>
              </li>
            )}
            {tool.platforms &&
              tool.platforms.map((platform) => (
                <li key={platform}>
                  <span
                    className="bg-slate-700 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {platform}
                  </span>
                </li>
              ))}
          </ul>

          <div className="prose prose-lg prose-invert text-slate-300 mt-6">
            <p>{tool.description}</p>
          </div>
        </article>
      </div>

      <ReviewsSection toolSlug={tool.slug} />
    </div>
  );
}