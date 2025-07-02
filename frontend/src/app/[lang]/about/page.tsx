// src/app/[lang]/about/page.tsx
import BackButton from '@/components/BackButton';

type AboutPageProps = {
  params: {
    lang: string;
  };
};

export default function AboutPage({ params }: AboutPageProps) {
  const { lang } = params;

  type Language = 'ru' | 'en' | 'uk';

  const t = (key: 'title' | 'p1' | 'p2') => {
    const translations = {
      title: { ru: 'О нас', en: 'About Us', uk: 'Про нас' },
      p1: { ru: 'GetAIFind - это проект, созданный для помощи разработчикам, маркетологам и энтузиастам в поиске лучших AI-инструментов для их задач.', en: 'GetAIFind is a project created to help developers, marketers, and enthusiasts find the best AI tools for their tasks.', uk: 'GetAIFind - це проєкт, створений для допомоги розробникам, маркетологам та ентузіастам у пошуку найкращих AI-інструментів для їхніх завдань.' },
      p2: { ru: 'Наша миссия - сделать мир искусственного интеллекта доступным и понятным для всех.', en: 'Our mission is to make the world of artificial intelligence accessible and understandable for everyone.', uk: 'Наша місія - зробити світ штучного інтелекту доступним та зрозумілим для всіх.' },
    };
    return translations[key][lang as Language] ?? translations[key]['en'];
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