// src/components/SmoothAnimations.tsx
'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useState, useEffect } from 'react';

// Плавные переходы для навигации
export const NavbarAnimation = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : -100, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.2
      }}
    >
      {children}
    </motion.nav>
  );
};

// Анимация для заголовков страниц
export const PageHeader = ({ 
  title, 
  subtitle, 
  className = '' 
}: { 
  title: string; 
  subtitle?: string; 
  className?: string; 
}) => {
  return (
    <div className={`text-center ${className}`}>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.2
        }}
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-foreground font-jakarta"
      >
        {title}
      </motion.h1>
      
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.4
          }}
          className="text-lg text-foreground/70 max-w-2xl mx-auto mb-8"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

// Анимированная сетка для инструментов
export const ToolsGrid = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Анимация для элементов сетки
export const GridItem = ({ 
  children, 
  index = 0,
  className = '' 
}: { 
  children: React.ReactNode; 
  index?: number;
  className?: string; 
}) => {
  const itemVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Плавный переход для форм
export const FormAnimation = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.1
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Анимация для боковой панели
export const SidebarAnimation = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) => {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.3
      }}
      className={className}
    >
      {children}
    </motion.aside>
  );
};

// Анимация для главного контента
export const MainContentAnimation = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) => {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.4
      }}
      className={className}
    >
      {children}
    </motion.main>
  );
};

// Анимация для кнопок с эффектом пульсации
export const AnimatedButton = ({ 
  children, 
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
  isLoading = false
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
  isLoading?: boolean;
}) => {
  const baseClasses = "inline-flex items-center justify-center font-bold rounded-lg transition-all duration-200";
  
  const variantClasses = {
    primary: 'bg-primary text-primaryForeground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondaryForeground hover:bg-secondary/90',
    ghost: 'bg-transparent text-foreground hover:bg-foreground/10'
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        scale: disabled ? 1 : 1.05,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
            Loading...
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Анимация для поиска
export const SearchAnimation = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.6
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Анимация для уведомлений
export const NotificationAnimation = ({ 
  children, 
  show = true 
}: { 
  children: React.ReactNode; 
  show?: boolean; 
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Анимация для футера
export const FooterAnimation = ({ 
  children 
}: { 
  children: React.ReactNode; 
}) => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      {children}
    </motion.footer>
  );
};

// Предотвращение мигания при первой загрузке
export const InitialLoadWrapper = ({ 
  children 
}: { 
  children: React.ReactNode; 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Небольшая задержка для избежания мигания
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"
        />
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