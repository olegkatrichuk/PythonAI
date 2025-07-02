// src/app/[lang]/about/page.tsx
import BackButton from '@/components/BackButton';

// ❗️ Тип для Next.js 15
type AboutPageProps = {
  params: Promise<{
    lang: string;
  }>;
};

type Language = 'ru' | 'en' | 'uk';

// ❗️ Компонент має бути async
export default async function AboutPage({ params: paramsPromise }: AboutPageProps) {
  // ❗️ "Розпаковуємо" params
  const { lang } = await paramsPromise;
  const currentLang = lang as Language;

  const t = (key: 'title' | 'p1' | 'p2') => {
    const translations = {
      title: { ru: 'О нас', en: 'About Us', uk: 'Про нас' },
      p1: { ru: 'GetAIFind - это проект, созданный для помощи разработчикам, маркетологам и энтузиастам в поиске лучших AI-инструментов для их задач.', en: 'GetAIFind is a project created to help developers, marketers, and enthusiasts find the best AI tools for their tasks.', uk: 'GetAIFind - це проєкт, створений для допомоги розробникам, маркетологам та ентузіастам у пошуку найкращих AI-інструментів для їхніх завдань.' },
      p2: { ru: 'Наша миссия - сделать мир искусственного интеллекта доступным и понятным для всех.', en: 'Our mission is to make the world of artificial intelligence accessible and understandable for everyone.', uk: 'Наша місія - зробити світ штучного інтелекту доступним та зрозумілим для всіх.' },
    };
    return translations[key][currentLang] ?? translations[key]['en'];
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <BackButton />
      <article className="prose prose-invert lg:prose-xl">
        <h1>{t('title')}</h1>
        <p>{t('p1')}</p>
        <p>{t('p2')}</p>
      </article>
    </div>
  );
}