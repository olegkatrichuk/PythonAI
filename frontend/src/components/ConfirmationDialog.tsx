// src/components/ConfirmationDialog.tsx

'use client';

import { useEffect } from 'react';

// ИЗМЕНЕНИЕ 1: Используем стандартные имена onConfirm и onClose
interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void; // Функция, которая вызовется при подтверждении
  onClose: () => void;   // Функция, которая вызовется при отмене/закрытии
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  onConfirm, // <-- Используем новое имя
  onClose,   // <-- Используем новое имя
}: ConfirmationDialogProps) {

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose(); // <-- Используем новое имя
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]); // <-- Используем новое имя в зависимостях

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Фон, при клике на который окно закрывается */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative z-10 w-full max-w-md p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-600">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <p className="text-slate-300 mb-8">{message}</p>

        <div className="flex justify-end gap-4">
          {/* Кнопка отмены */}
          <button
            onClick={onClose} // <-- Используем новое имя
            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors"
          >
            Отмена
          </button>
          {/* Кнопка подтверждения */}
          <button
            onClick={onConfirm} // <-- Используем новое имя
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
          >
            Да, удалить
          </button>
        </div>
      </div>
    </div>
  );
}