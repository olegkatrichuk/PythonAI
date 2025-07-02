// src/components/BackButton.tsx
'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="text-sm text-slate-300 hover:text-white transition-colors mb-8"
    >
      &larr; Назад
    </button>
  );
}