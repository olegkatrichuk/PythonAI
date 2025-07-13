// Библиотека для трекинга аналитики
import { api } from '@/lib/api';

interface PageViewData {
  path: string;
  user_agent?: string;
  ip_address?: string;
  referer?: string;
  language?: string;
  tool_id?: number;
}

interface SearchQueryData {
  query: string;
  results_count: number;
  language?: string;
}

class Analytics {

  private async sendRequest(endpoint: string, data: any) {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: any = {};

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await api.post(endpoint, data, { headers });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  trackPageView(path: string, toolId?: number) {
    if (typeof window === 'undefined') return;

    const data: PageViewData = {
      path,
      user_agent: navigator.userAgent,
      referer: document.referrer || undefined,
      language: navigator.language.split('-')[0],
      tool_id: toolId,
    };

    this.sendRequest('/api/analytics/page-view', data);
  }

  trackSearch(query: string, resultsCount: number) {
    if (typeof window === 'undefined') return;

    const data: SearchQueryData = {
      query,
      results_count: resultsCount,
      language: navigator.language.split('-')[0],
    };

    this.sendRequest('/api/analytics/search', data);
  }

  // Автоматический трекинг при загрузке страницы
  trackCurrentPage(toolId?: number) {
    if (typeof window === 'undefined') return;
    
    this.trackPageView(window.location.pathname, toolId);
  }
}

export const analytics = new Analytics();

// Хук для использования в React компонентах
export function useAnalytics() {
  return {
    trackPageView: analytics.trackPageView.bind(analytics),
    trackSearch: analytics.trackSearch.bind(analytics),
    trackCurrentPage: analytics.trackCurrentPage.bind(analytics),
  };
}