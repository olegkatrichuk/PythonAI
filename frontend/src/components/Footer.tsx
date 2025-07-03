// src/components/Footer.tsx

import Link from 'next/link';
import React from 'react';
import AddToolLink from './AddToolLink'; // 👈 1. Импортируем новый компонент

// Компонент для социальных ссылок
const SocialLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
    {children}
  </a>
);

// SVG иконки
const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6" {...props}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
);
const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6" {...props}><path d="M12 24a12 12 0 1 1 0-24 12 12 0 0 1 0 24Zm4.42-15.74-5.83 5.26-1.72 5.34a.5.5 0 0 0 .75.58l5.34-1.72 5.26-5.83a.5.5 0 0 0-.58-.75ZM12 24a12 12 0 1 1 0-24 12 12 0 0 1 0 24Zm-1.03-4.84.9-2.88 2.88-.9a.5.5 0 0 0 0-.94l-10-4a.5.5 0 0 0-.65.65l4 10a.5.5 0 0 0 .94 0Z"></path></svg>
);
const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className="h-6 w-6" {...props}><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69a3.6 3.6 0 0 1 .1-2.64s.84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.54 1.28.16 2.39.1 2.64.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10"></path></svg>
);

// Футер принимает язык как пропс
export default function Footer({ lang }: { lang: string }) {
  const currentYear = new Date().getFullYear();

  // Объект для переводов
  const t = (key: string) => {
    const translations: {[key: string]: {[lang: string]: string}} = {
        'tools': { en: 'Tools', ru: 'Инструменты', uk: 'Інструменти' },
        'all_tools': { en: 'All tools', ru: 'Все инструменты', uk: 'Всі інструменти' },
        'add_tool': { en: 'Add a tool', ru: 'Добавить инструмент', uk: 'Додати інструмент' },
        'company': { en: 'Company', ru: 'Компания', uk: 'Компанія' },
        'about_us': { en: 'About us', ru: 'О нас', uk: 'Про нас' },
        'blog': { en: 'Blog', ru: 'Блог', uk: 'Блог' },
        'contacts': { en: 'Contacts', ru: 'Контакты', uk: 'Контакти' },
        'legal': { en: 'Legal', ru: 'Право', uk: 'Право' },
        'terms': { en: 'Terms of Use', ru: 'Условия использования', uk: 'Умови використання' },
        'privacy': { en: 'Privacy Policy', ru: 'Политика конфиденциальности', uk: 'Політика конфіденційності' },
        'description': { en: 'Your navigator in the world of neural networks and AI tools.', ru: 'Ваш навигатор в мире нейросетей и AI-инструментов.', uk: 'Ваш навігатор у світі нейромереж та AI-інструментів.' },
        'copyright': { en: 'All rights reserved.', ru: 'Все права защищены.', uk: 'Всі права захищені.' },
    };
    return translations[key]?.[lang] || translations[key]?.['en'];
  };

  return (
    <footer className="bg-cardBackground text-foreground mt-20 border-t border-foreground/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">

          <div className="col-span-2 lg:col-span-1">
            <h2 className="text-xl font-bold mb-2">getaifind.com</h2>
            <p className="text-foreground/70 text-sm">
              {t('description')}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('tools')}</h3>
            <ul className="space-y-2 text-foreground/70">
              <li><Link href={`/${lang}/tool`} className="hover:text-foreground transition-colors">{t('all_tools')}</Link></li>
              {/* ⬇️ 2. Заменяем старую ссылку на новый компонент ⬇️ */}
              <li><AddToolLink>{t('add_tool')}</AddToolLink></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('company')}</h3>
            <ul className="space-y-2 text-foreground/70">
              <li><Link href={`/${lang}/about`} className="hover:text-foreground transition-colors">{t('about_us')}</Link></li>
              <li><Link href={`/${lang}/blog`} className="hover:text-foreground transition-colors">{t('blog')}</Link></li>
              <li><Link href={`/${lang}/contacts`} className="hover:text-foreground transition-colors">{t('contacts')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">{t('legal')}</h3>
            <ul className="space-y-2 text-foreground/70">
              <li><Link href={`/${lang}/terms`} className="hover:text-foreground transition-colors">{t('terms')}</Link></li>
              <li><Link href={`/${lang}/privacy`} className="hover:text-foreground transition-colors">{t('privacy')}</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-foreground/10 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-foreground/60 text-sm">
            © {currentYear} getaifind.com. {t('copyright')}
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <SocialLink href="https://x.com/ilikenewcoin">
              <TwitterIcon />
            </SocialLink>
            <SocialLink href="https://t.me/Olegnewlife">
              <TelegramIcon />
            </SocialLink>
            <SocialLink href="https://github.com/olegkatrichuk">
              <GitHubIcon />
            </SocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
}