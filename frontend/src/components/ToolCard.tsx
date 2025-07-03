// src/components/ToolCard.tsx
'use client';

import Link from 'next/link';
import type { ITool } from '@/types';
import { motion } from 'framer-motion';

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      {/* --- ИЗМЕНЕНИЕ 4: Используем tool.slug вместо tool.id для URL --- */}
      {/* Также используем путь /tool/ (в единственном числе), как вы и хотели. */}
      <Link
        href={`/${lang}/tool/${tool.slug}`}
        className="flex flex-col h-full bg-cardBackground p-4 rounded-lg border border-transparent hover:border-primary hover:bg-cardBackground/70 transition-all group"
      >
        <h3 className="font-bold text-md mb-2 text-foreground group-hover:text-primary truncate">
          {tool.name}
        </h3>

        <p className="text-foreground/70 text-sm mb-4 line-clamp-2 flex-grow">
          {tool.description}
        </p>

        {/* Убедимся, что category и category.name существуют, чтобы избежать ошибок */}
        {tool.category && tool.category.name && (
          <div className="mt-auto">
            <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
              {tool.category.name}
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}