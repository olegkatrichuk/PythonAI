// src/app/[lang]/terms/page.tsx
import BackButton from '@/components/BackButton';

type TermsPageProps = {
  params: {
    lang: string;
  };
};

// ✅ 1. Определяем тип для наших языков
type Language = 'ru' | 'en' | 'uk';

// ✅ 2. Разделяем переводы на два объекта
const textContent = {
    title: { ru: 'Условия использования', en: 'Terms of Use', uk: 'Умови використання' },
    effectiveDate: { ru: 'Дата вступления в силу: 2 июля 2025 г.', en: 'Effective Date: July 2, 2025', uk: 'Дата набрання чинності: 2 липня 2025 р.' },
    welcome: { ru: 'Добро пожаловать на сайт GetAIFind.com. Используя наш сайт, вы соглашаетесь соблюдать настоящие Условия использования. Если вы не согласны с ними — пожалуйста, не используйте сайт.', en: 'Welcome to GetAIFind.com. By using our site, you agree to comply with these Terms of Use. If you do not agree with them, please do not use the site.', uk: 'Ласкаво просимо на сайт GetAIFind.com. Використовуючи наш сайт, ви погоджуєтесь дотримуватися цих Умов використання. Якщо ви не згодні з ними — будь ласка, не використовуйте сайт.' },
    section1_title: { ru: '1. Описание сервиса', en: '1. Description of Service', uk: '1. Опис сервісу' },
    section1_content: { ru: 'GetAIFind — это платформа для поиска и взаимодействия с ИИ-агентами. Мы предоставляем пользователям интерфейс для быстрого поиска и доступа к различным ИИ-инструментам.', en: 'GetAIFind is a platform for discovering and interacting with AI agents. We provide users with an interface for quickly finding and accessing various AI tools.', uk: 'GetAIFind — це платформа для пошуку та взаємодії з ШІ-агентами. Ми надаємо користувачам інтерфейс для швидкого пошуку та доступу до різноманітних ШІ-інструментів.' },
    section2_title: { ru: '2. Использование сайта', en: '2. Site Usage', uk: '2. Використання сайту' },
    section2_content: { ru: 'Вы обязуетесь использовать сайт исключительно в законных целях и не нарушать права третьих лиц, а также не использовать наш сервис для:', en: 'You agree to use the site exclusively for lawful purposes and not to violate the rights of third parties, nor to use our service for:', uk: 'Ви зобов\'язуєтесь використовувати сайт виключно в законних цілях і не порушувати права третіх осіб, а також не використовувати наш сервіс для:' },
    section3_title: { ru: '3. Регистрация', en: '3. Registration', uk: '3. Реєстрація' },
    section3_content: { ru: 'Для доступа к некоторым функциям может потребоваться регистрация. Вы обязуетесь предоставлять достоверные данные и обновлять их при необходимости.', en: 'Access to certain features may require registration. You agree to provide accurate information and update it as necessary.', uk: 'Для доступу до деяких функцій може знадобитися реєстрація. Ви зобов\'язуєтесь надавати достовірні дані та оновлювати їх за потреби.' },
    section4_title: { ru: '4. Интеллектуальная собственность', en: '4. Intellectual Property', uk: '4. Інтелектуальна власність' },
    section4_content: { ru: 'Все материалы на сайте (контент, логотипы, дизайн и т.д.) являются нашей собственностью или собственностью третьих лиц и защищены законами об авторском праве. Без письменного разрешения запрещено копирование и распространение.', en: 'All materials on the site (content, logos, design, etc.) are our property or the property of third parties and are protected by copyright laws. Copying and distribution without written permission are prohibited.', uk: 'Всі матеріали на сайті (контент, логотипи, дизайн тощо) є нашою власністю або власністю третіх осіб і захищені законами про авторське право. Без письмового дозволу копіювання та розповсюдження заборонено.' },
    section5_title: { ru: '5. Ограничение ответственности', en: '5. Limitation of Liability', uk: '5. Обмеження відповідальності' },
    section5_content: { ru: 'Мы не гарантируем бесперебойную работу сайта и не несем ответственности за возможный ущерб, возникший из-за использования или невозможности использования нашего сервиса.', en: 'We do not guarantee uninterrupted operation of the site and are not liable for any potential damages arising from the use or inability to use our service.', uk: 'Ми не гарантуємо безперебійну роботу сайту і не несемо відповідальності за можливі збитки, що виникли через використання або неможливість використання нашого сервісу.' },
    section6_title: { ru: '6. Изменения условий', en: '6. Changes to Terms', uk: '6. Зміни до умов' },
    section6_content: { ru: 'Мы можем обновлять настоящие условия. При внесении существенных изменений мы постараемся уведомить пользователей.', en: 'We may update these terms. We will endeavor to notify users of any significant changes.', uk: 'Ми можемо оновлювати ці умови. При внесенні суттєвих змін ми намагатимемося повідомити користувачів.' },
};

const listContent = {
    section2_list: [
        { ru: 'распространения вредоносного ПО,', en: 'distributing malware,', uk: 'розповсюдження шкідливого ПЗ,' },
        { ru: 'сбора личной информации других пользователей без их согласия,', en: 'collecting personal information of other users without their consent,', uk: 'збору особистої інформації інших користувачів без їхньої згоди,' },
        { ru: 'автоматизированного доступа без разрешения.', en: 'automated access without permission.', uk: 'автоматизованого доступу без дозволу.' },
    ],
};


export default function TermsOfUsePage({ params }: TermsPageProps) {
  // ✅ 3. Убеждаемся, что lang имеет правильный тип
  const lang = (params.lang || 'en') as Language;

  // ✅ 4. Создаем две простые функции для переводов
  const getText = (key: keyof typeof textContent) => {
    return textContent[key]?.[lang] ?? textContent[key]['en'];
  };

  const getList = (key: keyof typeof listContent) => {
    return listContent[key].map(item => item[lang] ?? item['en']);
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <BackButton />
      <article className="prose prose-invert lg:prose-xl">
        {/* ✅ 5. Используем новые функции */}
        <h1>{getText('title')}</h1>
        <p className="text-sm text-gray-400">{getText('effectiveDate')}</p>
        <p>{getText('welcome')}</p>

        <h2>{getText('section1_title')}</h2>
        <p>{getText('section1_content')}</p>

        <h2>{getText('section2_title')}</h2>
        <p>{getText('section2_content')}</p>
        <ul>
            {getList('section2_list').map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>

        <h2>{getText('section3_title')}</h2>
        <p>{getText('section3_content')}</p>

        <h2>{getText('section4_title')}</h2>
        <p>{getText('section4_content')}</p>

        <h2>{getText('section5_title')}</h2>
        <p>{getText('section5_content')}</p>

        <h2>{getText('section6_title')}</h2>
        <p>{getText('section6_content')}</p>
      </article>
    </div>
  );
}