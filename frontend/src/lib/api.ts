// lib/api.ts
export const getApiUrl = (): string => {
  // Если переменная окружения установлена, используем её
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Fallback для production - определяем URL на основе текущего хоста
  if (process.env.NODE_ENV === 'production') {
    // Если мы в браузере, используем текущий домен с API поддоменом
    if (typeof window !== 'undefined') {
      const currentDomain = window.location.hostname;
      if (currentDomain.includes('getaifind.com')) {
        return 'https://api.getaifind.com';
      }
    }
    // Fallback для server-side rendering
    return 'https://api.getaifind.com';
  }
  
  // Development fallback
  return 'http://localhost:8000';
};

export const apiUrl = getApiUrl();