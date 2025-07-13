// Библиотека для трекинга аналитики

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
  private apiUrl: string;

  constructor() {
    // Жестко задаем URL, так как переменные окружения не подхватываются в некоторых контекстах
    this.apiUrl = 'http://localhost:8000';
  }

  private async sendRequest(endpoint: string, data: any) {
    try {
      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${this.apiUrl}/api${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });
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

    this.sendRequest('/analytics/page-view', data);
  }

  trackSearch(query: string, resultsCount: number) {
    if (typeof window === 'undefined') return;

    const data: SearchQueryData = {
      query,
      results_count: resultsCount,
      language: navigator.language.split('-')[0],
    };

    this.sendRequest('/analytics/search', data);
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