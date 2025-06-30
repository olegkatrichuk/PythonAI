// src/components/StarRating.tsx
'use client';

import { useState } from 'react';

type StarRatingProps = {
  totalStars?: number;
  initialRating?: number;
  isInteractive: boolean;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg'; // Добавляем размер для гибкости
};

export default function StarRating({
  totalStars = 5,
  initialRating = 0,
  isInteractive,
  onRatingChange,
  size = 'md'
}: StarRatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleClick = (ratingValue: number) => {
    if (!isInteractive) return;
    const newRating = ratingValue === rating ? 0 : ratingValue; // Позволяем сбросить оценку
    setRating(newRating);
    if (onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleMouseEnter = (ratingValue: number) => {
    if (!isInteractive) return;
    setHover(ratingValue);
  };

  const handleMouseLeave = () => {
    if (!isInteractive) return;
    setHover(0);
  };

  // Определяем размер звезд в зависимости от пропса 'size'
  const starSizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <svg
            key={ratingValue}
            onClick={() => handleClick(ratingValue)}
            onMouseEnter={() => handleMouseEnter(ratingValue)}
            onMouseLeave={handleMouseLeave}
            className={`${starSizeClass} ${isInteractive ? 'cursor-pointer' : ''}`}
            fill={ratingValue <= (hover || rating) ? '#f59e0b' : '#64748b'} // Золотой для активных, серый для неактивных
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.96a1 1 0 00.95.69h4.168c.969 0 1.371 1.24.588 1.81l-3.372 2.45a1 1 0 00-.364 1.118l1.287 3.96c.3.921-.755 1.688-1.54 1.118l-3.371-2.45a1 1 0 00-1.176 0l-3.372 2.45c-.784.57-1.838-.197-1.539-1.118l1.287-3.96a1 1 0 00-.364-1.118L2.053 9.387c-.783-.57-.38-1.81.588-1.81h4.168a1 1 0 00.95-.69l1.286-3.96z" />
          </svg>
        );
      })}
    </div>
  );
}

