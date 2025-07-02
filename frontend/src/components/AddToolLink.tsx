// src/components/AddToolLink.tsx

'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';

export default function AddToolLink({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const params = useParams();
  const lang = params.lang as string;

  // Определяем, куда будет вести ссылка, в зависимости от того, залогинен ли пользователь
  const href = user ? `/${lang}/tool/add` : `/${lang}/login`;

  return (
    <Link href={href} className="hover:text-white transition-colors">
      {children}
    </Link>
  );
}