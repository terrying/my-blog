'use client'
import React, { useEffect, useId, useState } from 'react'

type MermaidProps = {
  chart: string
  className?: string
}

export default function Mermaid({ chart, className }: MermaidProps) {
  const [svg, setSvg] = useState<string>('')
  const id = useId().replace(/[:]/g, '-')

  useEffect(() => {
    let aborted = false
    // Lazy import to avoid SSR import issues
    import('mermaid')
      .then((m) => {
        m.default.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'neutral',
          themeVariables: {
            fontSize: '228px',
          },
        })
        return m.default.render(`mmd-${id}`, chart)
      })
      .then(({ svg }) => {
        if (!aborted) {
          const forcedCss = `<style>
            .mermaid text { font-size: 22px !important; }
            .mermaid .messageText, .mermaid .noteText, .mermaid .actor > text, .mermaid .actor > tspan, .mermaid .labelText { font-size: 22px !important; }
          </style>`
          const enhanced = svg.includes('</svg>')
            ? svg.replace('</svg>', `${forcedCss}</svg>`)
            : svg
          setSvg(enhanced)
        }
      })
      .catch((err) => {
        console.error('Mermaid render error:', err)
        setSvg('<div class="text-red-600">Mermaid 渲染失败</div>')
      })
    return () => {
      aborted = true
    }
  }, [chart, id])

  if (!chart) return null
  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: svg || '<div>渲染中…</div>' }} />
  )
}
