// src/app/[lang]/layout.tsx

import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "@/app/providers";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import BackToTop from "@/components/BackToTop";
import { PageTransition } from "@/components/PageTransition";
import { InitialLoadWrapper, NavbarAnimation, FooterAnimation } from "@/components/SmoothAnimations";
import { HydrationSafeWrapper } from "@/components/SmoothLoader";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.getaifind.com'),
  title: { default: "AI Tools Finder", template: "%s | AI Tools Finder" },
  description: "Находите и сравнивайте лучшие AI-инструменты.",
  keywords: [
    'AI tools', 'нейросети', 'искусственный интеллект', 'machine learning',
    'neural networks', 'chatbot', 'GPT', 'каталог нейросетей',
    'AI инструменты', 'artificial intelligence', 'deep learning',
    'computer vision', 'natural language processing', 'automation',
    'productivity tools', 'business AI', 'creative AI', 'образование AI'
  ],
  authors: [{ name: 'GetAIFind Team', url: 'https://getaifind.com' }],
  creator: 'GetAIFind',
  publisher: 'GetAIFind',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "AI Tools Finder",
    description: "Находите и сравнивайте лучшие AI-инструменты.",
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'AI Tools Finder',
    locale: 'ru',
    type: 'website',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'AI Tools Finder - Каталог лучших AI инструментов',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI Tools Finder",
    description: "Находите и сравнивайте лучшие AI-инструменты.",
    creator: '@ilikenewcoin',
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification',
  },
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
    "alternateName": "GetAIFind",
    "url": siteUrl,
    "description": "Comprehensive catalog of AI tools and neural networks for professionals and enthusiasts",
    "publisher": {
      "@type": "Organization",
      "name": "GetAIFind",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo.png`
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/${params.lang}/tool?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://twitter.com/ilikenewcoin",
      "https://github.com/getaifind"
    ]
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GetAIFind",
    "url": siteUrl,
    "logo": `${siteUrl}/logo.png`,
    "description": "Leading platform for discovering and comparing AI tools and neural networks",
    "foundingDate": "2024",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@getaifind.com"
    }
  };

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${inter.variable} ${jakarta.variable} font-sans bg-background text-foreground`}>
        <GoogleAnalytics />
        <Providers>
          <AuthProvider>
            <Toaster position="bottom-right" toastOptions={{ style: { background: '#334155', color: '#f1f5f9' } }} />

            <HydrationSafeWrapper>
              <InitialLoadWrapper>
                {/* Navbar - клиентский компонент, ему lang не нужен */}
                <NavbarAnimation>
                  <Navbar />
                </NavbarAnimation>

                <PageTransition>
                  <main className="container mx-auto px-4 py-8 min-h-screen">
                    <AnalyticsTracker />
                    {children}
                  </main>
                </PageTransition>
                
                <KeyboardShortcuts />
                <BackToTop showProgress={true} />

                {/* Footer - серверный компонент, ему нужен lang */}
                <FooterAnimation>
                  <Footer lang={params.lang} />
                </FooterAnimation>
              </InitialLoadWrapper>
            </HydrationSafeWrapper>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}