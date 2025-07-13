// Google Analytics configuration and utilities

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || ''

// https://developers.google.com/analytics/devguides/collection/gtagjs/pages
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    })
  }
}

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
type GtagEvent = {
  action: string
  category: string
  label?: string
  value?: number
}

export const event = ({ action, category, label, value }: GtagEvent) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Specific event tracking functions for the AI Tools directory
export const trackEvents = {
  // Tool interactions
  toolView: (toolName: string, category: string) => {
    event({
      action: 'view_tool',
      category: 'Tool',
      label: `${toolName} (${category})`,
    })
  },

  toolClick: (toolName: string, category: string, url: string) => {
    event({
      action: 'click_tool',
      category: 'Tool',
      label: `${toolName} (${category})`,
    })
    
    // Track outbound link
    event({
      action: 'click',
      category: 'Outbound Link',
      label: url,
    })
  },

  // Search interactions
  search: (query: string, resultsCount: number) => {
    event({
      action: 'search',
      category: 'Search',
      label: query,
      value: resultsCount,
    })
  },

  // User engagement
  reviewSubmit: (toolName: string, rating: number) => {
    event({
      action: 'submit_review',
      category: 'Engagement',
      label: toolName,
      value: rating,
    })
  },

  // User account actions
  userRegister: () => {
    event({
      action: 'sign_up',
      category: 'User',
      label: 'Registration',
    })
  },

  userLogin: () => {
    event({
      action: 'login',
      category: 'User',
      label: 'Login',
    })
  },

  // Navigation
  categoryView: (categoryName: string) => {
    event({
      action: 'view_category',
      category: 'Navigation',
      label: categoryName,
    })
  },

  // Tool management
  toolAdd: (toolName: string, category: string) => {
    event({
      action: 'add_tool',
      category: 'Tool Management',
      label: `${toolName} (${category})`,
    })
  },

  // Social sharing (if implemented)
  socialShare: (platform: string, toolName: string) => {
    event({
      action: 'share',
      category: 'Social',
      label: `${platform}: ${toolName}`,
    })
  },

  // Newsletter subscription (if implemented)
  newsletterSubscribe: (email: string) => {
    event({
      action: 'subscribe',
      category: 'Newsletter',
      label: 'Email subscription',
    })
  },

  // Error tracking
  error: (errorType: string, errorMessage: string) => {
    event({
      action: 'error',
      category: 'Error',
      label: `${errorType}: ${errorMessage}`,
    })
  },

  // Performance tracking
  performanceIssue: (issueType: string, value: number) => {
    event({
      action: 'performance_issue',
      category: 'Performance',
      label: issueType,
      value: value,
    })
  },
}

// Custom dimensions and metrics (configure in GA4 dashboard)
export const setCustomDimensions = (user: any) => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    window.gtag('config', GA_TRACKING_ID, {
      custom_map: {
        custom_dimension_1: 'user_type', // 'registered' | 'anonymous'
        custom_dimension_2: 'user_id',
        custom_dimension_3: 'language',
      },
    })

    window.gtag('event', 'page_view', {
      user_type: user ? 'registered' : 'anonymous',
      user_id: user?.id || null,
      language: navigator.language || 'unknown',
    })
  }
}