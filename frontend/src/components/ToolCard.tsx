// src/components/ToolCard.tsx
'use client';

import Link from 'next/link';
import type { ITool } from '@/types';

// --- ИЗМЕНЕНИЕ 1: Определяем интерфейс для пропсов ---
// Теперь компонент официально принимает и tool, и lang.
interface ToolCardProps {
  tool: ITool;
  lang: string;
}

// --- ИЗМЕНЕНИЕ 2: Используем новый интерфейс и получаем lang из пропсов ---
export default function ToolCard({ tool, lang }: ToolCardProps) {
  // --- ИЗМЕНЕНИЕ 3: Хук useParams больше не нужен, т.к. lang приходит через props ---
  // const params = useParams();
  // const lang = params.lang as string;

  return (
    // --- ИЗМЕНЕНИЕ 4: Используем tool.slug вместо tool.id для URL ---
    // Также используем путь /tool/ (в единственном числе), как вы и хотели.
    <Link
      href={`/${lang}/tool/${tool.slug}`}
      className="flex flex-col h-full bg-slate-800/50 p-4 rounded-lg border border-transparent hover:border-blue-500 hover:bg-slate-800 transition-all group"
    >
      <h3 className="font-bold text-md mb-2 text-slate-100 group-hover:text-blue-400 truncate">
        {tool.name}
      </h3>

      <p className="text-slate-400 text-sm mb-4 line-clamp-2 flex-grow">
        {tool.description}
      </p>

      {/* Убедимся, что category и category.name существуют, чтобы избежать ошибок */}
      {tool.category && tool.category.name && (
        <div className="mt-auto">
          <span className="bg-blue-600/50 text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full">
            {tool.category.name}
          </span>
        </div>
      )}
    </Link>
  );
}