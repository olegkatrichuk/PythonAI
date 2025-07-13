// src/components/MobileTouchEnhanced.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  className?: string;
  swipeThreshold?: number;
}

export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  className = '',
  swipeThreshold = 100
}: SwipeableCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePanStart = () => {
    setIsDragging(true);
  };

  const handlePanEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    const { offset, velocity } = info;
    
    // Check for swipe gestures
    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > 500) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  };

  const handleTap = () => {
    if (!isDragging && onTap) {
      onTap();
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={`touch-manipulation select-none ${className}`}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onPanStart={handlePanStart}
      onPanEnd={handlePanEnd}
      onTap={handleTap}
      whileTap={{ scale: 0.98 }}
      style={{ 
        touchAction: 'pan-x',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      {children}
    </motion.div>
  );
};

interface TouchOptimizedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const TouchOptimizedButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false
}: TouchOptimizedButtonProps) => {
  const baseClasses = "touch-manipulation relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const sizeClasses = {
    sm: 'min-h-[44px] px-4 text-sm',
    md: 'min-h-[48px] px-6 text-base',
    lg: 'min-h-[52px] px-8 text-lg'
  };
  
  const variantClasses = {
    primary: 'bg-primary text-primaryForeground hover:bg-primary/90 focus:ring-primary/30 active:bg-primary/80',
    secondary: 'bg-secondary text-secondaryForeground hover:bg-secondary/90 focus:ring-secondary/30 active:bg-secondary/80',
    ghost: 'bg-transparent text-foreground hover:bg-foreground/10 focus:ring-foreground/30 active:bg-foreground/20'
  };

  return (
    <motion.button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
    >
      {children}
    </motion.button>
  );
};

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export const PullToRefresh = ({
  onRefresh,
  children,
  threshold = 80,
  disabled = false
}: PullToRefreshProps) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
  }, [disabled]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || window.scrollY > 0) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0) {
      e.preventDefault();
      const distance = Math.min(diff * 0.5, threshold * 1.5);
      setPullDistance(distance);
      setCanRefresh(distance >= threshold);
    }
  }, [disabled, isRefreshing, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (canRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setCanRefresh(false);
      }
    } else {
      setPullDistance(0);
      setCanRefresh(false);
    }
  }, [canRefresh, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={containerRef} className="relative">
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-primary/10 overflow-hidden"
        style={{ height: pullDistance }}
        animate={{ opacity: pullDistance > 0 ? 1 : 0 }}
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : canRefresh ? 180 : 0 }}
          transition={{ duration: isRefreshing ? 1 : 0.3, repeat: isRefreshing ? Infinity : 0 }}
          className="text-primary"
        >
          ↓
        </motion.div>
        <span className="ml-2 text-primary text-sm">
          {isRefreshing ? 'Refreshing...' : canRefresh ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      </motion.div>
      
      {/* Content */}
      <motion.div
        style={{ y: pullDistance }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Hook for detecting mobile device
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
};

// Enhanced tap target utility
export const enhanceTapTarget = (element: HTMLElement) => {
  const minSize = 44; // iOS/Android recommended minimum
  const rect = element.getBoundingClientRect();
  
  if (rect.width < minSize || rect.height < minSize) {
    element.style.minWidth = `${minSize}px`;
    element.style.minHeight = `${minSize}px`;
    element.style.display = element.style.display || 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
  }
};