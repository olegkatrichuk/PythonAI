// lib/api.ts
export const getApiUrl = (): string => {
  // Если переменная окружения установлена, используем её
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // На production используем относительный путь если API и frontend на одном домене
  if (process.env.NODE_ENV === 'production') {
    // Используем относительный URL - Next.js rewrite перенаправит на backend
    return '';
  }
  
  // Development fallback
  return 'http://localhost:8000';
};

export const apiUrl = getApiUrl();