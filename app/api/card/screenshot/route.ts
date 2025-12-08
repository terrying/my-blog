import { NextRequest } from 'next/server'
import { chromium } from 'playwright'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pathParam = searchParams.get('path') || '/card/ipo'
  const format = (searchParams.get('format') || 'png').toLowerCase() as 'png' | 'jpeg'
  const width = Number(searchParams.get('width') || 1080)
  const height = Number(searchParams.get('height') || 1440)
  const scale = Number(searchParams.get('scale') || 2)

  const proto = req.headers.get('x-forwarded-proto') || 'http'
  const host = req.headers.get('host') || 'localhost:3000'
  const targetUrl = new URL(pathParam, `${proto}://${host}`).toString()

  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: scale,
  })
  const page = await context.newPage()

  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle' })
    // 等待字体
    try {
      await page.evaluate(async () => {
        // @ts-ignore
        if (document.fonts?.ready) {
          await (document.fonts as any).ready
        }
      })
    } catch {}

    const element = await page.$('.shot-canvas')
    let buffer: Buffer
    if (element) {
      buffer = (await element.screenshot({
        type: format,
        quality: format === 'jpeg' ? 92 : undefined,
      })) as Buffer
    } else {
      buffer = (await page.screenshot({
        type: format,
        quality: format === 'jpeg' ? 92 : undefined,
      })) as Buffer
    }

    await browser.close()

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': format === 'png' ? 'image/png' : 'image/jpeg',
        'Cache-Control': 'public, max-age=60',
      },
    })
  } catch (err) {
    await browser.close()
    return new Response(`Screenshot error: ${String(err)}`, { status: 500 })
  }
}

