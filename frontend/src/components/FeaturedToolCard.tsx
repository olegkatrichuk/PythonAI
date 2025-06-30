// src/components/FeaturedToolCard.tsx

import Link from 'next/link';
import type { ITool } from '@/types';

// Типы для пропсов компонента
type FeaturedToolCardProps = {
  tool: ITool;
  lang: string;
  buttonText: string;
};

// Это Серверный Компонент, ему не нужна директива 'use client'
export default function FeaturedToolCard({ tool, lang, buttonText }: FeaturedToolCardProps) {
  // Если по какой-то причине инструмент не пришел, ничего не рендерим
  if (!tool) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 border border-blue-500/50 rounded-2xl p-8 text-center flex flex-col items-center shadow-lg shadow-blue-600/10">

      {/* Тег категории */}
      {tool.category && (
        <span className="bg-blue-600/20 text-blue-300 text-sm font-semibold px-4 py-1 rounded-full mb-6">
          {tool.category.name}
        </span>
      )}

      {/* Название */}
      <h3 className="text-4xl font-bold text-white mb-4">
        {tool.name}
      </h3>

      {/* Описание */}
      <p className="text-lg text-slate-400 max-w-xl mx-auto mb-6">
        {tool.description}
      </p>

      {/* --- ИСПРАВЛЕНИЕ ЗДЕСЬ --- */}
      {/* Кнопка с правильной ссылкой, использующей tool.slug */}
      <Link
        href={`/${lang}/tool/${tool.slug}`}
        className="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-700 transition-colors shadow-md"
      >
        {buttonText}
      </Link>
    </div>
  );
}