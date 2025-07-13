// src/components/InfiniteScrollTools.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { publicApi } from '@/lib/api';
import type { ITool } from '@/types';
import ToolCard from '@/components/ToolCard';
import { ToolCardSkeleton } from '@/components/SkeletonLoaders';
import { getTranslations } from '@/lib/translations';

interface InfiniteScrollToolsProps {
  initialTools: ITool[];
  initialTotal: number;
  limit?: number;
}

export default function InfiniteScrollTools({
  initialTools,
  initialTotal,
  limit = 12
}: InfiniteScrollToolsProps) {
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params.lang as string;
  const t = getTranslations(lang);

  const [tools, setTools] = useState<ITool[]>(initialTools);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTools.length < initialTotal);
  const [error, setError] = useState<string | null>(null);

  const loadingRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load more tools
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const queryParams = new URLSearchParams(searchParams.toString());
      queryParams.set('page', nextPage.toString());
      queryParams.set('limit', limit.toString());

      const response = await publicApi.get(`/api/tools/?${queryParams.toString()}`, {
        headers: { 'Accept-Language': lang }
      });

      if (response.data?.items) {
        const newTools = response.data.items;
        
        if (newTools.length === 0) {
          setHasMore(false);
        } else {
          setTools(prevTools => {
            // Remove duplicates
            const existingIds = new Set(prevTools.map(tool => tool.id));
            const uniqueNewTools = newTools.filter((tool: ITool) => !existingIds.has(tool.id));
            return [...prevTools, ...uniqueNewTools];
          });
          
          setPage(nextPage);
          
          // Check if we've loaded all tools
          const totalLoaded = tools.length + newTools.length;
          if (totalLoaded >= response.data.total) {
            setHasMore(false);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load more tools:', err);
      setError('Failed to load more tools. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, searchParams, lang, limit, tools.length]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!loadingRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before reaching the target
        threshold: 0.1
      }
    );

    observerRef.current.observe(loadingRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore, hasMore, isLoading]);

  // Reset when search params change
  useEffect(() => {
    setTools(initialTools);
    setPage(1);
    setHasMore(initialTools.length < initialTotal);
    setError(null);
  }, [initialTools, initialTotal, searchParams]);

  // Detect mobile device
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (!isMobile) {
    // Return regular grid for desktop
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ToolCard tool={tool} lang={lang} />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tools List */}
      <div className="space-y-4">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            className="w-full"
          >
            <ToolCard tool={tool} lang={lang} />
          </motion.div>
        ))}
      </div>

      {/* Loading indicator */}
      {hasMore && (
        <div ref={loadingRef} className="py-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <ToolCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={loadMore}
                className="px-6 py-3 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Load More Tools
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* End of list */}
      {!hasMore && tools.length > 0 && (
        <div className="text-center py-8">
          <p className="text-foreground/70">
            {tools.length === 1 
              ? "You've seen the only tool available" 
              : `You've seen all ${tools.length} tools`}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!hasMore && tools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-foreground/70 text-lg mb-4">{t('tools_not_found')}</p>
          <p className="text-foreground/50">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

// Hook for mobile detection
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};