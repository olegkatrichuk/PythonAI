// src/app/[lang]/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "AI Tools Finder", template: "%s | AI Tools Finder" },
  description: "Находите и сравнивайте лучшие AI-инструменты.",
};

export async function generateStaticParams() {
  return [{ lang: 'ru' }, { lang: 'en' }, { lang: 'uk' }];
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    lang: string;
  };
}

export default function RootLayout({ children, params }: RootLayoutProps) {
  // --- ДОБАВЛЕНО: Задаем базовый URL сайта ---
  // !!! ВАЖНО: Замените 'https://www.your-cool-site.com' на ваш реальный опубликованный домен
  const siteUrl = "https://www.your-cool-site.com";

  // --- ДОБАВЛЕНО: Создаем объект микроразметки для сайта ---
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI Tools Finder",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      // Убедитесь, что поиск на вашем сайте работает по этому URL
      "target": `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang={params.lang}>
      {/* --- ДОБАВЛЕНО: Тег <head> для добавления скриптов --- */}
      <head>
        {/* Скрипт с микроразметкой WebSite. Он помогает Google понять суть сайта. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>

      <body className={`${inter.className} bg-slate-900 text-slate-100`}>
        <AuthProvider>
          <Toaster position="bottom-right" toastOptions={{ style: { background: '#334155', color: '#f1f5f9' } }} />
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}