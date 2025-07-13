'use client'

import { useEffect } from 'react'
import { trackEvents } from '@/lib/gtag'

interface CategoryTrackerProps {
  categoryName: string
}

export default function CategoryTracker({ categoryName }: CategoryTrackerProps) {
  useEffect(() => {
    // Track category view when component mounts
    if (categoryName) {
      trackEvents.categoryView(categoryName)
    }
  }, [categoryName])

  return null // This component doesn't render anything
}