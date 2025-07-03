// src/lib/translations.ts

// Тип для наших переводов, чтобы TypeScript нам помогал
type Translations = {
    [key: string]: {
        [lang: string]: string;
    };
};

export const translations: Translations = {
    // --- Navbar ---
    nav_catalog: {
        ru: 'Каталог',
        en: 'Catalog',
        uk: 'Каталог',
    },
    nav_login: {
        ru: 'Войти',
        en: 'Log In',
        uk: 'Увійти',
    },
    nav_register: {
        ru: 'Регистрация',
        en: 'Sign Up',
        uk: 'Реєстрація',
    },

    // --- Главная страница (HomePage) ---
    home_title: {
        ru: 'Найдите Идеальный AI-Инструмент',
        en: 'Find the Perfect AI Tool',
        uk: 'Знайдіть Ідеальний AI-Інструмент',
    },
    home_subtitle: {
        ru: 'Каталог нейросетей для ваших задач.',
        en: 'A catalog of neural networks for your tasks.',
        uk: 'Каталог нейромереж для ваших завдань.',
    },
    home_view_all_tools: {
        ru: 'Смотреть все инструменты',
        en: 'View All Tools',
        uk: 'Дивитися всі інструменти',
    },
    home_what_to_do: {
        ru: 'Что вы хотите сделать?',
        en: 'What do you want to do?',
        uk: 'Що ви хочете зробити?',
    },
    home_tool_of_the_day: {
        ru: 'Инструмент Дня',
        en: 'Tool of the Day',
        uk: 'Інструмент Дня',
    },
    home_new_arrivals: {
        ru: 'Новые поступления',
        en: 'New Arrivals',
        uk: 'Нові надходження',
    },

    // --- Страница каталога (ToolsPage) ---
    tools_page_title: {
        ru: 'Все инструменты',
        en: 'All Tools',
        uk: 'Усі інструменти',
    },
    tools_not_found: {
        ru: 'Инструменты не найдены.',
        en: 'No tool found.',
        uk: 'Інструменти не знайдено.',
    },
    search_placeholder: {
        ru: 'Найти инструмент по названию или описанию...',
        en: 'Search for a tool by name or description...',
        uk: 'Знайти інструмент за назвою або описом...',
    },
    search_button: {
        ru: 'Найти',
        en: 'Search',
        uk: 'Знайти',
    },

    // --- Пагинация ---
    pagination_prev: {
        ru: 'Назад',
        en: 'Previous',
        uk: 'Назад',
    },
    pagination_next: {
        ru: 'Вперед',
        en: 'Next',
        uk: 'Вперед',
    },
    loading_tools: {
        ru: 'Загрузка инструментов...',
        en: 'Loading tool...',
        uk: 'Завантаження інструментів...',
    },
    error_loading_tools: {
        ru: 'Не удалось загрузить инструменты. Убедитесь, что бэкенд-сервер запущен.',
        en: 'Failed to load tool. Please ensure the backend server is running.',
        uk: 'Не вдалося завантажити інструменти. Перевірте, що бекенд-сервер запущено.',
    },
    // Добавьте эти ключи в ваш объект translations в src/lib/translations.ts

    login_page_title: {
        ru: 'Вход в аккаунт',
        en: 'Log In to Your Account',
        uk: 'Вхід в акаунт',
    },
    login_form_password: {
        ru: 'Пароль',
        en: 'Password',
        uk: 'Пароль',
    },
    login_button_loading: {
        ru: 'Вход...',
        en: 'Signing in...',
        uk: 'Вхід...',
    },
    login_no_account: {
        ru: 'Еще нет аккаунта?',
        en: 'Don\'t have an account yet?',
        uk: 'Ще немає акаунта?',
    },
    login_error_token: {
        ru: 'Не удалось получить токен доступа.',
        en: 'Failed to get access token.',
        uk: 'Не вдалося отримати токен доступу.',
    },
    login_error_credentials: {
        ru: 'Неверный email или пароль.',
        en: 'Incorrect email or password.',
        uk: 'Невірний email або пароль.',
    },
    nav_my_tools: {
        ru: 'Мои инструменты',
        en: 'My Tools',
        uk: 'Мої інструменти',
    },
    nav_add_tool: {
        ru: 'Добавить',
        en: 'Add Tool',
        uk: 'Додати',
    },
    nav_logout: {
        ru: 'Выйти',
        en: 'Logout',
        uk: 'Вийти',
    },
    add_tool_page_title: {
        ru: 'Добавить новый инструмент',
        en: 'Add a New Tool',
        uk: 'Додати новий інструмент',
    },
    add_tool_form_name: {
        ru: 'Название',
        en: 'Name',
        uk: 'Назва',
    },
    add_tool_form_description: {
        ru: 'Описание',
        en: 'Description',
        uk: 'Опис',
    },
    add_tool_form_url: {
        ru: 'URL-адрес сайта',
        en: 'Website URL',
        uk: 'URL-адреса сайту',
    },
    add_tool_form_icon_url: {
        ru: 'URL иконки (необязательно)',
        en: 'Icon URL (optional)',
        uk: 'URL іконки (необов\'язково)',
    },
    add_tool_form_category: {
        ru: 'Категория',
        en: 'Category',
        uk: 'Категорія',
    },
    add_tool_form_select_category: {
        ru: 'Выберите категорию',
        en: 'Select a category',
        uk: 'Оберіть категорію',
    },
    add_tool_form_is_featured: {
        ru: 'Рекомендуемый инструмент?',
        en: 'Is this a featured tool?',
        uk: 'Рекомендований інструмент?',
    },
    add_tool_form_submit_button: {
        ru: 'Добавить инструмент',
        en: 'Add Tool',
        uk: 'Додати інструмент',
    },
    add_tool_success: {
        ru: 'Инструмент успешно добавлен!',
        en: 'Tool added successfully!',
        uk: 'Інструмент успішно додано!',
    },
    add_tool_error: {
        ru: 'Ошибка при добавлении инструмента.',
        en: 'Error adding tool.',
        uk: 'Помилка при додаванні інструменту.',
    },
    add_tool_unauthorized: {
        ru: 'Пожалуйста, войдите в систему, чтобы добавить инструмент.',
        en: 'Please log in to add a tool.',
        uk: 'Будь ласка, увійдіть в систему, щоб додати інструмент.',
    },
    learn_more_button: {
        ru: 'Узнать больше',
        en: 'Learn More',
        uk: 'Дізнатися більше',
    },
    visit_website_button: {
        ru: 'Перейти на сайт',
        en: 'Visit Website',
        uk: 'Перейти на сайт',
    },
    validation_invalid_email: {
        ru: 'Пожалуйста, введите корректный email.',
        en: 'Please enter a valid email address.',
        uk: 'Будь ласка, введіть коректний email.',
    },
    validation_password_too_short: {
        ru: 'Пароль должен быть не менее 6 символов.',
        en: 'Password must be at least 6 characters long.',
        uk: 'Пароль має бути не менше 6 символів.',
    },
    validation_passwords_do_not_match: {
        ru: 'Пароли не совпадают.',
        en: 'Passwords do not match.',
        uk: 'Паролі не збігаються.',
    },
    register_form_confirm_password: {
        ru: 'Подтвердите пароль',
        en: 'Confirm Password',
        uk: 'Підтвердіть пароль',
    },
    categories_title: {
        ru: 'Категории',
        en: 'Categories',
        uk: 'Категорії'
    },
    all_categories_button: {
        ru: 'Все категории',
        en: 'All Categories',
        uk: 'Всі категорії'
    },
    tools_page_intro_text: {
        ru: 'Найдите идеальный AI-инструмент для любой задачи. Используйте поиск и фильтры, чтобы сузить выбор.',
        en: 'Find the perfect AI tool for any task. Use search and filters to narrow down your options.',
        uk: 'Знайдіть ідеальний AI-інструмент для будь-якого завдання. Використовуйте пошук та фільтри, щоб звузити вибір.'
    },
    pricing_model_title: {
        ru: 'Модель цены',
        en: 'Pricing Model',
        uk: 'Модель ціни'
    },
    platforms_title: {
        ru: 'Платформы',
        en: 'Platforms',
        uk: 'Платформи'
    },
    pricing_free: {
        ru: 'Бесплатные',
        en: 'Free',
        uk: 'Безкоштовні'
    },
    pricing_freemium: {
        ru: 'Freemium',
        en: 'Freemium',
        uk: 'Freemium'
    },
    pricing_paid: {
        ru: 'Платные',
        en: 'Paid',
        uk: 'Платні'
    },
    pricing_trial: {
        ru: 'С триалом',
        en: 'With Trial',
        uk: 'З тріалом'
    },
    sort_title: {
        ru: 'Сортировка',
        en: 'Sort By',
        uk: 'Сортування'
    },
    sort_newest: {
        ru: 'Сначала новинки',
        en: 'Newest First',
        uk: 'Спочатку новинки'
    },
    sort_popular: {
        ru: 'Сначала популярные',
        en: 'Popular First',
        uk: 'Спочатку популярні'
    },
    sort_discussed: {
        ru: 'Самые обсуждаемые',
        en: 'Most Discussed',
        uk: 'Найбільш обговорювані'
    },

    // --- Страница "О нас" (AboutPage) ---
    about_title: {
        ru: 'О GetAIFind',
        en: 'About GetAIFind',
        uk: 'Про GetAIFind'
    },
    about_subtitle: {
        ru: 'Ваш навигатор в мире искусственного интеллекта.',
        en: 'Your navigator in the world of artificial intelligence.',
        uk: 'Ваш навігатор у світі штучного інтелекту.'
    },
    about_mission_title: {
        ru: 'Наша миссия',
        en: 'Our Mission',
        uk: 'Наша місія'
    },
    about_mission_text: {
        ru: 'Мы верим, что искусственный интеллект способен изменить мир. Наша цель — сделать передовые AI-технологии доступными и понятными для всех, от опытных разработчиков до начинающих энтузиастов. Мы стремимся создать платформу, где каждый может найти идеальный инструмент для своих задач, поделиться опытом и стать частью растущего AI-сообщества.',
        en: 'We believe that artificial intelligence has the power to change the world. Our goal is to make advanced AI technologies accessible and understandable for everyone, from experienced developers to curious enthusiasts. We aim to create a platform where everyone can find the perfect tool for their needs, share their experience, and become part of a growing AI community.',
        uk: 'Ми віримо, що штучний інтелект здатний змінити світ. Наша мета — зробити передові AI-технології доступними та зрозумілими для всіх, від досвідчених розробників до ентузіастів-початківців. Ми прагнемо створити платформу, де кожен може знайти ідеальний інструмент для своїх завдань, поділитися досвідом та стати частиною зростаючої AI-спільноти.'
    },
    about_offer_title: {
        ru: 'Что мы предлагаем',
        en: 'What We Offer',
        uk: 'Що ми пропонуємо'
    },
    about_offer_1_title: {
        ru: 'Тщательно подобранный каталог',
        en: 'Curated Catalog',
        uk: 'Ретельно підібраний каталог'
    },
    about_offer_1_text: {
        ru: 'Каждый инструмент в нашем списке проходит проверку, чтобы вы получали доступ только к качественным и актуальным решениям.',
        en: 'Every tool on our list is reviewed to ensure you get access to only high-quality and relevant solutions.',
        uk: 'Кожен інструмент у нашому списку проходить перевірку, щоб ви отримували доступ тільки до якісних та актуальних рішень.'
    },
    about_offer_2_title: {
        ru: 'Объективные оценки и отзывы',
        en: 'Honest Ratings and Reviews',
        uk: 'Об\'єктивні оцінки та відгуки'
    },
    about_offer_2_text: {
        ru: 'Прозрачная система рейтинга и реальные отзывы пользователей помогут вам сделать правильный выбор.',
        en: 'A transparent rating system and real user reviews will help you make the right choice.',
        uk: 'Прозора система рейтингу та реальні відгуки користувачів допоможуть вам зробити правильний вибір.'
    },
    about_offer_3_title: {
        ru: 'Сообщество энтузиастов',
        en: 'Community of Enthusiasts',
        uk: 'Спільнота ентузіастів'
    },
    about_offer_3_text: {
        ru: 'Присоединяйтесь к обсуждениям, делитесь своими находками и учитесь у других участников нашего сообщества.',
        en: 'Join discussions, share your findings, and learn from other members of our community.',
        uk: 'Приєднуйтесь до обговорень, діліться своїми знахідками та навчайтесь у інших учасників нашої спільноти.'
    },
    about_join_us_title: {
        ru: 'Присоединяйтесь к нам!',
        en: 'Join Us!',
        uk: 'Приєднуйтесь до нас!'
    },
    about_join_us_text: {
        ru: 'Исследуйте каталог, добавляйте свои любимые инструменты и становитесь частью будущего, которое мы строим вместе.',
        en: 'Explore the catalog, add your favorite tools, and become part of the future we are building together.',
        uk: 'Досліджуйте каталог, додавайте свої улюблені інструменти та ставайте частиною майбутнього, яке ми будуємо разом.'
    },
    about_our_story_title: {
        ru: 'Наша история',
        en: 'Our Story',
        uk: 'Наша історія'
    },
    about_our_story_text: {
        ru: 'GetAIFind был основан командой опытных разработчиков и энтузиастов искусственного интеллекта, которые хотели создать платформу, где каждый может найти идеальный инструмент для своих задач.',
        en: 'GetAIFind was founded by a team of experienced developers and AI enthusiasts who wanted to create a platform where everyone can find the perfect tool for their needs.',
        uk: 'GetAIFind був заснований командою досвідчених розробників та ентузіастів штучного інтелекту, які хотіли створити платформу, де кожен може знайти ідеальний інструмент для своїх завдань.'
    },
    about_our_team_title: {
        ru: 'Наша команда',
        en: 'Our Team',
        uk: 'Наша команда'
    },
    about_our_team_text: {
        ru: 'Наша команда состоит из опытных разработчиков, дизайнеров и энтузиастов искусственного интеллекта, которые работают вместе, чтобы создать лучшую платформу для поиска и использования инструментов AI.',
        en: 'Our team consists of experienced developers, designers, and AI enthusiasts who work together to create the best platform for finding and using AI tools.',
        uk: 'Наша команда складається з досвідчених розробників, дизайнерів та ентузіастів штучного інтелекту, які працюють разом, щоб створити найкращу платформу для пошуку та використання інструментів AI.'
    },
    about_careers_title: {
        ru: 'Карьера в GetAIFind',
        en: 'Careers at GetAIFind',
        uk: 'Кар\'єра в GetAIFind'
    },
    about_careers_text: {
        ru: 'Присоединяйтесь к нашей команде и помогайте нам создавать лучшую платформу для поиска и использования инструментов AI.',
        en: 'Join our team and help us create the best platform for finding and using AI tools.',
        uk: 'Приєднуйтесь до нашої команди та допоможіть нам створити найкращу платформу для пошуку та використання інструментів AI.'
    }
};

// Вспомогательная функция, чтобы не писать `translations.key[lang]` каждый раз
export const getTranslations = (lang: string) => {
    return (key: keyof typeof translations) => {
        // Если для ключа или языка нет перевода, возвращаем ключ как запасной вариант
        return translations[key]?.[lang] ?? key;
    }
}