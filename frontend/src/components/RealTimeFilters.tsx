// src/components/RealTimeFilters.tsx
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { getTranslations } from '@/lib/translations';
import { api } from '@/lib/api';
import type { ITool, ICategory } from '@/types';
import ToolCard from '@/components/ToolCard';
import { ToolCardGridSkeleton } from '@/components/SkeletonLoaders';
import { SidebarAnimation } from '@/components/SmoothAnimations';
import { AnimatedCard } from '@/components/PageTransition';
import axios from 'axios';

interface RealTimeFiltersProps {
  initialTools: ITool[];
  initialTotal: number;
  categories: ICategory[];
  initialPage: number;
  initialLimit: number;
}

interface FilterState {
  category_id?: string;
  pricing_model?: string;
  platforms?: string[];
  sort?: string;
  q?: string;
}

const PRICING_OPTIONS = [
  { value: 'free', labelKey: 'pricing_free' },
  { value: 'freemium', labelKey: 'pricing_freemium' },
  { value: 'paid', labelKey: 'pricing_paid' },
  { value: 'trial', labelKey: 'pricing_trial' },
];

const SORT_OPTIONS = [
  { value: 'newest', labelKey: 'sort_newest' },
  { value: 'popular', labelKey: 'sort_popular' },
  { value: 'discussed', labelKey: 'sort_discussed' },
];

const COMMON_PLATFORMS = [
  'Web', 'iOS', 'Android', 'Windows', 'macOS', 'Linux', 'Chrome Extension', 'API'
];

