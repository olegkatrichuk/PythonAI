// src/components/KeyboardShortcuts.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, Keyboard, X, ArrowUp } from 'lucide-react';
import { getTranslations } from '@/lib/translations';

interface KeyboardShortcutsProps {
  searchInputRef?: React.RefObject<HTMLInputElement>;
}

export default function KeyboardShortcuts({ searchInputRef }: KeyboardShortcutsProps) {
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as string;
  const t = getTranslations(lang);

  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // Detect if user is on Mac
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? 'Cmd' : 'Ctrl';

  const shortcuts = [
    {
      key: `${modKey} + K`,
      description: 'Open search command palette',
      action: () => setShowCommandPalette(true)
    },
    {
      key: `${modKey} + /`,
      description: 'Focus search input',
      action: () => {
        if (searchInputRef?.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        } else {
          setShowCommandPalette(true);
        }
      }
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => setShowHelp(true)
    },
    {
      key: 'Escape',
      description: 'Close dialogs / Clear search',
      action: () => {
        setShowCommandPalette(false);
        setShowHelp(false);
        if (searchInputRef?.current) {
          searchInputRef.current.blur();
        }
      }
    },
    {
      key: 'G then H',
      description: 'Go to homepage',
      action: () => router.push(`/${lang}`)
    },
    {
      key: 'G then T',
      description: 'Go to tools page',
      action: () => router.push(`/${lang}/tool`)
    },
    {
      key: 'G then A',
      description: 'Go to about page',
      action: () => router.push(`/${lang}/about`)
    }
  ];

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey, target } = event;
      const isModPressed = ctrlKey || metaKey;
      const isInputFocused = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

      // Don't trigger shortcuts when typing in inputs (except for our specific shortcuts)
      if (isInputFocused && !isModPressed && key !== 'Escape' && key !== '?') {
        return;
      }

      // Command palette
      if (isModPressed && key === 'k') {
        event.preventDefault();
        setShowCommandPalette(true);
        return;
      }

      // Focus search
      if (isModPressed && key === '/') {
        event.preventDefault();
        if (searchInputRef?.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        } else {
          setShowCommandPalette(true);
        }
        return;
      }

      // Show help
      if (key === '?' && !isInputFocused) {
        event.preventDefault();
        setShowHelp(true);
        return;
      }

      // Escape
      if (key === 'Escape') {
        if (showCommandPalette || showHelp) {
          event.preventDefault();
          setShowCommandPalette(false);
          setShowHelp(false);
        }
        return;
      }

      // Navigation shortcuts (G + key)
      if (key === 'g' && !isInputFocused && !showCommandPalette && !showHelp) {
        const handleSecondKey = (secondEvent: KeyboardEvent) => {
          switch (secondEvent.key) {
            case 'h':
              router.push(`/${lang}`);
              break;
            case 't':
              router.push(`/${lang}/tool`);
              break;
            case 'a':
              router.push(`/${lang}/about`);
              break;
          }
          document.removeEventListener('keydown', handleSecondKey);
        };
        
        document.addEventListener('keydown', handleSecondKey);
        
        // Remove listener after 2 seconds if no second key is pressed
        setTimeout(() => {
          document.removeEventListener('keydown', handleSecondKey);
        }, 2000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, showHelp, searchInputRef, router, lang]);

  // Focus command palette input when opened
  useEffect(() => {
    if (showCommandPalette && commandInputRef.current) {
      commandInputRef.current.focus();
    }
  }, [showCommandPalette]);

  // Handle command palette search
  const handleCommandSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${lang}/tool?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowCommandPalette(false);
      setSearchQuery('');
    }
  };

  // Close command palette when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandPaletteRef.current && !commandPaletteRef.current.contains(event.target as Node)) {
        setShowCommandPalette(false);
      }
    };

    if (showCommandPalette) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showCommandPalette]);

  return (
    <>
      {/* Command Palette */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh]"
            onClick={() => setShowCommandPalette(false)}
          >
            <motion.div
              ref={commandPaletteRef}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-cardBackground border border-foreground/20 rounded-lg shadow-2xl w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleCommandSearch} className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground/50" />
                  <input
                    ref={commandInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search AI tools..."
                    className="w-full bg-background border border-foreground/20 text-foreground text-lg rounded-lg pl-10 pr-4 py-3 focus:ring-primary focus:border-primary placeholder:text-foreground/50"
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <kbd className="px-2 py-1 text-xs font-semibold text-foreground/70 bg-foreground/10 border border-foreground/20 rounded">
                      Enter
                    </kbd>
                  </div>
                </div>
              </form>
              
              <div className="border-t border-foreground/10 p-4">
                <div className="text-xs text-foreground/50 mb-2">Quick actions</div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      router.push(`/${lang}/tool`);
                      setShowCommandPalette(false);
                    }}
                    className="flex items-center gap-3 w-full p-2 rounded hover:bg-foreground/5 text-left"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                      <Search className="w-4 h-4 text-primary" />
                    </div>
                    <span>Browse all tools</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      router.push(`/${lang}/tool/add`);
                      setShowCommandPalette(false);
                    }}
                    className="flex items-center gap-3 w-full p-2 rounded hover:bg-foreground/5 text-left"
                  >
                    <div className="w-8 h-8 bg-green-500/10 rounded flex items-center justify-center">
                      <span className="text-green-500 text-lg">+</span>
                    </div>
                    <span>Add new tool</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-cardBackground border border-foreground/20 rounded-lg shadow-2xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-foreground/10">
                <div className="flex items-center gap-2">
                  <Keyboard className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold text-foreground">Keyboard Shortcuts</h2>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-foreground/50 hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {shortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-foreground/70 text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-foreground/70 bg-foreground/10 border border-foreground/20 rounded">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Button (visible in bottom right) */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-cardBackground border border-foreground/20 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-40 hover:bg-cardBackground/80"
        title="Keyboard shortcuts (?)"
      >
        <Keyboard className="w-5 h-5 text-foreground/70" />
      </motion.button>
    </>
  );
}