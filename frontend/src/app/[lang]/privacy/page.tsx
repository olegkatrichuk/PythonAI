// src/app/[lang]/privacy/page.tsx
import BackButton from '@/components/BackButton'; // 👈 1. Импортируем кнопку

type PrivacyPageProps = {
  params: {
    lang: string;
  };
};

// Определяем тип для наших языков
type Language = 'ru' | 'en' | 'uk';

// Разделяем переводы на два объекта: для текста и для списков
const textContent = {
    title: { ru: 'Политика конфиденциальности', en: 'Privacy Policy', uk: 'Політика конфіденційності' },
    effectiveDate: { ru: 'Дата вступления в силу: 2 июля 2025 г.', en: 'Effective Date: July 2, 2025', uk: 'Дата набрання чинності: 2 липня 2025 р.' },
    intro: { ru: 'Мы уважаем вашу конфиденциальность и обязуемся защищать ваши персональные данные. В настоящей Политике описывается, какие данные мы собираем, как их используем и какие у вас есть права.', en: 'We respect your privacy and are committed to protecting your personal data. This Policy describes what data we collect, how we use it, and what rights you have.', uk: 'Ми поважаємо вашу конфіденційність і зобов\'язуємося захищати ваші персональні дані. У цій Політиці описується, які дані ми збираємо, як їх використовуємо та які у вас є права.' },
    section1_title: { ru: '1. Какие данные мы собираем', en: '1. What Data We Collect', uk: '1. Які дані ми збираємо' },
    section1_content: { ru: 'Мы можем собирать следующие данные:', en: 'We may collect the following data:', uk: 'Ми можемо збирати наступні дані:' },
    section2_title: { ru: '2. Как мы используем данные', en: '2. How We Use Data', uk: '2. Як ми використовуємо дані' },
    section2_content: { ru: 'Собранные данные используются для:', en: 'The collected data is used for:', uk: 'Зібрані дані використовуються для:' },
    section3_title: { ru: '3. Cookies', en: '3. Cookies', uk: '3. Cookies' },
    section3_content: { ru: 'Мы используем cookies для:', en: 'We use cookies for:', uk: 'Ми використовуємо cookies для:' },
    section3_footer: { ru: 'Вы можете отключить cookies в настройках браузера, однако это может повлиять на работу сайта.', en: 'You can disable cookies in your browser settings, however, this may affect the site\'s functionality.', uk: 'Ви можете вимкнути cookies в налаштуваннях браузера, однак це може вплинути на роботу сайту.' },
    section4_title: { ru: '4. Передача данных третьим лицам', en: '4. Data Transfer to Third Parties', uk: '4. Передача даних третім особам' },
    section4_content: { ru: 'Мы не продаём и не передаём ваши данные третьим лицам, за исключением случаев, когда это требуется по закону или для работы сторонних сервисов (например, аналитических платформ).', en: 'We do not sell or transfer your data to third parties, except where required by law or for the operation of third-party services (e.g., analytics platforms).', uk: 'Ми не продаємо і не передаємо ваші дані третім особам, за винятком випадків, коли це вимагається законом або для роботи сторонніх сервісів (наприклад, аналітичних платформ).' },
    section5_title: { ru: '5. Хранение данных', en: '5. Data Storage', uk: '5. Зберігання даних' },
    section5_content: { ru: 'Данные хранятся только столько, сколько необходимо для целей, описанных в данной политике, или в соответствии с законом.', en: 'Data is stored only as long as necessary for the purposes described in this policy or as required by law.', uk: 'Дані зберігаються лише стільки, скільки необхідно для цілей, описаних у цій політиці, або відповідно до закону.' },
    section6_title: { ru: '6. Ваши права', en: '6. Your Rights', uk: '6. Ваші права' },
    section6_content: { ru: 'Вы имеете право:', en: 'You have the right to:', uk: 'Ви маєте право:' },
    section6_footer: { ru: 'Для этого вы можете связаться с нами по email, указанному на сайте.', en: 'To do so, you can contact us via the email provided on the site.', uk: 'Для цього ви можете зв\'язатися з нами по email, вказаному на сайті.' },
    section7_title: { ru: '7. Безопасность', en: '7. Security', uk: '7. Безпека' },
    section7_content: { ru: 'Мы применяем разумные технические и организационные меры для защиты данных от несанкционированного доступа, изменения и утечки.', en: 'We apply reasonable technical and organizational measures to protect data from unauthorized access, alteration, and leakage.', uk: 'Ми застосовуємо розумні технічні та організаційні заходи для захисту даних від несанкціонованого доступу, зміни та витоку.' }
};

