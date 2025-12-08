import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function convertTables(md: string): string {
  const lines = md.split(/\n/)
  const out: string[] = []
  let i = 0
  const isTableSep = (s: string) => /^(\s*\|)?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+(\|\s*)?$/.test(s)
  const splitCells = (s: string) =>
    s
      .replace(/^\s*\|/, '')
      .replace(/\|\s*$/, '')
      .split(/\|/)
      .map((c) => c.trim())

  while (i < lines.length) {
    const headerLine = lines[i]
    const sepLine = lines[i + 1]
    if (headerLine && sepLine && headerLine.includes('|') && isTableSep(sepLine)) {
      const headers = splitCells(headerLine)
      const aligns = splitCells(sepLine).map((c) =>
        c.startsWith(':') && c.endsWith(':')
          ? 'center'
          : c.endsWith(':')
            ? 'right'
            : c.startsWith(':')
              ? 'left'
              : 'left'
      )
      i += 2
      const rows: string[][] = []
      while (i < lines.length) {
        const row = lines[i]
        if (!row.trim() || !row.includes('|')) break
        if (isTableSep(row)) break
        rows.push(splitCells(row))
        i += 1
      }
      let html = '<table>\n<thead><tr>'
      headers.forEach((h, idx) => {
        const align = aligns[idx] || 'left'
        html += `<th style="text-align:${align}">${escapeHtml(h)}</th>`
      })
      html += '</tr></thead>\n<tbody>'
      rows.forEach((r) => {
        html += '<tr>'
        r.forEach((c, idx) => {
          const align = aligns[idx] || 'left'
          html += `<td style="text-align:${align}">${escapeHtml(c)}</td>`
        })
        html += '</tr>'
      })
      html += '</tbody>\n</table>'
      out.push(html)
      continue
    }
    out.push(lines[i])
    i += 1
  }
  return out.join('\n')
}

// A lightweight Markdown -> HTML converter covering common syntaxes
function markdownToHtml(md: string): string {
  if (!md) return ''

  // Normalize line endings
  md = md.replace(/\r\n?/g, '\n')

  // Tables (GFM)
  md = convertTables(md)

  // Fenced code blocks ```lang\n code \n```
  md = md.replace(/```([\w-]+)?\n([\s\S]*?)\n```/g, (_, lang: string, code: string) => {
    const safe = escapeHtml(code)
    const cls = lang ? ` class="language-${lang}"` : ''
    return `<pre><code${cls}>${safe}</code></pre>`
  })

  // Headings ######
  md = md.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  md = md.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  md = md.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  md = md.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  md = md.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  md = md.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')

  // Blockquotes
  md = md.replace(/^>\s?(.+)$/gm, '<blockquote>$1</blockquote>')

  // Ordered list
  md = md.replace(/^(\d+)\.\s+(.+)$/gm, '<ol start="$1"><li>$2</li></ol>')
  // Merge adjacent ol blocks
  md = md.replace(/<\/ol>\n<ol start="\d+">/g, '')

  // Unordered list
  md = md.replace(/^[-*]\s+(.+)$/gm, '<ul><li>$1</li></ul>')
  md = md.replace(/<\/ul>\n<ul>/g, '')

  // Horizontal rule
  md = md.replace(/^---$/gm, '<hr/>')

  // Inline: code, bold, italic, links
  md = md.replace(/`([^`]+)`/g, (_, c: string) => `<code>${escapeHtml(c)}</code>`)
  md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  md = md.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  md = md.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  md = md.replace(/_([^_]+)_/g, '<em>$1</em>')
  // Images ![alt](src "title")
  md = md.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
    (m, alt: string, src: string, title?: string) => {
      const t = title ? ` title="${escapeHtml(title)}"` : ''
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${t} />`
    }
  )
  md = md.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
    (m, text: string, href: string, title?: string) => {
      const t = title ? ` title="${escapeHtml(title)}"` : ''
      return `<a href="${escapeHtml(href)}"${t}>${text}</a>`
    }
  )

  // Paragraphs: wrap loose lines
  const lines = md.split(/\n\n+/).map((block) => {
    if (/^\s*<\/(?:h\d|ul|ol|pre|blockquote|hr)>/i.test(block.trim())) return block
    if (/^\s*<(h\d|ul|ol|pre|blockquote|hr)/i.test(block.trim())) return block
    // If already contains block tags, keep as is
    if (/<\/(?:h\d|ul|ol|pre|blockquote|hr)>/i.test(block)) return block
    const content = block
      .split(/\n/)
      .map((l) => l.trim())
      .join(' ')
    if (!content) return ''
    return `<p>${content}</p>`
  })

  return lines.join('\n')
}

export async function POST(req: NextRequest) {
  const { markdown = '' } = (await req.json().catch(() => ({}))) as { markdown?: string }
  const html = markdownToHtml(String(markdown || ''))
  return new Response(JSON.stringify({ html }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}
