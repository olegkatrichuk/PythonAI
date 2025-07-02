// src/app/[lang]/contacts/page.tsx
import BackButton from '@/components/BackButton';

// ❗️ Тип для Next.js 15
type ContactsPageProps = {
  params: Promise<{
    lang: string;
  }>;
};

type Language = 'ru' | 'en' | 'uk';

// ❗️ Компонент должен быть async
export default async function ContactsPage({ params: paramsPromise }: ContactsPageProps) {
  // ❗️ "Распаковываем" params
  const { lang } = await paramsPromise;
  const currentLang = lang as Language;

  const t = (key: 'title' | 'p1' | 'email_address') => {
    const translations = {
      title: { ru: 'Контакты', en: 'Contacts', uk: 'Контакти' },
      p1: { ru: 'По вопросам сотрудничества или с предложениями, пожалуйста, пишите нам на почту:', en: 'For collaboration or suggestions, please email us at:', uk: 'З питань співпраці або з пропозиціями, будь ласка, пишіть нам на пошту:' },
      // ✅ Добавил email в переводы для чистоты кода
      email_address: { ru: 'ilikenewcoin@gmail.com', en: 'ilikenewcoin@gmail.com', uk: 'ilikenewcoin@gmail.com' },
    };
    return translations[key][currentLang] ?? translations[key]['en'];
  };

  const email = t('email_address');

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <BackButton />
      <article className="prose prose-invert lg:prose-xl">
        <h1>{t('title')}</h1>
        <p>
          {t('p1')}{' '}
          {/* ✅ Исправлена ссылка mailto, чтобы она соответствовала тексту */}
          <a href={`mailto:${email}`} className="text-blue-400 hover:underline">
            {email}
          </a>
        </p>
      </article>
    </div>
  );
}