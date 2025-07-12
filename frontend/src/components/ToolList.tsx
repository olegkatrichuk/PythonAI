// src/components/ToolList.tsx

'use client';

import { useSearchParams } from 'next/navigation';
import { getTranslations } from '@/lib/translations';
import { motion } from 'framer-motion';

import type { ITool, ICategory } from '@/types';
import ToolCard from '@/components/ToolCard';
import PaginationControls from '@/components/PaginationControls';

interface PageTool extends ITool {
    category: ICategory;
}

interface ToolListProps {
    tools: PageTool[];
    total: number;
    page: number;
    limit: number;
    lang: string;
    basePath: string;
}

export default function ToolList({ tools, total, page, limit, lang }: ToolListProps) {
    const searchParams = useSearchParams();
    const t = getTranslations(lang);

    // Логика ��агинации
    const hasPrevPage = page > 1;
    const hasNextPage = (page * limit) < total;

    // --- ИСПРАВЛЕНИЕ ЗДЕСЬ ---
    const buildPageUrl = (pageNumber: number): string => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(pageNumber));
        // Теперь мы добавляем язык в начало URL и используем /tool, как вы и хотели.
        return `/${lang}/tool?${params.toString()}`;
    };

    const prevPath = buildPageUrl(page - 1);
    const nextPath = buildPageUrl(page + 1);

    if (tools.length === 0) {
        return (
            <p className="text-center text-lg text-slate-400 py-10">
                {t('tools_not_found')}
            </p>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <>
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {tools.map(tool => (
                    <ToolCard key={tool.id} tool={tool} lang={lang} />
                ))}
            </motion.div>

            {/* Пагинация будет отображаться только если инструментов больше, чем на одной странице */}
            {total > limit && (
                 <PaginationControls
                    hasNextPage={hasNextPage}
                    hasPrevPage={hasPrevPage}
                    prevPath={prevPath}
                    nextPath={nextPath}
                />
            )}
        </>
    );
}