// src/components/ReviewsSection.tsx
'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'next/navigation';
import type { IReview } from '@/types';

import StarRating from './StarRating'; // Импортируем наш компонент со звездами

// --- Новый компонент для формы отзыва ---
function ReviewForm({ onSubmit }: { onSubmit: (rating: number, text: string) => Promise<void> }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Пожалуйста, поставьте оценку.");
      return;
    }
    setLoading(true);
    await onSubmit(rating, text);
    setLoading(false);
    setText('');
    setRating(0);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
      <p className="font-semibold mb-3 text-white">Оставьте ваш отзыв</p>
      <div className="mb-4">
        <StarRating isInteractive={true} onRatingChange={setRating} initialRating={rating} />
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Расскажите о вашем опыте (необязательно)..."
        className="w-full bg-slate-700 border-slate-600 rounded-md shadow-sm p-3 mt-4 focus:border-blue-500 focus:ring-blue-500 text-white"
        rows={4}
        disabled={loading}
      />
      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-500">
          {loading ? 'Отправка...' : 'Отправить'}
        </button>
      </div>
    </form>
  );
}

// --- Основной компонент для отображения отзывов ---
export default function ReviewsSection({ toolSlug }: { toolSlug: string }) {
  const { user } = useAuth();
  const params = useParams();
  const lang = params.lang as string;

  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  // Функция для загрузки отзывов
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/tools/${toolSlug}/reviews/`;
      const response = await axios.get(apiUrl);
      setReviews(response.data);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      toast.error("Не удалось загрузить отзывы.");
    }
    finally { setLoading(false); }
  }, [toolSlug]);

  useEffect(() => { void fetchReviews(); }, [fetchReviews]);

  // Функция для отправки нового отзыва
  const handleReviewSubmit = async (rating: number, text: string) => {
    const token = localStorage.getItem('accessToken');
    if (!user || !token) { toast.error("Нужно войти в систему, чтобы оставить отзыв."); return; }

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/tools/${toolSlug}/reviews/`;
      const response = await axios.post(apiUrl, { rating, text }, { headers: { Authorization: `Bearer ${token}` } });
      setReviews(prev => [response.data, ...prev]);
      toast.success("Спасибо за ваш отзыв!");
      // Перезагружаем отзывы, чтобы обновить средний рейтинг на странице
      window.location.reload();
    } catch (error) { toast.error("Не удалось отправить отзыв."); }
  };

  return (
    <div className="mt-16 border-t border-slate-700 pt-10">
      <h2 className="text-2xl font-bold text-white mb-6">Отзывы ({reviews.length})</h2>
      {user && <ReviewForm onSubmit={handleReviewSubmit} />}
      <div className="mt-8 space-y-8">
        {loading ? <p className="text-slate-400">Загрузка отзывов...</p> : reviews.length > 0 ? (
          reviews.map(review => (
            <article key={review.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-slate-400">
                {review.author.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{review.author.email}</p>
                <div className="my-1">
                  <StarRating initialRating={review.rating} isInteractive={false} size="sm" />
                </div>
                {review.text && <p className="text-slate-300 mt-2 whitespace-pre-wrap">{review.text}</p>}
              </div>
            </article>
          ))
        ) : <p className="text-slate-400">Отзывов пока нет. Будьте первым!</p>}
      </div>
    </div>
  );
}