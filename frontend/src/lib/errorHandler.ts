// lib/errorHandler.ts
export interface ErrorInfo {
  message: string;
  statusCode?: number;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errors: ErrorInfo[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  logError(error: Error | string, context?: any): void {
    const errorInfo: ErrorInfo = {
      message: typeof error === 'string' ? error : error.message,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    this.errors.push(errorInfo);

    // В development показываем в консоли
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorInfo, context);
    }

    // В production можно отправлять в сервис мониторинга
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(errorInfo);
    }
  }

  private sendToMonitoring(errorInfo: ErrorInfo): void {
    // Здесь можно добавить отправку в Sentry, LogRocket и т.д.
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorInfo)
    // });
  }

  getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }
}

// Singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions
export const handleApiError = (error: any): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.status === 401) {
    return 'Unauthorized access. Please login again.';
  }
  if (error.response?.status === 403) {
    return 'Access forbidden. You do not have permission.';
  }
  if (error.response?.status === 404) {
    return 'Resource not found.';
  }
  if (error.response?.status >= 500) {
    return 'Server error. Please try again later.';
  }
  return 'An unexpected error occurred.';
};

export const showUserFriendlyError = (error: any): void => {
  const message = handleApiError(error);
  errorHandler.logError(error);
  
  // Здесь можно добавить toast notification
  // toast.error(message);
};