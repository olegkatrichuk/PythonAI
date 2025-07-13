// src/components/SmoothLoader.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface SmoothLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  minLoadTime?: number;
  loadingComponent?: React.ReactNode;
}

export const SmoothLoader = ({ 
  isLoading, 
  children, 
  minLoadTime = 800,
  loadingComponent 
}: SmoothLoaderProps) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [isReady, setIsReady] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadTime - elapsed);
      
      setTimeout(() => {
        setShowLoading(false);
        setTimeout(() => setIsReady(true), 100);
      }, remaining);
    } else {
      setShowLoading(true);
      setIsReady(false);
    }
  }, [isLoading, startTime, minLoadTime]);

  const defaultLoader = (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-foreground/70 text-sm"
        >
          Загрузка...
        </motion.p>
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {showLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {loadingComponent || defaultLoader}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: isReady ? 1 : 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Компонент для предотвращения мигания при гидрации
export const HydrationSafeWrapper = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="animate-pulse">
          {/* Skeleton для navbar */}
          <div className="h-16 bg-foreground/10" />
          
          {/* Skeleton для контента */}
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <div className="h-8 bg-foreground/10 rounded w-64 mx-auto" />
              <div className="h-4 bg-foreground/10 rounded w-96 mx-auto" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-48 bg-foreground/10 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Smooth transition hook
export const useSmoothTransition = (dependency: any, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(dependency);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    const handler = setTimeout(() => {
      setDebouncedValue(dependency);
      setIsTransitioning(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [dependency, delay]);

  return { debouncedValue, isTransitioning };
};

// Анимированный индикатор загрузки
export const LoadingSpinner = ({ 
  size = 'md',
  color = 'primary' 
}: { 
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'current';
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colors = {
    primary: 'border-primary border-t-transparent',
    white: 'border-white border-t-transparent',
    current: 'border-current border-t-transparent'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${sizes[size]} border-2 ${colors[color]} rounded-full`}
    />
  );
};

// Плавный переход между состояниями
export const StateTransition = ({ 
  state,
  states,
  className = '' 
}: { 
  state: string;
  states: Record<string, React.ReactNode>;
  className?: string;
}) => {
  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {states[state]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};