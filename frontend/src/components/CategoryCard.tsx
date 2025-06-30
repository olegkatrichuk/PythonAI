// src/components/CategoryCard.tsx

'use client';

import Link from 'next/link';
import { useState } from 'react';

// Тип для категории
interface ICategory {
  id: number;
  name: string;
}

// Стили
const cardStyles: React.CSSProperties = {
  backgroundColor: '#2a2a2e',
  borderRadius: '12px',
  padding: '20px',
  textDecoration: 'none',
  color: '#eee',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  minHeight: '100px',
  transition: 'all 0.2s ease-in-out',
};

const cardHoverStyles: React.CSSProperties = {
  transform: 'scale(1.05)',
  backgroundColor: '#007bff',
};

export default function CategoryCard({ category }: { category: ICategory }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    // Ссылка будет вести на страницу всех инструментов, отфильтрованную по ID этой категории
    <Link
      href={`/tools?category_id=${category.id}`}
      style={{ ...cardStyles, ...(isHovered ? cardHoverStyles : {}) }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>{category.name}</h3>
    </Link>
  );
}