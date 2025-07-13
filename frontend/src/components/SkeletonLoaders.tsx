// src/components/SkeletonLoaders.tsx

import { motion } from 'framer-motion';

const shimmer = {
  hidden: { opacity: 0.6 },
  visible: { opacity: 1 },
};

const SkeletonBox = ({ className = '', animated = true }: { className?: string; animated?: boolean }) => (
  <motion.div
    className={`bg-foreground/10 rounded ${className}`}
    variants={animated ? shimmer : {}}
    initial={animated ? "hidden" : ""}
    animate={animated ? "visible" : ""}
    transition={animated ? {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut"
    } : {}}
  />
);

export const ToolCardSkeleton = () => (
  <div className="bg-cardBackground p-4 rounded-lg border border-foreground/10">
    <div className="flex flex-col h-full">
      {/* Icon placeholder */}
      <SkeletonBox className="w-12 h-12 mb-3" />
      
      {/* Title placeholder */}
      <SkeletonBox className="h-5 mb-2" />
      
      {/* Description placeholder */}
      <div className="flex-grow space-y-2 mb-4">
        <SkeletonBox className="h-3 w-full" />
        <SkeletonBox className="h-3 w-4/5" />
        <SkeletonBox className="h-3 w-3/4" />
      </div>
      
      {/* Platforms placeholder */}
      <div className="flex gap-2 mb-3">
        <SkeletonBox className="h-6 w-16" />
        <SkeletonBox className="h-6 w-12" />
      </div>
      
      {/* Category placeholder */}
      <SkeletonBox className="h-6 w-20" />
    </div>
  </div>
);

export const ToolCardGridSkeleton = ({ count = 12 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {Array.from({ length: count }, (_, i) => (
      <ToolCardSkeleton key={i} />
    ))}
  </div>
);

export const FeaturedToolSkeleton = () => (
  <div className="bg-cardBackground rounded-xl p-8 border border-foreground/10">
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left side - Icon and info */}
      <div className="md:w-1/3">
        <SkeletonBox className="w-24 h-24 mb-4" />
        <SkeletonBox className="h-8 mb-4" />
        <div className="space-y-2 mb-6">
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-4/5" />
        </div>
        <div className="flex gap-2 mb-4">
          <SkeletonBox className="h-6 w-16" />
          <SkeletonBox className="h-6 w-20" />
        </div>
        <SkeletonBox className="h-10 w-32" />
      </div>
      
      {/* Right side - Description */}
      <div className="md:w-2/3 space-y-3">
        <SkeletonBox className="h-6 mb-4" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-full" />
        <SkeletonBox className="h-4 w-4/5" />
        <SkeletonBox className="h-4 w-3/4" />
        <SkeletonBox className="h-4 w-5/6" />
      </div>
    </div>
  </div>
);

export const CategoryFilterSkeleton = () => (
  <div className="space-y-4">
    <SkeletonBox className="h-6 w-24 mb-4" />
    <div className="space-y-2">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex items-center justify-between p-2">
          <SkeletonBox className="h-4 w-20" />
          <SkeletonBox className="h-4 w-6" />
        </div>
      ))}
    </div>
  </div>
);

export const SearchBarSkeleton = () => (
  <div className="w-full max-w-2xl mx-auto">
    <SkeletonBox className="h-12 w-full" />
  </div>
);

export const BreadcrumbsSkeleton = () => (
  <div className="flex items-center space-x-2 mb-6">
    <SkeletonBox className="h-4 w-4" />
    <SkeletonBox className="h-3 w-2" />
    <SkeletonBox className="h-4 w-16" />
    <SkeletonBox className="h-3 w-2" />
    <SkeletonBox className="h-4 w-20" />
  </div>
);

export const ToolDetailSkeleton = () => (
  <div className="max-w-4xl mx-auto py-12 px-4">
    <BreadcrumbsSkeleton />
    
    <div className="grid md:grid-cols-3 gap-8 md:gap-12">
      {/* Left sidebar */}
      <aside className="md:col-span-1 flex flex-col items-center md:items-start">
        <SkeletonBox className="w-32 h-32 rounded-xl mb-6" />
        <SkeletonBox className="h-12 w-40" />
      </aside>

      {/* Main content */}
      <article className="md:col-span-2">
        <SkeletonBox className="h-4 w-20 mb-2" />
        <SkeletonBox className="h-12 mb-4" />
        
        {/* Rating */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <SkeletonBox key={i} className="w-4 h-4" />
            ))}
          </div>
          <SkeletonBox className="h-4 w-24" />
        </div>
        
        {/* Tags */}
        <div className="flex gap-2 mb-6">
          <SkeletonBox className="h-6 w-16" />
          <SkeletonBox className="h-6 w-20" />
          <SkeletonBox className="h-6 w-12" />
        </div>
        
        {/* Description */}
        <div className="space-y-3">
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-4/5" />
          <SkeletonBox className="h-4 w-3/4" />
        </div>
      </article>
    </div>
  </div>
);

export const ReviewsSkeleton = () => (
  <div className="mt-12 space-y-6">
    <SkeletonBox className="h-8 w-32 mb-6" />
    
    {Array.from({ length: 3 }, (_, i) => (
      <div key={i} className="bg-cardBackground p-6 rounded-lg border border-foreground/10">
        <div className="flex items-start gap-4">
          <SkeletonBox className="w-10 h-10 rounded-full" />
          <div className="flex-grow">
            <div className="flex items-center gap-2 mb-2">
              <SkeletonBox className="h-4 w-20" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, j) => (
                  <SkeletonBox key={j} className="w-3 h-3" />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-4/5" />
              <SkeletonBox className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const InteractiveHelperSkeleton = () => (
  <div className="space-y-6">
    <SkeletonBox className="h-8 w-48 mx-auto mb-8" />
    
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="bg-cardBackground p-6 rounded-lg border border-foreground/10 text-center">
          <SkeletonBox className="w-12 h-12 mx-auto mb-4" />
          <SkeletonBox className="h-5 mb-2" />
          <SkeletonBox className="h-3 w-3/4 mx-auto" />
        </div>
      ))}
    </div>
  </div>
);

export const PaginationSkeleton = () => (
  <div className="flex justify-center items-center gap-2 mt-8">
    <SkeletonBox className="h-10 w-20" />
    <SkeletonBox className="h-10 w-10" />
    <SkeletonBox className="h-10 w-10" />
    <SkeletonBox className="h-10 w-10" />
    <SkeletonBox className="h-10 w-20" />
  </div>
);