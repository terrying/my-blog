'use client'

import { useEffect, useState } from 'react'

interface ViewCounterProps {
  slug: string
  trackView?: boolean
  className?: string
}

export default function ViewCounter({ slug, trackView = false, className = '' }: ViewCounterProps) {
  const [views, setViews] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchViews = async () => {
      try {
        // 获取当前阅读次数
        const response = await fetch(`/api/views/${encodeURIComponent(slug)}`)
        if (response.ok) {
          const data = await response.json()
          setViews(data.views)
        }
      } catch (error) {
        console.error('Error fetching views:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const incrementView = async () => {
      try {
        // 增加阅读次数
        const response = await fetch(`/api/views/${encodeURIComponent(slug)}`, {
          method: 'POST',
        })
        if (response.ok) {
          const data = await response.json()
          setViews(data.views)
        }
      } catch (error) {
        console.error('Error incrementing views:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (trackView) {
      // 如果需要统计阅读，则增加计数
      incrementView()
    } else {
      // 否则只获取当前计数
      fetchViews()
    }
  }, [slug, trackView])

  if (isLoading) {
    return (
      <span className={`text-gray-500 dark:text-gray-400 ${className}`}>
        <svg className="inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </span>
    )
  }

  return (
    <span className={`flex items-center text-gray-500 dark:text-gray-400 ${className}`}>
      <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
      {views.toLocaleString()} 阅读
    </span>
  )
}