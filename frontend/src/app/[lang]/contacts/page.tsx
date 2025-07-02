// src/app/[lang]/contacts/page.tsx
import BackButton from '@/components/BackButton';

type ContactsPageProps = {
  params: {
    lang: string;
  };
};

export default function ContactsPage({ params }: ContactsPageProps) {
  const { lang } = params;

  type Language = 'ru' | 'en' | 'uk';

  const t = (key: 'title' | 'p1' | 'email_link') => {
    const translations = {
      title: { ru: 'Контакты', en: 'Contacts', uk: 'Контакти' },
      p1: { ru: 'По вопросам сотрудничества или с предложениями, пожалуйста, пишите нам на почту:', en: 'For collaboration or suggestions, please email us at:', uk: 'З питань співпраці або з пропозиціями, будь ласка, пишіть нам на пошту:' },
      email_link: { ru: 'связаться с нами', en: 'contact us', uk: 'зв\'язатися з нами' },
    };
    return translations[key][lang as Language] ?? translations[key]['en'];
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <BackButton />
      <article className="prose prose-invert lg:prose-xl">
        <h1>{t('title')}</h1>
        <p>
          {t('p1')}{' '}
          <a href="mailto:your-email@example.com" className="text-blue-400 hover:underline">
            ilikenewcoin@gmail.com
          </a>
        </p>
      </article>
    </div>
  );
}