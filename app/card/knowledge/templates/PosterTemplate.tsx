import React from 'react'
import { CardData, ThemeConfig } from '../types'

interface TemplateProps {
  data: CardData
  theme: ThemeConfig
}

export const PosterTemplate: React.FC<TemplateProps> = ({ data, theme }) => {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center p-12 text-center ${theme.container}`}
      style={{ fontFamily: theme.fontFamily }}
    >
      <div className={theme.classes.subtitle}>{data.subtitle || 'KNOWLEDGE'}</div>

      <h1 className={theme.classes.title} style={{ lineHeight: 1.2 }}>
        {data.title}
      </h1>

      <div
        className="mb-12 h-2 w-24 bg-current opacity-80"
        style={{ color: theme.colors.primary }}
      ></div>

      <div className="max-w-md space-y-8">
        {data.sections.map((section, idx) => (
          <div key={idx} className={theme.classes.sectionContainer}>
            <h3 className={theme.classes.sectionTitle}>{section.title}</h3>
            <div className={theme.classes.content}>
              {section.content.map((line, i) => (
                <p key={i} className="mb-2">
                  {line.replace(/\*\*|==/g, '')}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        className="mt-auto pt-12 font-bold tracking-widest uppercase"
        style={{ color: theme.colors.accent }}
      >
        {data.author || 'MYBLOG'}
      </div>
    </div>
  )
}
