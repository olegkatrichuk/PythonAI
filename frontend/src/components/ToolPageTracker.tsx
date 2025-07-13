'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { analytics } from '@/lib/analytics'

interface ToolPageTrackerProps {
  toolId: number
}

export default function ToolPageTracker({ toolId }: ToolPageTrackerProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Трекинг просмотра страницы инструмента
    const timer = setTimeout(() => {
      analytics.trackPageView(pathname, toolId)
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname, toolId])

  return null
}