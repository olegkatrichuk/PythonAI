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
    sort_by_label: {
    ru: 'Сортировать по',
    en: 'Sort by',
    uk: 'Сортувати за'
},
sort_latest: {
    ru: 'Новизне',
    en: 'Latest',
    uk: 'Новизні'
},
sort_rating: {
    ru: 'Рейтингу',
    en: 'Rating',
    uk: 'Рейтингом'
}

};

// Вспомогательная функция, чтобы не писать `translations.key[lang]` каждый раз
export const getTranslations = (lang: string) => {
    return (key: keyof typeof translations) => {
        // Если для ключа или языка нет перевода, возвращаем ключ как запасной вариант
        return translations[key]?.[lang] ?? key;
    }
}