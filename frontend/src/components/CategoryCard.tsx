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
export default function CategoryCard({ category }: { category: ICategory }) {
  return (
    // Ссылка будет вести на страницу всех инструментов, отфильтрованную по ID этой категории
    <Link
      href={`/tools?category_id=${category.id}`}
      className="flex flex-col items-center justify-center text-center bg-cardBackground rounded-xl p-5 text-foreground min-h-[100px] transition-all duration-200 ease-in-out hover:scale-105 hover:bg-primary"
    >
      <h3 className="m-0 text-lg font-semibold">{category.name}</h3>
    </Link>
  );
}