// src/components/LoadingStates.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ToolCardGridSkeleton, 
  FeaturedToolSkeleton, 
  InteractiveHelperSkeleton,
  CategoryFilterSkeleton,
  SearchBarSkeleton
} from './SkeletonLoaders';

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton: React.ReactNode;
  delay?: number;
}

export const LoadingState = ({ isLoading, children, skeleton, delay = 0 }: LoadingStateProps) => {
  const [showSkeleton, setShowSkeleton] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => setShowSkeleton(true), delay);
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(false);
    }
  }, [isLoading, delay]);

  return (
    <AnimatePresence mode="wait">
      {showSkeleton ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ToolsPageLoading = ({ 
  showSearch = true, 
  showCategories = true, 
  toolCount = 12 
}: { 
  showSearch?: boolean; 
  showCategories?: boolean; 
  toolCount?: number; 
}) => (
  <div>
    <div className="text-center mb-12">
      <div className="bg-foreground/10 rounded h-12 w-64 mx-auto mb-4 animate-pulse" />
      <div className="bg-foreground/10 rounded h-6 w-96 mx-auto animate-pulse" />
    </div>

    {showSearch && (
      <div className="mb-8">
        <SearchBarSkeleton />
      </div>
    )}

    <div className="flex flex-col md:flex-row gap-8">
      {showCategories && (
        <aside className="md:w-1/4 lg:w-1/5">
          <CategoryFilterSkeleton />
        </aside>
      )}

      <div className="flex-grow">
        <ToolCardGridSkeleton count={toolCount} />
      </div>
    </div>
  </div>
);

export const HomePageLoading = () => (
  <div>
    {/* Hero Section Skeleton */}
    <section className="text-center py-20 sm:py-24">
      <div className="bg-foreground/10 rounded h-16 w-96 mx-auto mb-4 animate-pulse" />
      <div className="bg-foreground/10 rounded h-6 w-128 mx-auto mb-8 animate-pulse" />
      <div className="bg-foreground/10 rounded h-12 w-48 mx-auto animate-pulse" />
    </section>

    {/* Interactive Helper Skeleton */}
    <section className="max-w-5xl mx-auto py-16">
      <InteractiveHelperSkeleton />
    </section>

    {/* Featured Tool Skeleton */}
    <section className="max-w-4xl mx-auto py-16">
      <div className="bg-foreground/10 rounded h-8 w-48 mx-auto mb-12 animate-pulse" />
      <FeaturedToolSkeleton />
    </section>

    {/* New Arrivals Skeleton */}
    <section className="py-16">
      <div className="bg-foreground/10 rounded h-8 w-48 mx-auto mb-12 animate-pulse" />
      <ToolCardGridSkeleton count={10} />
    </section>
  </div>
);

interface ProgressiveLoadingProps {
  stages: {
    name: string;
    component: React.ReactNode;
    delay: number;
  }[];
  isLoading: boolean;
}

export const ProgressiveLoading = ({ stages, isLoading }: ProgressiveLoadingProps) => {
  const [loadedStages, setLoadedStages] = useState<number>(0);

  useEffect(() => {
    if (!isLoading) {
      setLoadedStages(stages.length);
      return;
    }

    setLoadedStages(0);
    
    stages.forEach((stage, index) => {
      setTimeout(() => {
        setLoadedStages(prev => Math.max(prev, index + 1));
      }, stage.delay);
    });
  }, [isLoading, stages]);

  if (!isLoading) {
    return (
      <div>
        {stages.map((stage, index) => (
          <div key={stage.name}>{stage.component}</div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {stages.map((stage, index) => (
        <motion.div
          key={stage.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: index < loadedStages ? 1 : 0.3,
            y: index < loadedStages ? 0 : 20
          }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          {stage.component}
        </motion.div>
      ))}
    </div>
  );
};

export const SmartLoading = ({ 
  children, 
  isLoading, 
  fallback, 
  minLoadingTime = 800 
}: {
  children: React.ReactNode;
  isLoading: boolean;
  fallback: React.ReactNode;
  minLoadingTime?: number;
}) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadingTime - elapsed);
      
      setTimeout(() => {
        setShowLoading(false);
      }, remaining);
    } else {
      setShowLoading(true);
    }
  }, [isLoading, startTime, minLoadingTime]);

  return (
    <AnimatePresence mode="wait">
      {showLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {fallback}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};