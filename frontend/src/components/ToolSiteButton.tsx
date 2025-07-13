'use client'

import { trackEvents } from '@/lib/gtag'

interface ToolSiteButtonProps {
  toolName: string
  category: string
  url: string
}

export default function ToolSiteButton({ toolName, category, url }: ToolSiteButtonProps) {
  const handleClick = () => {
    // Track the outbound click
    trackEvents.toolClick(toolName, category, url)
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      onClick={handleClick}
      className="w-full text-center bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
    >
      Перейти на сайт &rarr;
    </a>
  )
}