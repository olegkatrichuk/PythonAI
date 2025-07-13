// src/components/SimpleSearchBar.tsx
'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Search, X, Clock } from 'lucide-react';
import { getTranslations } from '@/lib/translations';
import { useAnalytics } from '@/lib/analytics';
import { trackEvents } from '@/lib/gtag';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchHistory {
  query: string;
  timestamp: number;
}

export default function SimpleSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const lang = params.lang as string;
  const { trackSearch } = useAnalytics();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  
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
  const saveToHistory = (searchQuery: string) => {
    const newHistory = [
      { query: searchQuery, timestamp: Date.now() },
      ...searchHistory.filter(item => item.query !== searchQuery)
    ].slice(0, 10); // Keep only last 10 searches
    
    setSearchHistory(newHistory);
    localStorage.setItem('search-history', JSON.stringify(newHistory));
  };

  // Close history when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        historyRef.current && !historyRef.current.contains(event.target as Node)
      ) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowHistory(false);
        inputRef.current?.blur();
      }
    };

    if (showHistory) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showHistory]);

  const handleSearch = async (searchQuery?: string) => {
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

    setShowHistory(false);

    router.push(`/${lang}/tool?${newParams.toString()}`);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search-history');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleFocus = () => {
    if (searchHistory.length > 0) {
      setShowHistory(true);
    }
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
            onFocus={handleFocus}
            placeholder={t('search_placeholder')}
            className="w-full bg-background border border-foreground/20 text-foreground text-sm rounded-lg focus:ring-primary focus:border-primary pl-10 pr-12 py-3 placeholder:text-foreground/50 transition-all duration-200"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/50 hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {/* Search History */}
      <AnimatePresence>
        {showHistory && searchHistory.length > 0 && (
          <motion.div
            ref={historyRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-cardBackground border border-foreground/20 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            <div className="p-2">
              <div className="flex items-center justify-between px-2 py-1 text-xs text-foreground/70 font-medium">
                Recent searches
                <button
                  onClick={clearHistory}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Clear
                </button>
              </div>
              
              {searchHistory.map((item, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSearch(item.query)}
                  className="w-full flex items-center gap-3 px-2 py-2 text-left hover:bg-foreground/5 rounded transition-colors"
                >
                  <Clock className="w-4 h-4 text-foreground/50" />
                  <span className="text-sm text-foreground">{item.query}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}