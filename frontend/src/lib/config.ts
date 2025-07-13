// lib/config.ts (создайте этот файл)
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ||
          (process.env.NODE_ENV === 'production'
            ? 'http://142.132.228.75:8000'
            : 'http://localhost:8000'
          ),
} as const;