let universalCssCache: string | null = null
function escapeMdHtml(input: string): string {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function mdToHtml(md: string): string {
  if (!md) return ''
  md = md.replace(/\r\n?/g, '\n')
  // Tables (GFM)
  const convertTables = (src: string): string => {
    const lines = src.split(/\n/)
    const out: string[] = []
    let i = 0
    const isTableSep = (s: string) =>
      /^(\s*\|)?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+(\|\s*)?$/.test(s)
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
          html += `<th style="text-align:${align}">${escapeMdHtml(h)}</th>`
        })
        html += '</tr></thead>\n<tbody>'
        rows.forEach((r) => {
          html += '<tr>'
          r.forEach((c, idx) => {
            const align = aligns[idx] || 'left'
            html += `<td style="text-align:${align}">${escapeMdHtml(c)}</td>`
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
  md = convertTables(md)
  md = md.replace(/```([\w-]+)?\n([\s\S]*?)\n```/g, (_, lang: string, code: string) => {
    const safe = escapeMdHtml(code)
    const cls = lang ? ` class="language-${lang}"` : ''
    return `<pre><code${cls}>${safe}</code></pre>`
  })
  md = md.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
  md = md.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
  md = md.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
  md = md.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
  md = md.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
  md = md.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
  md = md.replace(/^>\s?(.+)$/gm, '<blockquote>$1</blockquote>')
  md = md.replace(/^(\d+)\.\s+(.+)$/gm, '<ol start="$1"><li>$2</li></ol>')
  md = md.replace(/<\/ol>\n<ol start="\d+">/g, '')
  md = md.replace(/^[-*]\s+(.+)$/gm, '<ul><li>$1</li></ul>')
  md = md.replace(/<\/ul>\n<ul>/g, '')
  md = md.replace(/^---$/gm, '<hr/>')
  md = md.replace(/`([^`]+)`/g, (_, c: string) => `<code>${escapeMdHtml(c)}</code>`)
  md = md.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  md = md.replace(/__([^_]+)__/g, '<strong>$1</strong>')
  md = md.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  md = md.replace(/_([^_]+)_/g, '<em>$1</em>')
  // Images ![alt](src "title")
  md = md.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
    (m, alt: string, src: string, title?: string) => {
      const t = title ? ` title="${escapeMdHtml(title)}"` : ''
      return `<img src="${escapeMdHtml(src)}" alt="${escapeMdHtml(alt)}"${t} />`
    }
  )
  md = md.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
    (m, text: string, href: string, title?: string) => {
      const t = title ? ` title="${escapeMdHtml(title)}"` : ''
      return `<a href="${escapeMdHtml(href)}"${t}>${text}</a>`
    }
  )
  const blocks = md.split(/\n\n+/).map((b) => {
    if (/^\s*</.test(b.trim())) return b
    const content = b
      .split(/\n/)
      .map((l) => l.trim())
      .join(' ')
    if (!content) return ''
    return `<p>${content}</p>`
  })
  return blocks.join('\n')
}

function escapeHtml(input: unknown): string {
  const s = String(input ?? '')
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getDeep(obj: any, pathStr: string): unknown {
  if (!pathStr) return ''
  const normalized = pathStr.replace(/\[(\d+)\]/g, '.$1')
  return normalized
    .split('.')
    .reduce((acc: any, key: string) => (acc == null ? undefined : acc[key]), obj)
}

function renderTemplate(source: string, data: Record<string, unknown>): string {
  if (!source) return ''
  // Unescaped first: {{{ path }}}
  let out = source.replace(/\{\{\{\s*([^}]+?)\s*\}\}\}/g, (_, key: string) => {
    const val = getDeep(data, key.trim())
    return String(val ?? '')
  })
  // Escaped: {{ path }}
  out = out.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, key: string) => {
    const val = getDeep(data, key.trim())
    return escapeHtml(val)
  })
  return out
}

export async function POST(req: NextRequest) {
  const {
    html = '',
    markdown = '',
    css = '',
    width = 1080,
    height = 1440,
    scale = 2,
    format = 'png',
    template,
    data,
    padding,
  } = (await req.json().catch(() => ({}))) as {
    html?: string
    markdown?: string
    css?: string
    width?: number
    height?: number
    scale?: number
    format?: 'png' | 'jpeg'
    template?: string
    data?: Record<string, unknown>
    padding?: number
  }

  const safeFormat = (String(format).toLowerCase() as 'png' | 'jpeg') || 'png'
  const shotWidth = Number(width) || 1080
  const shotHeight = Number(height) || 1440
  const deviceScale = Number(scale) || 2

  // Load and cache the universal CSS shim
  if (universalCssCache == null) {
    try {
      const cssPath = path.join(process.cwd(), 'public', 'card', 'universal-card.css')
      universalCssCache = await readFile(cssPath, 'utf8')
    } catch {
      universalCssCache = ''
    }
  }

  let finalHtml = html
  if (!finalHtml && markdown) {
    finalHtml = mdToHtml(String(markdown))
  }

  if (!finalHtml && template) {
    try {
      const tplPath = path.join(process.cwd(), 'data', 'card-templates', `${template}.html`)
      const tplSource = await readFile(tplPath, 'utf8')
      finalHtml = renderTemplate(tplSource, (data as Record<string, unknown>) || {})
    } catch (e) {
      return new Response(`Template not found or failed to render: ${String(e)}`, { status: 400 })
    }
  }

  const pad = Math.max(0, Math.min(48, Number(padding) || 24))
  const htmlDocument = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body { margin: 0; padding: 0; background: #fff; }
      ${universalCssCache || ''}
      ${css || ''}
    </style>
  </head>
  <body>
    <div class="shot-canvas" style="
      width: ${shotWidth}px; height: ${shotHeight}px; box-sizing: border-box;
      padding: ${pad}px; background: #fff; border-radius: 24px; overflow: hidden;
      display: flex; align-items: stretch; justify-content: stretch;
    ">
      <div style="width: 100%; height: 100%;">${finalHtml}</div>
    </div>
  </body>
 </html>`

  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const context = await browser.newContext({
    viewport: { width: shotWidth, height: shotHeight },
    deviceScaleFactor: deviceScale,
  })
  const page = await context.newPage()

  try {
    await page.setContent(htmlDocument, { waitUntil: 'networkidle' })
    // wait for fonts if available
    try {
      await page.evaluate(async () => {
        // @ts-ignore
        if (document.fonts?.ready) {
          await (document.fonts as any).ready
        }
      })
    } catch {}

    const element = await page.$('.shot-canvas')
    let buffer: Buffer
    if (element) {
      buffer = (await element.screenshot({
        type: safeFormat,
        quality: safeFormat === 'jpeg' ? 92 : undefined,
      })) as Buffer
    } else {
      buffer = (await page.screenshot({
        type: safeFormat,
        quality: safeFormat === 'jpeg' ? 92 : undefined,
      })) as Buffer
    }

    await browser.close()

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': safeFormat === 'png' ? 'image/png' : 'image/jpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    await browser.close()
    return new Response(`Screenshot error: ${String(err)}`, { status: 500 })
  }
}
