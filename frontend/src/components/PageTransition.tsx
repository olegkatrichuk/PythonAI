// src/components/PageTransition.tsx
'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Варианты анимаций для разных типов переходов
const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.76, 0, 0.24, 1] // easeInOutQuart
    }
  }
};

const containerVariants: Variants = {
  initial: {
    opacity: 0
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.2,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

export const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  const pathname = usePathname();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // После первой загрузки страницы
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial={isInitialLoad ? "initial" : "initial"}
        animate="enter"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export const SectionTransition = ({ 
  children, 
  delay = 0,
  className = '',
  duration = 0.6 
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
  duration?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const FadeInUpSection = ({ 
  children, 
  delay = 0,
  className = '',
  threshold = 0.1 
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
  threshold?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: threshold }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer = ({ 
  children, 
  className = '',
  staggerDelay = 0.1 
}: { 
  children: React.ReactNode; 
  className?: string;
  staggerDelay?: number;
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ 
  children, 
  className = '',
  index = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  index?: number;
}) => {
  const itemVariants: Variants = {
    initial: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    enter: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Плавная анимация для загрузки контента
export const ContentLoader = ({ 
  isLoading, 
  children, 
  fallback,
  minLoadTime = 400 
}: { 
  isLoading: boolean; 
  children: React.ReactNode; 
  fallback: React.ReactNode;
  minLoadTime?: number;
}) => {
  const [showContent, setShowContent] = useState(!isLoading);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadTime - elapsed);
      
      setTimeout(() => {
        setShowContent(true);
      }, remaining);
    } else {
      setShowContent(false);
    }
  }, [isLoading, startTime, minLoadTime]);

  return (
    <AnimatePresence mode="wait">
      {!showContent ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {fallback}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Анимация для карточек с hover эффектом
export const AnimatedCard = ({ 
  children, 
  className = '',
  hoverScale = 1.02,
  tapScale = 0.98,
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  hoverScale?: number;
  tapScale?: number;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        scale: hoverScale,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: tapScale }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hook для предотвращения мигания при загрузке
export const usePreventFlicker = (minDelay = 300) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, minDelay);

    return () => clearTimeout(timer);
  }, [minDelay]);

  return isReady;
};