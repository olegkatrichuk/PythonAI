// src/components/FAQSchema.tsx

interface FAQSchemaProps {
  lang: string;
}

export default function FAQSchema({ lang }: FAQSchemaProps) {
  const getFAQData = () => {
    if (lang === 'ru') {
      return [
        {
          question: "Что такое AI Tools Finder?",
          answer: "AI Tools Finder (GetAIFind) - это comprehensive каталог инструментов искусственного интеллекта, где вы можете найти, сравнить и оценить лучшие AI-решения для любых задач."
        },
        {
          question: "Как найти подходящий AI-инструмент?",
          answer: "Используйте поиск по названию или описанию, фильтруйте по категориям, цене и платформам. Читайте отзывы пользователей и оценки для принятия решения."
        },
        {
          question: "Можно ли добавить свой инструмент?",
          answer: "Да! Зарегистрируйтесь на платформе и добавьте свой AI-инструмент через форму добавления. Ваш инструмент будет доступен всем пользователям каталога."
        },
        {
          question: "Все ли инструменты бесплатные?",
          answer: "Нет, в каталоге представлены инструменты с разными моделями ценообразования: бесплатные, freemium, платные и с пробным периодом. Используйте фильтры для поиска подходящих вариантов."
        }
      ];
    } else if (lang === 'uk') {
      return [
        {
          question: "Що таке AI Tools Finder?",
          answer: "AI Tools Finder (GetAIFind) - це comprehensive каталог інструментів штучного інтелекту, де ви можете знайти, порівняти та оцінити найкращі AI-рішення для будь-яких завдань."
        },
        {
          question: "Як знайти підходящий AI-інструмент?",
          answer: "Використовуйте пошук за назвою або описом, фільтруйте за категоріями, ціною та платформами. Читайте відгуки користувачів та оцінки для прийняття рішення."
        },
        {
          question: "Чи можна додати свій інструмент?",
          answer: "Так! Зареєструйтеся на платформі та додайте свій AI-інструмент через форму додавання. Ваш інструмент буде доступний всім користувачам каталогу."
        },
        {
          question: "Чи всі інструменти безкоштовні?",
          answer: "Ні, в каталозі представлені інструменти з різними моделями ціноутворення: безкоштовні, freemium, платні та з пробним періодом. Використовуйте фільтри для пошуку підходящих варіантів."
        }
      ];
    } else {
      // English
      return [
        {
          question: "What is AI Tools Finder?",
          answer: "AI Tools Finder (GetAIFind) is a comprehensive catalog of artificial intelligence tools where you can discover, compare, and rate the best AI solutions for any task."
        },
        {
          question: "How to find the right AI tool?",
          answer: "Use search by name or description, filter by categories, pricing, and platforms. Read user reviews and ratings to make informed decisions."
        },
        {
          question: "Can I add my own tool?",
          answer: "Yes! Register on the platform and add your AI tool through the submission form. Your tool will be available to all catalog users."
        },
        {
          question: "Are all tools free?",
          answer: "No, the catalog features tools with different pricing models: free, freemium, paid, and trial versions. Use filters to find options that suit your budget."
        }
      ];
    }
  };

  const faqData = getFAQData();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}