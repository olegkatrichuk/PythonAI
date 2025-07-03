// src/app/[lang]/about/page.tsx

import type { Metadata } from 'next';
import { getTranslations } from '@/lib/translations';
import { HeartHandshake, Sparkles, Users } from 'lucide-react';

// SEO Metadata
export async function generateMetadata({ params }: { params: { lang: string } }) {
  const t = getTranslations(params.lang);
  return {
    title: t('about_title'),
    description: t('about_subtitle'),
  };
}

// Helper component for feature cards
const FeatureCard = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <div className="bg-background/50 p-6 rounded-lg shadow-md border border-border/20 backdrop-blur-sm">
    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-full mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 font-jakarta">{title}</h3>
    <p className="text-foreground/70">{text}</p>
  </div>
);

export default async function AboutPage({ params }: { params: { lang: string } }) {
  const t = getTranslations(params.lang);

  return (
    <div className="container mx-auto max-w-5xl py-16 px-4">
      {/* Hero Section */}
      <section className="text-center py-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-foreground font-jakarta">
          {t('about_title')}
        </h1>
        <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto">
          {t('about_subtitle')}
        </p>
      </section>

      {/* Our Mission Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 font-jakarta">{t('about_mission_title')}</h2>
          <p className="text-foreground/80 text-lg leading-relaxed">
            {t('about_mission_text')}
          </p>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12 font-jakarta">{t('about_offer_title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title={t('about_offer_1_title')}
            text={t('about_offer_1_text')}
          />
          <FeatureCard
            icon={<HeartHandshake className="w-6 h-6" />}
            title={t('about_offer_2_title')}
            text={t('about_offer_2_text')}
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title={t('about_offer_3_title')}
            text={t('about_offer_3_text')}
          />
        </div>
      </section>

      {/* Join Us Section */}
      <section className="text-center py-16 bg-primary/5 rounded-lg">
        <h2 className="text-3xl font-bold mb-4 font-jakarta">{t('about_join_us_title')}</h2>
        <p className="text-lg text-foreground/70 max-w-2xl mx-auto mb-8">
          {t('about_join_us_text')}
        </p>
        <a
          href={`/${params.lang}/tool`}
          className="inline-block bg-primary text-primaryForeground font-bold py-3 px-8 rounded-lg text-lg hover:bg-primary/90 transition-colors shadow-lg"
        >
          {t('home_view_all_tools')}
        </a>
      </section>
    </div>
  );
}