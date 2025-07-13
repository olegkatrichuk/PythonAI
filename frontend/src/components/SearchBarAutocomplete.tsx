// src/components/SearchBarAutocomplete.tsx
'use client';

import { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { getTranslations } from '@/lib/translations';
import { useAnalytics } from '@/lib/analytics';
import { trackEvents } from '@/lib/gtag';
import { publicApi } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'tool' | 'category' | 'recent' | 'popular';
  slug?: string;
  category_id?: number;
}

interface SearchHistory {
  query: string;
  timestamp: number;
}

export default function SearchBarAutocomplete() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = params.lang as string;
  const { trackSearch } = useAnalytics();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  const t = getTranslations(lang || 'en');

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('search-history');
    if (saved) {
      try {
        const history = JSON.parse(saved).filter((item: SearchHistory) => 
          Date.now() - item.timestamp < 7 * 24 * 60 * 60 * 1000 // Last 7 days
        );
        setSearchHistory(history);
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, []);

  // Save search to history
  const saveToHistory = useCallback((searchQuery: string) => {
    const newHistory = [
      { query: searchQuery, timestamp: Date.now() },
      ...searchHistory.filter(item => item.query !== searchQuery)
    ].slice(0, 10); // Keep only last 10 searches
    
    setSearchHistory(newHistory);
    localStorage.setItem('search-history', JSON.stringify(newHistory));
  }, [searchHistory]);

  // Debounced search suggestions
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Fallback to regular endpoints if autocomplete endpoints don't exist yet
        const [toolsResponse, categoriesResponse] = await Promise.all([
          publicApi.get(`/api/tools/search-suggestions?q=${encodeURIComponent(query)}&limit=5`, {
            headers: { 'Accept-Language': lang }
          }).catch(() => 
            // Fallback to regular tools endpoint
            publicApi.get(`/api/tools/?q=${encodeURIComponent(query)}&limit=5`, {
              headers: { 'Accept-Language': lang }
            })
          ),
          publicApi.get(`/api/categories/search?q=${encodeURIComponent(query)}&limit=3`, {
            headers: { 'Accept-Language': lang }
          }).catch(() => 
            // Fallback: filter existing categories on frontend
            Promise.resolve({ data: [] })
          )
        ]);

        // Handle both autocomplete response and fallback response formats
        const toolsData = toolsResponse.data.items || toolsResponse.data || [];
        const categoriesData = categoriesResponse.data || [];
        
        const toolSuggestions: SearchSuggestion[] = toolsData.slice(0, 5).map((tool: any) => ({
          id: `tool-${tool.id}`,
          text: tool.name,
          type: 'tool' as const,
          slug: tool.slug
        }));

        const categorySuggestions: SearchSuggestion[] = categoriesData.slice(0, 3).map((category: any) => ({
          id: `category-${category.id}`,
          text: category.name,
          type: 'category' as const,
          category_id: category.id
        }));

        // Add recent searches that match current query
        const recentSuggestions: SearchSuggestion[] = searchHistory
          .filter(item => item.query.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map((item, index) => ({
            id: `recent-${index}`,
            text: item.query,
            type: 'recent' as const
          }));

        setSuggestions([
          ...recentSuggestions,
          ...toolSuggestions,
          ...categorySuggestions
        ]);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, lang, searchHistory]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('q', finalQuery);
    newParams.set('page', '1');

    // Save to history
    saveToHistory(finalQuery);

    // Track search
    trackSearch(finalQuery, 0);
    trackEvents.search(finalQuery, 0);

    setShowSuggestions(false);
    setSelectedIndex(-1);

    router.push(`/${lang}/tool?${newParams.toString()}`);
  }, [query, searchParams, saveToHistory, trackSearch, lang, router]);

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'tool':
        if (suggestion.slug) {
          router.push(`/${lang}/tool/${suggestion.slug}`);
        }
        break;
      case 'category':
        if (suggestion.category_id) {
          const newParams = new URLSearchParams();
          newParams.set('category_id', suggestion.category_id.toString());
          router.push(`/${lang}/tool?${newParams.toString()}`);
        }
        break;
      case 'recent':
      case 'popular':
        setQuery(suggestion.text);
        handleSearch(suggestion.text);
        break;
    }
  }, [lang, router, handleSearch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else {
            handleSearch();
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    };

    if (showSuggestions) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showSuggestions, suggestions, selectedIndex, handleSearch, handleSuggestionClick]);

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search-history');
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <Clock className="w-4 h-4 text-foreground/50" />;
      case 'popular':
        return <TrendingUp className="w-4 h-4 text-foreground/50" />;
      default:
        return <Search className="w-4 h-4 text-foreground/50" />;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/50" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={t('search_placeholder')}
            className="w-full bg-background border border-foreground/20 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary pl-10 pr-12 py-3 placeholder:text-foreground/50"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showSuggestions && (query.length >= 2 || searchHistory.length > 0) && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-cardBackground border border-foreground/20 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {isLoading && (
              <div className="p-3 text-center text-foreground/50">
                {t('loading_tools')}
              </div>
            )}

            {!isLoading && suggestions.length === 0 && query.length >= 2 && (
              <div className="p-3 text-center text-foreground/50">
                No suggestions found
              </div>
            )}

            {!isLoading && query.length < 2 && searchHistory.length > 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-2 py-1 text-xs text-foreground/70 font-medium">
                  Recent searches
                  <button
                    onClick={clearHistory}
                    className="text-primary hover:text-primary/80"
                  >
                    Clear
                  </button>
                </div>
                {searchHistory.slice(0, 5).map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(item.query)}
                    className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-foreground/5 rounded"
                  >
                    <Clock className="w-4 h-4 text-foreground/50" />
                    <span className="text-sm">{item.query}</span>
                  </button>
                ))}
              </div>
            )}

            {!isLoading && suggestions.length > 0 && (
              <div className="p-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full flex items-center gap-3 px-2 py-2 text-left rounded transition-colors ${
                      index === selectedIndex ? 'bg-primary/10 text-primary' : 'hover:bg-foreground/5'
                    }`}
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <span className="text-sm">{suggestion.text}</span>
                    {suggestion.type === 'category' && (
                      <span className="ml-auto text-xs text-foreground/50">Category</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}