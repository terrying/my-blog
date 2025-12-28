import React from 'react'
import { CardData, ThemeConfig } from '../types'

interface TemplateProps {
  data: CardData
  theme: ThemeConfig
}

const parseContent = (text: string, theme: ThemeConfig) => {
  const parts = text.split(/(\*\*.*?\*\*|==.*?==)/g)
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <span
          key={index}
          className="relative mx-1 inline-block font-bold"
          style={{ color: theme.colors.primary }}
        >
          {/* 简单的加粗变色，去除复杂下划线以适应不同主题 */}
          {part.slice(2, -2)}
        </span>
      )
    }
    if (part.startsWith('==') && part.endsWith('==')) {
      return (
        <span
          key={index}
          className="mx-0.5 rounded-sm px-1"
          style={{ backgroundColor: theme.colors.highlight }}
        >
          {part.slice(2, -2)}
        </span>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export const ListTemplate: React.FC<TemplateProps> = ({ data, theme }) => {
  return (
    <div
      className={`flex h-full w-full flex-col p-10 ${theme.container}`}
      style={{
        fontFamily: theme.fontFamily,
        backgroundImage: theme.backgroundPattern,
        backgroundSize: '24px 24px', // Default grid size
      }}
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className={theme.classes.title}>{data.title}</h1>
        {data.subtitle && <div className={theme.classes.subtitle}>{data.subtitle}</div>}
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6">
        {data.sections.map((section, idx) => (
          <div key={idx} className={theme.classes.sectionContainer}>
            <div className="mb-3 flex items-start">
              <div
                className={theme.classes.sectionTitle}
                style={theme.id === 'default-blue' ? { backgroundColor: theme.colors.primary } : {}}
              >
                <span className="mr-2 opacity-80">{idx + 1}.</span>
                {section.title}
              </div>
            </div>

            <div className={theme.classes.content}>
              {section.content.map((line, lIdx) => (
                <div key={lIdx} className="mb-2">
                  {parseContent(line, theme)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="mt-auto flex items-center justify-between border-t border-dashed border-gray-300/30 pt-8 text-sm opacity-60"
        style={{ color: theme.colors.text }}
      >
        <div>Knowledge Card</div>
        <div className="flex gap-4">
          {data.author && <span>@{data.author}</span>}
          {data.date && <span>{data.date}</span>}
        </div>
      </div>
    </div>
  )
}
