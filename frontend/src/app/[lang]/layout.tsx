// src/app/[lang]/layout.tsx

import type { Metadata } from "next";
import "../globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/app/providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: "AI Tools Finder", template: "%s | AI Tools Finder" },
  description: "Находите и сравнивайте лучшие AI-инструменты.",
};

export async function generateStaticParams() {
  return [{ lang: 'ru' }, { lang: 'en' }, { lang: 'uk' }];
}

// ❗️ Тип для Next.js 15, где params - это Promise
interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    lang: string;
  }>;
}

// ❗️ Компонент должен быть `async`, чтобы использовать await
export default async function RootLayout({ children, params: paramsPromise }: RootLayoutProps) {
  // ❗️ Сначала "распаковываем" params с помощью await
  const params = await paramsPromise;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://getaifind.com";

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI Tools Finder",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="bg-background text-foreground">
        <Providers>
          <AuthProvider>
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#334155', color: '#f1f5f9' } }} />

            {/* Navbar - клиентский компонент, ему lang не нужен */}
            <Navbar />

            <main className="container mx-auto px-4 py-8 min-h-screen">
              {children}
            </main>

            {/* Footer - серверный компонент, ему нужен lang */}
            <Footer lang={params.lang} />
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}