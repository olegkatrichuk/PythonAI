// src/components/CommentForm.tsx
'use client';

import { useState, FormEvent } from 'react';

// ИСПРАВЛЕНИЕ: Переименовываем проп, чтобы он соответствовал правилам Next.js
type CommentFormProps = {
  submitCommentAction: (text: string) => Promise<void>;
};

export default function CommentForm({ submitCommentAction }: CommentFormProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    // ИСПРАВЛЕНИЕ: Вызываем переименованную функцию
    await submitCommentAction(text);
    setLoading(false);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Оставьте ваш комментарий..."
        className="w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-3 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-white"
        rows={4}
        disabled={loading}
      />
      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
        >
          {loading ? 'Отправка...' : 'Отправить'}
        </button>
      </div>
    </form>
  );
}