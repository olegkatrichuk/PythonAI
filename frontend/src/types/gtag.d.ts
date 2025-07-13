export interface GtagEvent {
  action: string
  category: string
  label?: string
  value?: number
}

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      targetId: string,
      config?: {
        page_path?: string
        event_category?: string
        event_label?: string
        value?: number
        [key: string]: any
      }
    ) => void
    dataLayer: any[]
  }
}