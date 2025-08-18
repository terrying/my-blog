'use client'

import { useState, useEffect } from 'react'

export interface TOCItem {
  value: string
  url: string
  depth: number
}

interface TOCProps {
  toc: TOCItem[]
}

export default function TOC({ toc }: TOCProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '0% 0% -80% 0%' }
    )

    // 观察所有标题元素
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach((heading) => observer.observe(heading))

    return () => observer.disconnect()
  }, [])

  if (!toc || toc.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          文章目录
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          此文章暂无目录
        </div>
      </div>
    )
  }

  const handleClick = (url: string) => {
    const element = document.querySelector(url)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        文章目录
      </h3>
      <nav className="space-y-1">
        {toc.map((item, index) => {
          const isActive = activeId === item.url.slice(1) // 移除 # 符号
          return (
            <button
              key={index}
              onClick={() => handleClick(item.url)}
              className={`
                block w-full text-left text-sm py-1.5 px-2 rounded transition-colors
                ${isActive 
                  ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20 font-medium' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }
              `}
              style={{
                paddingLeft: `${0.5 + (item.depth - 1) * 0.75}rem`,
              }}
            >
              <span className="line-clamp-2 leading-snug">
                {item.value}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}