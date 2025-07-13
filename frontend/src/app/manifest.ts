// src/app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AI Tools Finder - GetAIFind',
    short_name: 'GetAIFind',
    description: 'Comprehensive catalog of AI tools and neural networks for professionals and enthusiasts',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      }
    ],
    categories: ['productivity', 'business', 'education', 'utilities'],
    lang: 'en',
    dir: 'ltr',
    orientation: 'portrait-primary',
    scope: '/',
    id: 'getaifind-app'
  };
}