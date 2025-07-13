'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { analytics } from '@/lib/analytics'

interface AnalyticsTrackerProps {
  toolId?: number
}

export default function AnalyticsTracker({ toolId }: AnalyticsTrackerProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Небольшая задержка для корректного трекинга
    const timer = setTimeout(() => {
      analytics.trackPageView(pathname, toolId)
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname, toolId])

  return null // Этот компонент не рендерит ничего видимого
}