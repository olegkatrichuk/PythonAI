// src/components/BackToTop.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ChevronUp } from 'lucide-react';

interface BackToTopProps {
  threshold?: number;
  smoothBehavior?: boolean;
  showProgress?: boolean;
  className?: string;
}

export default function BackToTop({ 
  threshold = 400, 
  smoothBehavior = true,
  showProgress = false,
  className = ''
}: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Calculate scroll progress
      const progress = (scrollTop / documentHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      
      // Show/hide button based on threshold
      setIsVisible(scrollTop > threshold);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    if (smoothBehavior) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          onClick={scrollToTop}
          className={`
            fixed bottom-20 right-4 z-40 
            w-12 h-12 
            bg-cardBackground/90 backdrop-blur-sm
            border border-foreground/20 
            rounded-full 
            shadow-lg hover:shadow-xl 
            transition-all duration-200 
            flex items-center justify-center 
            hover:bg-primary hover:text-primaryForeground
            hover:border-primary
            group
            ${className}
          `}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Back to top"
        >
          {showProgress ? (
            <div className="relative">
              {/* Progress ring */}
              <svg className="w-8 h-8 transform -rotate-90">
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity="0.2"
                />
                <motion.circle
                  cx="16"
                  cy="16"
                  r="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={88} // 2 * π * 14
                  strokeDashoffset={88 - (88 * scrollProgress) / 100}
                  transition={{ duration: 0.1 }}
                />
              </svg>
              
              {/* Arrow icon */}
              <ChevronUp className="absolute inset-0 w-4 h-4 m-auto text-foreground group-hover:text-primaryForeground" />
            </div>
          ) : (
            <ArrowUp className="w-5 h-5 text-foreground/70 group-hover:text-primaryForeground transition-colors" />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// Smooth scrolling utility
export const smoothScrollTo = (target: number | HTMLElement, duration: number = 800) => {
  const targetPosition = typeof target === 'number' ? target : target.offsetTop;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime: number;

  const easeInOutQuart = (t: number): number => {
    return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
  };

  const animation = (currentTime: number) => {
    if (startTime === undefined) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuart(timeElapsed / duration) * distance;
    
    window.scrollTo(0, startPosition + run);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  };

  requestAnimationFrame(animation);
};

// Hook for scroll position
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const updateScrollPosition = () => {
      const scrollY = window.pageYOffset;
      setScrollDirection(scrollY > lastScrollY ? 'down' : 'up');
      setScrollPosition(scrollY);
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener('scroll', updateScrollPosition, { passive: true });
    return () => window.removeEventListener('scroll', updateScrollPosition);
  }, []);

  return { scrollPosition, scrollDirection };
};