const listContent = {
    section1_list: [
      { ru: 'Email-адрес (при регистрации или подписке)', en: 'Email address (during registration or subscription)', uk: 'Email-адреса (при реєстрації або підписці)' },
      { ru: 'IP-адрес', en: 'IP address', uk: 'IP-адреса' },
      { ru: 'Файлы cookie и данные о посещениях (в целях аналитики и улучшения работы сайта)', en: 'Cookies and visit data (for analytics and site improvement purposes)', uk: 'Файли cookie та дані про відвідування (з метою аналітики та покращення роботи сайту)' },
    ],
    section2_list: [
        { ru: 'предоставления и улучшения наших услуг;', en: 'providing and improving our services;', uk: 'надання та покращення наших послуг;' },
        { ru: 'связи с вами (по email);', en: 'communicating with you (via email);', uk: 'зв\'язку з вами (по email);' },
        { ru: 'аналитики посещаемости и производительности сайта.', en: 'site traffic and performance analytics.', uk: 'аналітики відвідуваності та продуктивності сайту.' },
    ],
    section3_list: [
        { ru: 'аутентификации пользователей;', en: 'user authentication;', uk: 'аутентифікації користувачів;' },
        { ru: 'аналитики (с помощью сторонних сервисов, например, Google Analytics);', en: 'analytics (with the help of third-party services, e.g., Google Analytics);', uk: 'аналітики (за допомогою сторонніх сервісів, наприклад, Google Analytics);' },
        { ru: 'персонализации интерфейса.', en: 'interface personalization.', uk: 'персоналізації інтерфейсу.' },
    ],
    section6_list: [
        { ru: 'запросить доступ к вашим данным;', en: 'request access to your data;', uk: 'запросити доступ до ваших даних;' },
        { ru: 'потребовать их удаления;', en: 'demand their deletion;', uk: 'вимагати їх видалення;' },
        { ru: 'отозвать согласие на обработку.', en: 'withdraw consent for processing.', uk: 'відкликати згоду на обробку.' },
    ],
};

export default function PrivacyPolicyPage({ params }: PrivacyPageProps) {
  const lang = (params.lang || 'en') as Language;

  const getText = (key: keyof typeof textContent) => {
    return textContent[key]?.[lang] ?? textContent[key]['en'];
  };

  const getList = (key: keyof typeof listContent) => {
    return listContent[key].map(item => item[lang] ?? item['en']);
  };

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <BackButton /> {/* 👈 2. Добавляем кнопку */}
      <article className="prose prose-invert lg:prose-xl">
        <h1>{getText('title')}</h1>
        <p className="text-sm text-gray-400">{getText('effectiveDate')}</p>
        <p>{getText('intro')}</p>

        <h2>{getText('section1_title')}</h2>
        <p>{getText('section1_content')}</p>
        <ul>
            {getList('section1_list').map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>

        <h2>{getText('section2_title')}</h2>
        <p>{getText('section2_content')}</p>
        <ul>
            {getList('section2_list').map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>

        <h2>{getText('section3_title')}</h2>
        <p>{getText('section3_content')}</p>
        <ul>
            {getList('section3_list').map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
        <p>{getText('section3_footer')}</p>

        <h2>{getText('section4_title')}</h2>
        <p>{getText('section4_content')}</p>

        <h2>{getText('section5_title')}</h2>
        <p>{getText('section5_content')}</p>

        <h2>{getText('section6_title')}</h2>
        <p>{getText('section6_content')}</p>
        <ul>
            {getList('section6_list').map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
        <p>{getText('section6_footer')}</p>

        <h2>{getText('section7_title')}</h2>
        <p>{getText('section7_content')}</p>
      </article>
    </div>
  );
}