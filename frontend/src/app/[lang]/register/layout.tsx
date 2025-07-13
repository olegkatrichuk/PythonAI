// src/app/[lang]/register/layout.tsx

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - AI Tools Finder',
  description: 'Create your GetAIFind account to contribute to our AI tools catalog',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}