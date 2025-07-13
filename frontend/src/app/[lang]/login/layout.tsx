// src/app/[lang]/login/layout.tsx

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - AI Tools Finder',
  description: 'Sign in to your GetAIFind account to access personalized features',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}