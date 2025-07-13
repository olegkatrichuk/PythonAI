// src/components/ToolCard.tsx
'use client';

import Link from 'next/link';
import type { ITool } from '@/types';
import { motion } from 'framer-motion';
import { trackEvents } from '@/lib/gtag';
import { SwipeableCard, useIsMobile } from '@/components/MobileTouchEnhanced';

// --- ИЗМЕНЕНИЕ 1: Определяем интерфейс для пропсов ---
// Теперь компонент официально принимает и tool, и lang.
interface ToolCardProps {
  tool: ITool;
  lang: string;
}

// --- ИЗМЕНЕНИЕ 2: Используем новый интерфейс и получаем lang из пропсов ---
export default function ToolCard({ tool, lang }: ToolCardProps) {
  const isMobile = useIsMobile();

  const handleToolClick = () => {
    // Track tool click event in GA4
    trackEvents.toolView(tool.name, tool.category?.name || 'Unknown');
  };

  const handleSwipeLeft = () => {
    // Could implement "add to favorites" or other action
    console.log('Swiped left on:', tool.name);
  };

  const handleSwipeRight = () => {
    // Could implement "view details" or other action
    window.open(tool.url, '_blank');
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    },
  };

  const cardContent = (
    <div className="flex flex-col h-full bg-cardBackground p-3 sm:p-4 rounded-lg border border-transparent hover:border-primary hover:bg-cardBackground/70 transition-all group min-h-[240px] sm:min-h-[280px]">
      <h3 className="font-bold text-sm sm:text-md mb-2 text-foreground group-hover:text-primary truncate">
        {tool.name}
      </h3>

      <p className="text-foreground/70 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-grow">
        {tool.description}
      </p>

      {/* Display Platforms */}
      {tool.platforms && tool.platforms.length > 0 && (
        <div className="flex flex-wrap gap-1 sm:gap-2 mt-2 mb-3 sm:mb-4">
          {tool.platforms.slice(0, isMobile ? 2 : 3).map((platform, index) => (
            <span
              key={index}
              className="bg-secondary/20 text-secondary-foreground text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full"
            >
              {platform}
            </span>
          ))}
          {tool.platforms.length > (isMobile ? 2 : 3) && (
            <span className="text-foreground/50 text-xs">
              +{tool.platforms.length - (isMobile ? 2 : 3)} more
            </span>
          )}
        </div>
      )}

      {/* Убедимся, что category и category.name существуют, чтобы избежать ошибок */}
      {tool.category && tool.category.name && (
        <div className="mt-auto">
          <span className="bg-primary/10 text-primary text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full">
            {tool.category.name}
          </span>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ 
          duration: 0.4,
          ease: "easeOut"
        }}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
      >
        <SwipeableCard
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onTap={() => {
            handleToolClick();
            window.location.href = `/${lang}/tool/${tool.slug}`;
          }}
          className="touch-manipulation h-full"
        >
          {cardContent}
        </SwipeableCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ 
        duration: 0.4,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <Link
        href={`/${lang}/tool/${tool.slug}`}
        onClick={handleToolClick}
        className="block h-full"
      >
        {cardContent}
      </Link>
    </motion.div>
  );
}