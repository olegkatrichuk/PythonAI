// src/components/PaginationControls.tsx

'use client'; // Указываем, что это клиентский компонент

import Link from 'next/link';
// --- 1. Импортируем хуки и функцию-переводчик ---
import { useParams } from 'next/navigation';
import { getTranslations } from '@/lib/translations';

type PaginationControlsProps = {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  prevPath: string;
  nextPath: string;
};

export default function PaginationControls({
  hasNextPage,
  hasPrevPage,
  prevPath,
  nextPath
}: PaginationControlsProps) {
  // --- 2. Получаем язык и функцию-переводчик ---
  const params = useParams();
  const lang = params.lang as string;
  const t = getTranslations(lang);

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#555',
    cursor: 'not-allowed',
    opacity: 0.6,
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
      {hasPrevPage ? (
        <Link href={prevPath} style={buttonStyle}>
          {/* --- 3. Используем переводы --- */}
          &larr; {t('pagination_prev')}
        </Link>
      ) : (
        <div style={disabledButtonStyle}>
          &larr; {t('pagination_prev')}
        </div>
      )}

      {hasNextPage ? (
        <Link href={nextPath} style={buttonStyle}>
          {t('pagination_next')} &rarr;
        </Link>
      ) : (
        <div style={disabledButtonStyle}>
          {t('pagination_next')} &rarr;
        </div>
      )}
    </div>
  );
}