export default function RealTimeFilters({
  initialTools,
  initialTotal,
  categories,
  initialPage,
  initialLimit
}: RealTimeFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = params.lang as string;
  const t = getTranslations(lang);

  const [tools, setTools] = useState<ITool[]>(initialTools);
  const [total, setTotal] = useState(initialTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Get current filters from URL
  const currentFilters: FilterState = useMemo(() => ({
    category_id: searchParams.get('category_id') || undefined,
    pricing_model: searchParams.get('pricing_model') || undefined,
    platforms: searchParams.get('platforms')?.split(',').filter(Boolean) || [],
    sort: searchParams.get('sort') || 'newest',
    q: searchParams.get('q') || undefined,
  }), [searchParams]);

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    pricing: true,
    platforms: false,
    sort: true
  });

  // Debounced filter application
  const applyFilters = useCallback(async (filters: FilterState, resetPage = true) => {
    // Don't make requests if component is unmounted
    if (!isMountedRef.current) {
      return;
    }
    
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setIsLoading(true);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.q) queryParams.set('q', filters.q);
      if (filters.category_id) queryParams.set('category_id', filters.category_id);
      if (filters.pricing_model) queryParams.set('pricing_model', filters.pricing_model);
      if (filters.platforms && filters.platforms.length > 0) {
        queryParams.set('platforms', filters.platforms.join(','));
      }
      if (filters.sort) queryParams.set('sort', filters.sort);
      
      const currentPage = resetPage ? 1 : page;
      queryParams.set('page', currentPage.toString());
      queryParams.set('limit', initialLimit.toString());

      // Update URL without refresh
      const newUrl = `/${lang}/tool?${queryParams.toString()}`;
      router.replace(newUrl, { scroll: false });

      // Fetch new data with abort signal
      const response = await api.get(`/api/tools/?${queryParams.toString()}`, {
        headers: { 'Accept-Language': lang },
        signal: abortControllerRef.current.signal
      });

      if (response.data && isMountedRef.current) {
        setTools(response.data.items || []);
        setTotal(response.data.total || 0);
        if (resetPage) setPage(1);
      }
    } catch (error) {
      // Silently ignore cancelled/aborted requests - these are expected during navigation
      if (
        axios.isCancel(error) ||
        (error instanceof DOMException && error.name === 'AbortError') ||
        (axios.isAxiosError(error) && (
          error.code === 'ERR_CANCELED' || 
          error.message?.includes('canceled') ||
          error.message?.includes('aborted')
        ))
      ) {
        return;
      }
      
      // Handle specific error cases
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        
        // Rate limiting - could implement retry logic here if needed
        if (status === 429) {
          // Silently ignore rate limiting errors for now
          // Could show a toast notification or retry after delay
          return;
        }
        
        // Only log server errors (5xx)
        if (status >= 500) {
          console.error('Server error:', status, error.response.data);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [lang, router, page, initialLimit]);

  // Effect to apply filters when URL search params change (e.g., browser back/forward)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      applyFilters(currentFilters, false);
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [currentFilters, applyFilters]);

  // Mount/unmount tracking and cleanup effect
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...currentFilters, [key]: value };
    if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    }
    applyFilters(newFilters);
  };

  const togglePlatform = (platform: string) => {
    const currentPlatforms = currentFilters.platforms || [];
    const newPlatforms = currentPlatforms.includes(platform)
      ? currentPlatforms.filter(p => p !== platform)
      : [...currentPlatforms, platform];
    
    updateFilter('platforms', newPlatforms);
  };

  const clearAllFilters = () => {
    router.replace(`/${lang}/tool`, { scroll: false });
  };

  const hasActiveFilters = Object.values(currentFilters).some(value => 
    value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FilterSection = ({ 
    title, 
    isExpanded, 
    onToggle, 
    children 
  }: { 
    title: string; 
    isExpanded: boolean; 
    onToggle: () => void; 
    children: React.ReactNode; 
  }) => (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-3 bg-cardBackground rounded-lg hover:bg-cardBackground/80 transition-colors"
      >
        <span className="font-medium text-foreground">{title}</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-foreground/70" />
        ) : (
          <ChevronDown className="w-4 h-4 text-foreground/70" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Filters Sidebar */}
      <SidebarAnimation className="lg:w-1/4">
        <div className="sticky top-4">
          {/* Filter Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Filters</h2>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Categories */}
          <FilterSection
            title={t('categories_title')}
            isExpanded={expandedSections.categories}
            onToggle={() => toggleSection('categories')}
          >
            <div className="space-y-2">
              <button
                onClick={() => updateFilter('category_id', undefined)}
                className={`block w-full text-left p-2 rounded transition-colors ${
                  !currentFilters.category_id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-foreground/5 text-foreground/70'
                }`}
              >
                {t('all_categories_button')}
              </button>
              
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => updateFilter('category_id', category.id.toString())}
                  className={`block w-full text-left p-2 rounded transition-colors ${
                    currentFilters.category_id === category.id.toString()
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-foreground/5 text-foreground/70'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Pricing */}
          <FilterSection
            title={t('pricing_model_title')}
            isExpanded={expandedSections.pricing}
            onToggle={() => toggleSection('pricing')}
          >
            <div className="space-y-2">
              {PRICING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilter('pricing_model', 
                    currentFilters.pricing_model === option.value ? undefined : option.value
                  )}
                  className={`block w-full text-left p-2 rounded transition-colors ${
                    currentFilters.pricing_model === option.value
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-foreground/5 text-foreground/70'
                  }`}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Platforms */}
          <FilterSection
            title={t('platforms_title')}
            isExpanded={expandedSections.platforms}
            onToggle={() => toggleSection('platforms')}
          >
            <div className="space-y-2">
              {COMMON_PLATFORMS.map((platform) => (
                <button
                  key={platform}
                  onClick={() => togglePlatform(platform)}
                  className={`flex items-center justify-between w-full p-2 rounded transition-colors ${
                    currentFilters.platforms?.includes(platform)
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-foreground/5 text-foreground/70'
                  }`}
                >
                  <span>{platform}</span>
                  {currentFilters.platforms?.includes(platform) && (
                    <X className="w-4 h-4" />
                  )}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Sort */}
          <FilterSection
            title={t('sort_title')}
            isExpanded={expandedSections.sort}
            onToggle={() => toggleSection('sort')}
          >
            <div className="space-y-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateFilter('sort', option.value)}
                  className={`block w-full text-left p-2 rounded transition-colors ${
                    currentFilters.sort === option.value
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-foreground/5 text-foreground/70'
                  }`}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          </FilterSection>
        </div>
      </SidebarAnimation>

      {/* Results */}
      <div className="lg:w-3/4">
        {/* Results header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-foreground/70">
            {isLoading ? 'Loading...' : `${total} tools found`}
          </p>
          
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {currentFilters.category_id && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                  Category: {categories.find(c => c.id.toString() === currentFilters.category_id)?.name}
                  <button onClick={() => updateFilter('category_id', undefined)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {currentFilters.pricing_model && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                  {t(PRICING_OPTIONS.find(p => p.value === currentFilters.pricing_model)?.labelKey || '')}
                  <button onClick={() => updateFilter('pricing_model', undefined)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {currentFilters.platforms?.map(platform => (
                <span key={platform} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                  {platform}
                  <button onClick={() => togglePlatform(platform)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tools grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ToolCardGridSkeleton count={12} />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {tools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {tools.map((tool, index) => (
                    <AnimatedCard
                      key={tool.id}
                      delay={index * 0.05}
                      hoverScale={1.02}
                    >
                      <ToolCard tool={tool} lang={lang} />
                    </AnimatedCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-foreground/70 text-lg">{t('tools_not_found')}</p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-4 px-6 py-2 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}