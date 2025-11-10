'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Head from 'next/head'
import CardXhs from '@/components/CardXhs'

const DEFAULT_W = 1080
const DEFAULT_H = 1440

function encodeB64(s: string) {
  return typeof window === 'undefined' ? '' : btoa(unescape(encodeURIComponent(s)))
}

export default function CardEditor() {
  const [html, setHtml] = useState<string>('')
  const [css, setCss] = useState<string>('')
  const [format, setFormat] = useState<'png' | 'jpeg'>('png')
  const [scale, setScale] = useState(2)
  const [baseWidth, setBaseWidth] = useState<number>(600)
  const [previewScale, setPreviewScale] = useState<number>(0.75)
  const [canvasPadding, setCanvasPadding] = useState<number>(16)
  const [showOutlines, setShowOutlines] = useState<boolean>(false)
  const [showGrid, setShowGrid] = useState<boolean>(false)
  const [showInspector, setShowInspector] = useState<boolean>(false)
  const [previewMode] = useState<'web' | 'paginate'>('paginate')
  const [pageWidth, setPageWidth] = useState<number>(DEFAULT_W)
  const [pageHeight, setPageHeight] = useState<number>(DEFAULT_H)
  const [sizePreset, setSizePreset] = useState<'xhs' | 'ig' | 'a4' | 'custom'>('xhs')
  const [previewHeight, setPreviewHeight] = useState<number>(DEFAULT_H)
  const [previewContainerWidth, setPreviewContainerWidth] = useState<number>(400) // 卡片宽度
  const [widthInput, setWidthInput] = useState<string>('400')
  const [pageGap, setPageGap] = useState<number>(30) // 默认 30，不展示控件
  const [borderRadius, setBorderRadius] = useState<number>(20)
  const [fontScale, setFontScale] = useState<number>(1)
  const [bgUrl, setBgUrl] = useState<string>('')
  const [bgFit, setBgFit] = useState<'cover' | 'contain'>('cover')
  const [bgMask, setBgMask] = useState<number>(0.9)
  const [bgMode, setBgMode] = useState<'default' | 'solid' | 'gradient' | 'image'>('default')
  const [bgSolid, setBgSolid] = useState<string>('#f8fbff')
  const gradientPresets: Record<string, string> = {
    blue: 'linear-gradient(180deg,#eef2ff 0%,#e0f2fe 100%)',
    lavender: 'linear-gradient(180deg,#f5f3ff 0%,#e9d5ff 100%)',
    peach: 'linear-gradient(180deg,#fff7ed 0%,#ffe4e6 100%)',
    mint: 'linear-gradient(180deg,#ecfeff 0%,#dcfce7 100%)',
  }
  const [bgGradientKey, setBgGradientKey] = useState<string>('blue')
  const cardBgStyle: React.CSSProperties | undefined = useMemo(() => {
    if (bgMode === 'solid') return { background: bgSolid }
    if (bgMode === 'gradient') return { background: gradientPresets[bgGradientKey] || gradientPresets.blue }
    return undefined
  }, [bgMode, bgSolid, bgGradientKey])
  const [fixImg, setFixImg] = useState<boolean>(false)
  const [fixImgH, setFixImgH] = useState<number>(220)
  // aspect ratio presets
  const [ratioPreset, setRatioPreset] = useState<'xhs' | 'square' | 'story' | 'land' | 'custom'>('xhs')
  const ratioValue = useMemo(() => {
    switch (ratioPreset) {
      case 'square': return 1
      case 'story': return 16 / 9
      case 'land': return 3 / 2
      case 'xhs':
      default: return 4 / 3
    }
  }, [ratioPreset])
  const [customRatio, setCustomRatio] = useState<number>(4 / 3)
  // font settings
  const [fontFamily, setFontFamily] = useState<string>('system-ui, -apple-system, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", Segoe UI, Roboto, Arial')
  // accordion open states
  const [openBasic, setOpenBasic] = useState<boolean>(true)
  const [openBg, setOpenBg] = useState<boolean>(false)
  const [openFont, setOpenFont] = useState<boolean>(false)
  // Keep page size tied to preview width, ratio 3:4 (Xiaohongshu)
  useEffect(() => {
    const w = previewContainerWidth
    const usedRatio = ratioPreset === 'custom' ? customRatio : ratioValue
    const h = Math.round(w * usedRatio)
    setPageWidth(w)
    setPageHeight(h)
  }, [previewContainerWidth, ratioPreset, customRatio, ratioValue])

  // Keep input text in sync when width changes programmatically
  useEffect(() => {
    setWidthInput(String(previewContainerWidth))
  }, [previewContainerWidth])
  const previewRef = useRef<HTMLDivElement | null>(null)
  const measureRef = useRef<HTMLDivElement | null>(null)
  const [pagesHtml, setPagesHtml] = useState<string[]>([])
  const DEFAULT_MDX = `# 公司簡介\n\n> 大行科工（深圳）股份是中國內地最大2323的折疊自行車公司。根據資料，按2024年零售量計，集團於中國內地折疊自行車行業排名第一，市場份額達26.3%，按2024年零售額計，集團亦位居中國內地折疊自行車行業首位，市場份額為36.5%。f\n\n集團的大行品牌由韓德瑋博士於1982年創立，以P8等久經考驗的暢銷車型為基石，再加上新開發的車型，產品陣容已從折疊自行車發展到其他自行車類型，包括公路自行車、山地自行車、兒童自行車和電助力自行車。截至2025年4月30日，集團提供超過70款自行車車型。123\n\n![](https://picsum.photos/600/300)\n\n## 它的主要功能：\n\n1. 将 Markdown 转化为**知识卡片**\n2. 多种主题风格任你选择\n3. 长文自动拆分，或者根据 markdown \`---\` 横线拆分\n4. 可以复制图片到\`剪贴板\`，或者下载为\`PNG\`、\`SVG\`图片\n5. 所见即所得\n6. 免费\n\n| 表头1 | 表头2 |\n| --- | --- |\n| 单元格1 | 单元格2 |\n`
  const [mdxSource, setMdxSource] = useState<string>(DEFAULT_MDX)
  const [debouncedMdx, setDebouncedMdx] = useState<string>(DEFAULT_MDX)

  // 不再预载旧模板，默认使用内置 MDX 示例

  // debounce mdx source
  useEffect(() => {
    const id = setTimeout(() => setDebouncedMdx(mdxSource), 300)
    return () => clearTimeout(id)
  }, [mdxSource])

  // Keep HTML fallback (for tables etc.) in sync automatically
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/card/markdown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdown: debouncedMdx }),
        })
        const data = await res.json()
        if (typeof data?.html === 'string') setHtml(String(data.html))
      } catch {}
    })()
  }, [debouncedMdx])

  // Build preview HTML into a div (no iframe)
  useEffect(() => {
    const bw = Math.max(1, Number(baseWidth) || 600)
    const pad = Math.max(0, Math.min(48, Number(canvasPadding) || 0))
    const innerW = pageWidth - pad * 2
    const innerH = pageHeight - pad * 2
    const sandbox = measureRef.current
    if (!sandbox) return
    const waitReady = async (root: HTMLElement) => {
      const waits: Promise<any>[] = []
      try { if ((document as any).fonts?.ready) waits.push((document as any).fonts.ready) } catch {}
      root.querySelectorAll('img').forEach((img) => {
        const el = img as HTMLImageElement
        if (!el.complete) {
          waits.push(new Promise((res) => { el.addEventListener('load', () => res(null), { once: true }); el.addEventListener('error', () => res(null), { once: true }) }))
        }
      })
      await Promise.all(waits)
    }
    const buildWeb = async () => {
      sandbox.innerHTML = `<div style="width:${bw}px">${html || ''}</div>`
      const content = sandbox.firstElementChild as HTMLElement
      await waitReady(content)
      const nh = content.scrollHeight || 1
      const scale = innerW / bw
      const scaledH = Math.ceil(nh * scale) + pad * 2
      setPreviewHeight(scaledH)
      setPagesHtml([html || ''])
    }
    const buildPaginate = async () => {
      // Prepare a measuring container with the same inner width as the card content
      sandbox.innerHTML = `<div id=\\\"measure\\\" style=\\\"width:${innerW}px\\\"></div>`
      const meas = sandbox.firstElementChild as HTMLElement
      ;(meas as HTMLElement).style.fontSize = `${16 * fontScale}px`
      ;(meas as HTMLElement).style.fontFamily = fontFamily
      if (fixImg) {
        const styleEl = document.createElement('style')
        styleEl.textContent = `.mdx-content img{height:${fixImgH}px;width:100%;object-fit:cover;display:block}`
        meas.appendChild(styleEl)
      }
      if (debouncedMdx) {
        try {
          const [{ compile, run }, { createRoot }, gfmMod] = await Promise.all([
            import('@mdx-js/mdx'),
            import('react-dom/client'),
            import('remark-gfm').catch(() => ({ default: undefined })),
          ])
          // 如果没有 gfm，优先使用 HTML 回退以获得表格等结构
          if (!gfmMod?.default && html) {
            meas.innerHTML = `<div class=\"mdx-content\" style=\"font-size:${16 * fontScale}px\">${html}</div>`
            await waitReady(meas)
          } else {
            const compiled: any = await compile(debouncedMdx, {
            outputFormat: 'function-body',
            development: false,
            remarkPlugins: gfmMod?.default ? [gfmMod.default] : [],
            })
            const { Fragment, jsx, jsxs } = await import('react/jsx-runtime')
            // @ts-ignore run returns a module with default export
            const mod: any = await run(compiled, { Fragment, jsx, jsxs })
            const MDX = mod.default
            const root = createRoot(meas)
            // @ts-ignore
            root.render(<div className="mdx-content" style={{ fontSize: `${16 * fontScale}px` }}><MDX /></div>)
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))))
            await waitReady(meas)
          }
        } catch (e) {
          meas.innerHTML = `<div class=\"mdx-content\" style=\"font-size:${16 * fontScale}px\">${html || ''}</div>`
          await waitReady(meas)
        }
      } else {
        meas.innerHTML = `<div class=\"mdx-content\" style=\"font-size:${16 * fontScale}px\">${html || ''}</div>`
        await waitReady(meas)
      }

      // Get top-level blocks for simple pagination
      const direct = Array.from(meas.querySelectorAll(':scope > *'))
      const blocks: Element[] = direct.length > 1 ? direct : Array.from((direct[0] as HTMLElement | undefined)?.children || meas.children)

      // Helper: measure natural height of a node constrained to innerW
      const measureHeight = (el: Element): number => {
        // If the element already lives under the measuring container with correct width/fonts,
        // use its actual rendered height for best accuracy (images included).
        if ((el as HTMLElement).isConnected) {
          const rect = (el as HTMLElement).getBoundingClientRect()
          return Math.ceil(rect.height || (el as HTMLElement).scrollHeight || 1)
        }
        const tmp = el.cloneNode(true) as HTMLElement
        const wrap = document.createElement('div')
        wrap.style.position = 'absolute'
        wrap.style.visibility = 'hidden'
        wrap.style.width = `${innerW}px`
        wrap.style.boxSizing = 'border-box'
        wrap.style.fontSize = `${16 * fontScale}px`
        wrap.style.fontFamily = fontFamily
        wrap.className = 'mdx-content'
        // For images inside clone, copy current sizes if possible to avoid zero-height before load
        tmp.querySelectorAll('img').forEach((img) => {
          const i = img as HTMLImageElement
          i.loading = 'eager'
          i.decoding = 'sync' as any
          if (fixImg) {
            i.style.height = `${fixImgH}px`
            i.style.width = '100%'
            i.style.objectFit = 'cover'
          } else if (!i.getAttribute('width') && i.naturalWidth) {
            const targetW = innerW
            const h = Math.round((i.naturalHeight || 0) * (targetW / (i.naturalWidth || targetW)))
            if (h > 0) i.style.height = `${h}px`
            i.style.width = '100%'
            i.style.objectFit = 'contain'
          }
        })
        wrap.appendChild(tmp)
        sandbox.appendChild(wrap)
        const h = wrap.scrollHeight || tmp.scrollHeight || 1
        sandbox.removeChild(wrap)
        return h
      }

      // Split helpers for oversized blocks
      const splitParagraph = (p: HTMLParagraphElement, remaining: number): { first?: HTMLElement; rest?: HTMLElement } => {
        const text = p.textContent || ''
        const words = text.split(/(\s+)/) // keep spaces
        let acc = ''
        let idx = 0
        const mk = (t: string) => {
          const el = document.createElement('p')
          el.textContent = t
          return el
        }
        while (idx < words.length) {
          const next = acc + words[idx]
          const test = mk(next)
          if (measureHeight(test) <= remaining) {
            acc = next
            idx++
            continue
          }
          break
        }
        if (!acc) return { rest: p }
        const first = mk(acc)
        const restText = words.slice(idx).join('')
        const rest = restText ? mk(restText) : undefined
        return { first, rest }
      }

      const splitList = (list: HTMLUListElement | HTMLOListElement, remaining: number): { first?: HTMLElement; rest?: HTMLElement } => {
        const all = Array.from(list.children)
        const firstList = list.cloneNode(false) as HTMLElement
        const restList = list.cloneNode(false) as HTMLElement
        let usedH = 0
        let cut = 0
        for (; cut < all.length; cut++) {
          const li = all[cut].cloneNode(true) as HTMLElement
          firstList.appendChild(li)
          const h = measureHeight(firstList)
          if (h > remaining) {
            firstList.removeChild(li)
            break
          }
          usedH = h
        }
        if (!firstList.childNodes.length) return { rest: list }
        for (let i = cut; i < all.length; i++) restList.appendChild(all[i].cloneNode(true))
        return { first: firstList, rest: restList.childNodes.length ? restList : undefined }
      }

      const splitTable = (table: HTMLTableElement, remaining: number): { first?: HTMLElement; rest?: HTMLElement } => {
        const cloneBase = table.cloneNode(false) as HTMLTableElement
        const restBase = table.cloneNode(false) as HTMLTableElement
        const thead = table.tHead?.cloneNode(true) as HTMLElement | null
        if (thead) cloneBase.appendChild(thead)
        const body = document.createElement('tbody')
        cloneBase.appendChild(body)
        const rows = Array.from(table.tBodies[0]?.rows || [])
        let cut = 0
        for (; cut < rows.length; cut++) {
          const tr = rows[cut].cloneNode(true) as HTMLElement
          body.appendChild(tr)
          if (measureHeight(cloneBase) > remaining) {
            body.removeChild(tr)
            break
          }
        }
        if (!body.childNodes.length) return { rest: table }
        // build rest table with header as well
        if (thead) restBase.appendChild(thead.cloneNode(true))
        const body2 = document.createElement('tbody')
        restBase.appendChild(body2)
        for (let i = cut; i < rows.length; i++) body2.appendChild(rows[i].cloneNode(true))
        return { first: cloneBase, rest: body2.childNodes.length ? restBase : undefined }
      }

      // page probe container to evaluate cumulative height precisely under current styles
      const pageProbe = document.createElement('div')
      pageProbe.className = 'mdx-content'
      pageProbe.style.position = 'absolute'
      pageProbe.style.visibility = 'hidden'
      pageProbe.style.width = `${innerW}px`
      pageProbe.style.fontSize = `${16 * fontScale}px`
      sandbox.appendChild(pageProbe)

      // no wrapper here; CardXhs will wrap per page when rendering

      let buf = ''
      let used = 0
      const pages: string[] = []

      for (const node of blocks) {
        const tag = (node as HTMLElement).tagName?.toUpperCase?.() || ''
        const cls = (node as HTMLElement).className || ''
        const isBreak = tag === 'HR' || cls.includes('page-break') || (node as HTMLElement).getAttribute('data-page-break') != null
        if (isBreak) { pages.push(buf); buf = ''; used = 0; continue }

        const hasImage = (node as HTMLElement).tagName.toUpperCase() === 'IMG' || (node as HTMLElement).querySelector('img')
        // Fast path: try pack whole node using pageProbe (cumulative, accurate with fonts/images)
        pageProbe.innerHTML = buf + (node as HTMLElement).outerHTML
        const cumH = pageProbe.scrollHeight || 0
        if (cumH <= innerH) {
          buf += (node as HTMLElement).outerHTML
          used = cumH
          continue
        }

        // If current page has content, close it and start a new page
        if (used > 0) { pages.push(buf); buf = ''; used = 0 }

        // Try to place node alone on fresh page
        pageProbe.innerHTML = (node as HTMLElement).outerHTML
        if (pageProbe.scrollHeight <= innerH) {
          buf = (node as HTMLElement).outerHTML
          used = pageProbe.scrollHeight
          continue
        }

        // Try to split by smaller units
        // If block contains image(s), treat it as an atomic block: either put on new page or scale to fit
        if (hasImage) {
          if (used > 0) { pages.push(buf); buf=''; used=0 }
          const blockH = measureHeight(node)
          if (blockH <= innerH) {
            buf += (node as HTMLElement).outerHTML
            used = blockH
          } else {
            const scale = Math.max(0.1, innerH / blockH)
            const wrapper = document.createElement('div')
            wrapper.style.height = `${innerH}px`
            const box = document.createElement('div')
            box.style.transformOrigin = 'top left'
            box.style.transform = `scale(${scale})`
            box.appendChild(node.cloneNode(true))
            wrapper.appendChild(box)
            buf += wrapper.outerHTML
            used = innerH
          }
          pages.push(buf); buf=''; used=0
          continue
        }

        // Lists: pack list items one by one to avoid dropping items
        if (tag === 'UL' || tag === 'OL') {
          const list = node as HTMLElement
          const items = Array.from(list.children)
          let working = list.cloneNode(false) as HTMLElement
          for (const li of items) {
            const liOnly = (list.cloneNode(false) as HTMLElement)
            liOnly.appendChild(li.cloneNode(true))
            const itemH = measureHeight(liOnly)
            if (used + itemH <= innerH) {
              working.appendChild(li.cloneNode(true))
              used += itemH
            } else {
              if (used > 0 && working.childNodes.length) {
                buf += working.outerHTML
                pages.push(buf); buf=''; used=0
                working = list.cloneNode(false) as HTMLElement
              }
              // put the single item on a fresh page (scale if still too tall)
              if (itemH <= innerH) {
                working.appendChild(li.cloneNode(true))
                used = itemH
              } else {
                const scale = Math.max(0.1, innerH / itemH)
                const wrapper = document.createElement('div')
                wrapper.style.height = `${innerH}px`
                const box = document.createElement('div')
                box.style.transformOrigin = 'top left'
                box.style.transform = `scale(${scale})`
                box.appendChild(li.cloneNode(true))
                wrapper.appendChild(box)
                buf += wrapper.outerHTML
                pages.push(buf); buf=''; used=0
              }
            }
          }
          if (working.childNodes.length) {
            // place remaining on current page (it must fit since we started from fresh page)
            buf += working.outerHTML
            used = pageProbe.scrollHeight
          }
          continue
        }

        let cur: HTMLElement | undefined = node.cloneNode(true) as HTMLElement
        while (cur) {
          const remain = innerH - used
          if (remain <= 0) { pages.push(buf); buf=''; used=0; continue }
          let placed: HTMLElement | undefined
          let rest: HTMLElement | undefined
          const t = cur.tagName.toUpperCase()
          if (t === 'P') {
            const res = splitParagraph(cur as HTMLParagraphElement, remain)
            placed = res.first; rest = res.rest
          } else if (t === 'UL' || t === 'OL') {
            const res = splitList(cur as any, remain)
            placed = res.first; rest = res.rest
          } else if (t === 'TABLE') {
            const res = splitTable(cur as HTMLTableElement, remain)
            placed = res.first; rest = res.rest
          } else {
            // Default: scale to fit
            const ph = measureHeight(cur)
            const scale = Math.max(0.1, Math.min(1, remain / ph))
            const wrap = document.createElement('div')
            wrap.style.height = `${remain}px`
            const box = document.createElement('div')
            box.style.transformOrigin = 'top left'
            box.style.transform = `scale(${scale})`
            box.appendChild(cur)
            wrap.appendChild(box)
            placed = wrap
            rest = undefined
          }
          if (placed) {
            const placedHeight = Math.min(measureHeight(placed), innerH)
            // 若正好填满或超出剩余空间，则推入并换页；否则在本页继续累加
            if (placedHeight >= (innerH - used)) {
              buf += placed.outerHTML
              pages.push(buf)
              buf = ''
              used = 0
            } else {
              buf += placed.outerHTML
              used += placedHeight
            }
          }
          cur = rest
        }
      }
      if (buf) pages.push(buf)

      // cleanup
      sandbox.removeChild(pageProbe)

      // Debug print: log computed heights per page for verification in console
      try {
        // overall context
        // eslint-disable-next-line no-console
        console.log('[CardPreview] dims', {
          pageWidth,
          pageHeight,
          padding: pad,
          innerW,
          innerH,
          fontScale,
          pages: pages.length,
        })
        const debugProbe = document.createElement('div')
        debugProbe.className = 'mdx-content'
        debugProbe.style.position = 'absolute'
        debugProbe.style.visibility = 'hidden'
        debugProbe.style.width = `${innerW}px`
        debugProbe.style.fontSize = `${16 * fontScale}px`
        sandbox.appendChild(debugProbe)
        pages.forEach((htmlStr, idx) => {
          debugProbe.innerHTML = htmlStr
          const h = debugProbe.scrollHeight || 0
          // eslint-disable-next-line no-console
          console.log(`[CardPreview] page ${idx + 1}/${pages.length} height:`, h, 'innerH(target):', innerH)
        })
        sandbox.removeChild(debugProbe)
      } catch {}

      setPreviewHeight(pages.length * (pageHeight + pageGap))
      setPagesHtml(pages)
    }
    if (previewMode === 'web') buildWeb(); else buildPaginate()
  }, [html, mdxSource, debouncedMdx, baseWidth, canvasPadding, previewMode, pageWidth, pageHeight, pageGap, fontScale, fixImg, fixImgH])

  // no iframe height polling

  const onExport = useCallback(async () => {
    const extraCss = `.mdx-content{font-size:${16 * fontScale}px}` + (fixImg ? `\n.mdx-content img{height:${fixImgH}px;width:100%;object-fit:cover}` : '')
    const res = await fetch(`/api/card/screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html, css: (css ? css + "\n" : '') + extraCss, width: pageWidth, height: pageHeight, scale, format, padding: canvasPadding }),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `card-${pageWidth}x${pageHeight}@${scale}x.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }, [format, scale, html, css, canvasPadding, pageWidth, pageHeight, fontScale, fixImg, fixImgH])

  const onClientExport = useCallback(async () => {
    try {
      const root = previewRef.current
      const node = (root?.querySelector('.card') || root?.firstElementChild) as HTMLElement | null
      if (!node) return
      // Ideally wait for fonts, best-effort in main doc
      try { if ((document as any).fonts?.ready) { await (document as any).fonts.ready } } catch {}
      // eslint-disable-next-line import/no-unresolved
      const mod = await import('html-to-image')
      // Use device pixelRatio scaling; layout remains at fixed page size
      const blob = await mod.toBlob(node, { pixelRatio: scale, backgroundColor: '#fff' })
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `card-${pageWidth}x${pageHeight}@${scale}x.client.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('请先安装依赖: yarn add html-to-image')
    }
  }, [scale, pageWidth, pageHeight])

  const onExportAll = useCallback(async () => {
    try {
      const root = previewRef.current
      if (!root) return
      const cards = Array.from(root.querySelectorAll('.card')) as HTMLElement[]
      if (!cards.length) return
      // eslint-disable-next-line import/no-unresolved
      const mod = await import('html-to-image')
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i]
        const blob = await mod.toBlob(card, { pixelRatio: scale, backgroundColor: '#fff' })
        if (!blob) continue
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `page-${i + 1}@${scale}x.png`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      alert('导出失败，请确认已安装 html-to-image')
    }
  }, [scale])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Head>
        <link rel="stylesheet" href="/card/universal-card.css" />
      </Head>
      <div className="ui-toolbar">
        <div className="ui-toolbar-group" style={{ display: 'none' }}>
          <label>格式：<span className="ui-select-wrap"><select className="ui-select" value={format} onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')} style={{ marginLeft: 6 }}><option value="png">PNG</option><option value="jpeg">JPEG</option></select></span></label>
          <label>清晰度：<span className="ui-select-wrap"><select className="ui-select" value={scale} onChange={(e) => setScale(Number(e.target.value))} style={{ marginLeft: 6 }}><option value={1}>1x</option><option value={2}>2x</option><option value={3}>3x</option></select></span></label>
        </div>
        <div className="ui-toolbar-group" style={{ display: 'none' }}>
          <label>卡片宽度(px)：<input className="ui-input" type="number" value={widthInput} onChange={(e) => setWidthInput(e.target.value)} onBlur={() => {
            const n = Number(widthInput)
            if (!Number.isFinite(n)) { setWidthInput(String(previewContainerWidth)); return }
            const clamped = Math.max(200, Math.round(n))
            setPreviewContainerWidth(clamped)
            setWidthInput(String(clamped))
          }} style={{ width: 90, marginLeft: 6 }} /></label>
          <label className="ui-field">预览缩放：<input className="ui-slider" type="range" min={0.25} max={1} step={0.01} value={previewScale} onChange={(e) => setPreviewScale(Number(e.target.value))} /><span style={{ fontSize: 12 }}>{Math.round(previewScale * 100)}%</span></label>
          <label>长宽比：<span className="ui-select-wrap"><select className="ui-select" value={ratioPreset} onChange={(e)=> setRatioPreset(e.target.value as any)} style={{ marginLeft: 6 }}>
              <option value="xhs">小红书 3:4</option>
              <option value="square">1:1</option>
              <option value="story">9:16</option>
              <option value="land">3:2</option>
              <option value="custom">自定义</option>
            </select></span>
          </label>
          {ratioPreset === 'custom' && (
            <label>自定义比例（高/宽）：<input className="ui-input" type="number" step={0.01} value={customRatio} onChange={(e)=> setCustomRatio(Math.max(0.1, Number(e.target.value) || (4/3)))} style={{ width: 90, marginLeft: 6 }} /></label>
          )}
          {/* 页间距固定 30；圆角固定 20 */}
          <label>画布内边距：<input className="ui-input" type="number" value={canvasPadding} onChange={(e) => setCanvasPadding(Math.max(0, Math.min(48, Number(e.target.value) || 0)))} style={{ width: 70, marginLeft: 6 }} /></label>
        </div>
        <div className="ui-toolbar-group" style={{ display: 'none' }}>
          <label>背景：
            <span className="ui-select-wrap"><select className="ui-select" value={bgMode} onChange={(e)=> setBgMode(e.target.value as any)} style={{ marginLeft: 6 }}>
              <option value="default">默认渐变</option>
              <option value="solid">纯色</option>
              <option value="gradient">渐变</option>
              <option value="image">图片</option>
            </select></span>
          </label>
          {bgMode === 'solid' && (
            <label>颜色：<input className="ui-input" type="color" value={bgSolid} onChange={(e)=> setBgSolid(e.target.value)} style={{ width: 60, height: 32, padding: 0, marginLeft: 6 }}/></label>
          )}
          {bgMode === 'gradient' && (
            <label>模板：
              <span className="ui-select-wrap"><select className="ui-select" value={bgGradientKey} onChange={(e)=> setBgGradientKey(e.target.value)} style={{ marginLeft: 6 }}>
                <option value="blue">蓝色</option>
                <option value="lavender">淡紫</option>
                <option value="peach">蜜桃</option>
                <option value="mint">薄荷</option>
              </select></span>
            </label>
          )}
          {bgMode === 'image' && (
            <>
              <label>URL：<input className="ui-input" type="text" value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder="https://..." style={{ width: 220, marginLeft: 6 }} /></label>
              <label>适应：<span className="ui-select-wrap"><select className="ui-select" value={bgFit} onChange={(e) => setBgFit(e.target.value as 'cover' | 'contain')} style={{ marginLeft: 6 }}><option value="cover">填充裁剪</option><option value="contain">等比完整</option></select></span></label>
              <label className="ui-field">遮罩：<input className="ui-slider" type="range" min={0} max={1} step={0.01} value={bgMask} onChange={(e) => setBgMask(Number(e.target.value))} /><span style={{ fontSize: 12 }}>{Math.round(bgMask * 100)}%</span></label>
            </>
          )}
        </div>
        <div className="ui-toolbar-group" style={{ display: 'none' }}>
          <label>字体：
            <span className="ui-select-wrap"><select className="ui-select" value={fontFamily} onChange={(e)=> setFontFamily(e.target.value)} style={{ marginLeft: 6, minWidth: 180 }}>
              <option value={'system-ui, -apple-system, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", Segoe UI, Roboto, Arial'}>系统字体</option>
              <option value={'"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial'}>中文优先</option>
              <option value={'Georgia, "Times New Roman", serif'}>衬线 Serif</option>
              <option value={'ui-monospace, SFMono-Regular, Menlo, monospace'}>等宽 Monospace</option>
            </select></span>
          </label>
          <label className="ui-field">大小：<input className="ui-slider" type="range" min={0.8} max={1.4} step={0.01} value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} /><span style={{ fontSize: 12 }}>{Math.round(fontScale * 100)}%</span></label>
        </div>
        {/* toolbar 保留操作按钮，其它设置移至左侧手风琴 */}
        <div className="ui-toolbar-group">
          <button className="ui-btn ui-btn--primary" onClick={onExport}>导出当前页</button>
          <button className="ui-btn ui-btn--blue" onClick={onExportAll}>导出全部</button>
          <button className="ui-btn ui-btn--outline" onClick={onClientExport}>前端导出</button>
          <button className="ui-btn ui-btn--teal" onClick={() => {
            const inner = previewRef.current?.innerHTML || ''
            const htmlDoc = `<!doctype html><html><head><link rel=\"stylesheet\" href=\"/card/universal-card.css\" /></head><body>${inner}</body></html>`
            const blob = new Blob([htmlDoc], { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank', 'noopener,noreferrer')
            setTimeout(() => URL.revokeObjectURL(url), 10000)
          }}>新窗口预览</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 0, flex: 1 }}>
      <div style={{ padding: 12, borderRight: '1px solid #e5e7eb', overflow: 'auto' }}>
        {/* New left-side accordion for settings */}
        <div className="ui-accordion" style={{ marginBottom: 10 }}>
          <div className="ui-acc-item" aria-expanded={openBasic}>
            <div className="ui-acc-header" onClick={()=> setOpenBasic(!openBasic)}>
              <span>基础设置</span>
              <span className="ui-acc-arrow" />
            </div>
            {openBasic && (
              <div className="ui-acc-body">
                <label>卡片宽度(px)：<input className="ui-input" type="number" value={widthInput} onChange={(e) => setWidthInput(e.target.value)} onBlur={() => {
                  const n = Number(widthInput)
                  if (!Number.isFinite(n)) { setWidthInput(String(previewContainerWidth)); return }
                  const clamped = Math.max(200, Math.round(n))
                  setPreviewContainerWidth(clamped)
                  setWidthInput(String(clamped))
                }} style={{ width: 120, marginLeft: 6 }} /></label>
                <label className="ui-field">预览缩放：<input className="ui-slider" type="range" min={0.25} max={1} step={0.01} value={previewScale} onChange={(e) => setPreviewScale(Number(e.target.value))} /><span style={{ fontSize: 12 }}>{Math.round(previewScale * 100)}%</span></label>
                <label>长宽比：<span className="ui-select-wrap"><select className="ui-select" value={ratioPreset} onChange={(e)=> setRatioPreset(e.target.value as any)} style={{ marginLeft: 6 }}>
                  <option value="xhs">小红书 3:4</option>
                  <option value="square">1:1</option>
                  <option value="story">9:16</option>
                  <option value="land">3:2</option>
                  <option value="custom">自定义</option>
                </select></span></label>
                {ratioPreset === 'custom' && (
                  <label>自定义比例（高/宽）：<input className="ui-input" type="number" step={0.01} value={customRatio} onChange={(e)=> setCustomRatio(Math.max(0.1, Number(e.target.value) || (4/3)))} style={{ width: 120, marginLeft: 6 }} /></label>
                )}
                <label>画布内边距：<input className="ui-input" type="number" value={canvasPadding} onChange={(e) => setCanvasPadding(Math.max(0, Math.min(48, Number(e.target.value) || 0)))} style={{ width: 120, marginLeft: 6 }} /></label>
                <div style={{ fontSize: 12, color: '#64748b' }}>页间距固定为 30，圆角固定为 20。</div>
              </div>
            )}
          </div>

          <div className="ui-acc-item" aria-expanded={openBg}>
            <div className="ui-acc-header" onClick={()=> setOpenBg(!openBg)}>
              <span>背景设置</span>
              <span className="ui-acc-arrow" />
            </div>
            {openBg && (
              <div className="ui-acc-body">
                <label>模式：<span className="ui-select-wrap"><select className="ui-select" value={bgMode} onChange={(e)=> setBgMode(e.target.value as any)} style={{ marginLeft: 6 }}>
                  <option value="default">默认渐变</option>
                  <option value="solid">纯色</option>
                  <option value="gradient">渐变</option>
                  <option value="image">图片</option>
                </select></span></label>
                {bgMode === 'solid' && (
                  <label>颜色：<input className="ui-input" type="color" value={bgSolid} onChange={(e)=> setBgSolid(e.target.value)} style={{ width: 60, height: 32, padding: 0, marginLeft: 6 }}/></label>
                )}
                {bgMode === 'gradient' && (
                  <label>模板：<span className="ui-select-wrap"><select className="ui-select" value={bgGradientKey} onChange={(e)=> setBgGradientKey(e.target.value)} style={{ marginLeft: 6 }}>
                    <option value="blue">蓝色</option>
                    <option value="lavender">淡紫</option>
                    <option value="peach">蜜桃</option>
                    <option value="mint">薄荷</option>
                  </select></span></label>
                )}
                {bgMode === 'image' && (
                  <>
                    <label>URL：<input className="ui-input" type="text" value={bgUrl} onChange={(e) => setBgUrl(e.target.value)} placeholder="https://..." style={{ width: 220, marginLeft: 6 }} /></label>
                    <label>适应：<span className="ui-select-wrap"><select className="ui-select" value={bgFit} onChange={(e) => setBgFit(e.target.value as 'cover' | 'contain')} style={{ marginLeft: 6 }}><option value="cover">填充裁剪</option><option value="contain">等比完整</option></select></span></label>
                    <label className="ui-field">遮罩：<input className="ui-slider" type="range" min={0} max={1} step={0.01} value={bgMask} onChange={(e) => setBgMask(Number(e.target.value))} /><span style={{ fontSize: 12 }}>{Math.round(bgMask * 100)}%</span></label>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="ui-acc-item" aria-expanded={openFont}>
            <div className="ui-acc-header" onClick={()=> setOpenFont(!openFont)}>
              <span>字体设置</span>
              <span className="ui-acc-arrow" />
            </div>
            {openFont && (
              <div className="ui-acc-body">
                <label>字体：<span className="ui-select-wrap"><select className="ui-select" value={fontFamily} onChange={(e)=> setFontFamily(e.target.value)} style={{ marginLeft: 6, minWidth: 180 }}>
                  <option value={'system-ui, -apple-system, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", Segoe UI, Roboto, Arial'}>系统字体</option>
                  <option value={'"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Arial'}>中文优先</option>
                  <option value={'Georgia, "Times New Roman", serif'}>衬线 Serif</option>
                  <option value={'ui-monospace, SFMono-Regular, Menlo, monospace'}>等宽 Monospace</option>
                </select></span></label>
                <label className="ui-field">大小：<input className="ui-slider" type="range" min={0.8} max={1.4} step={0.01} value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} /><span style={{ fontSize: 12 }}>{Math.round(fontScale * 100)}%</span></label>
              </div>
            )}
          </div>
        </div>

        {/* Hidden legacy settings block kept for reference (disabled) */}
        <div style={{ display: 'none' }}>
          <label>
            格式：
            <select value={format} onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')} style={{ marginLeft: 6 }}>
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </label>
          <label>
            预览宽度(px)：
            <input
              type="number"
              value={previewContainerWidth}
              onChange={(e) => setPreviewContainerWidth(Math.max(200, Number(e.target.value) || 500))}
              style={{ width: 90, marginLeft: 6 }}
            />
          </label>
          <label>
            清晰度：
            <select value={scale} onChange={(e) => setScale(Number(e.target.value))} style={{ marginLeft: 6 }}>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={3}>3x</option>
            </select>
          </label>
          <label>
            页间距(px)：
            <input type="number" value={pageGap} onChange={(e) => setPageGap(Math.max(0, Number(e.target.value) || 0))} style={{ width: 80, marginLeft: 6 }} />
          </label>
          <label>
            圆角(px)：
            <input type="number" value={borderRadius} onChange={(e) => setBorderRadius(Math.max(0, Number(e.target.value) || 0))} style={{ width: 80, marginLeft: 6 }} />
          </label>
          {/* 页面尺寸由预览宽度与 3:4 比例自动确定 */}
          {/* 预览模式固定为分页预览 */}
          <label>
            预览缩放：
            <select value={previewScale} onChange={(e) => setPreviewScale(Number(e.target.value))} style={{ marginLeft: 6 }}>
              <option value={0.25}>25%</option>
              <option value={0.33}>33%</option>
              <option value={0.5}>50%</option>
              <option value={0.75}>75%</option>
              <option value={1}>100%</option>
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            字体大小：
            <input type="range" min={0.85} max={1.25} step={0.01} value={fontScale} onChange={(e) => setFontScale(Number(e.target.value))} />
            <span style={{ fontSize: 12 }}>{Math.round(fontScale * 100)}%</span>
          </label>
          <label>
            模板基准宽度：
            <input
              type="number"
              value={baseWidth}
              onChange={(e) => setBaseWidth(Math.max(1, Number(e.target.value) || 600))}
              style={{ width: 90, marginLeft: 6 }}
            />
          </label>
          <label>
            画布内边距：
            <input
              type="number"
              value={canvasPadding}
              onChange={(e) => setCanvasPadding(Math.max(0, Math.min(48, Number(e.target.value) || 0)))}
              style={{ width: 70, marginLeft: 6 }}
            />
          </label>
          <label>
            描边：
            <input type="checkbox" checked={showOutlines} onChange={(e) => setShowOutlines(e.target.checked)} style={{ marginLeft: 6 }} />
          </label>
          <label>
            网格：
            <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} style={{ marginLeft: 6 }} />
          </label>
          <label>
            检查器：
            <input type="checkbox" checked={showInspector} onChange={(e) => setShowInspector(e.target.checked)} style={{ marginLeft: 6 }} />
          </label>
          <button onClick={onExport} style={{ padding: '6px 10px', borderRadius: 8, background: '#111', color: '#fff' }}>导出当前页</button>
          <button onClick={onExportAll} style={{ padding: '6px 10px', borderRadius: 8, background: '#0ea5e9', color: '#fff' }}>导出全部</button>
          <button onClick={onClientExport} style={{ padding: '6px 10px', borderRadius: 8, background: '#2563eb', color: '#fff' }}>前端导出</button>
          <button onClick={() => {
            const inner = previewRef.current?.innerHTML || ''
            const htmlDoc = `<!doctype html><html><head><link rel=\"stylesheet\" href=\"/card/universal-card.css\" /></head><body>${inner}</body></html>`
            const blob = new Blob([htmlDoc], { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            window.open(url, '_blank', 'noopener,noreferrer')
            setTimeout(() => URL.revokeObjectURL(url), 10000)
          }} style={{ padding: '6px 10px', borderRadius: 8, background: '#10b981', color: '#fff' }}>新窗口预览</button>
        </div>
        <div style={{ display: 'grid', gridTemplateRows: 'auto', gap: 8, minHeight: 0 }}>
            <div className="ui-card" style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: '#475569', marginBottom: 6 }}>Markdown（自动预览）</div>
              <textarea id="md" className="ui-textarea"
                value={mdxSource}
                onChange={(e) => setMdxSource(e.target.value)}
              />
            </div>
          
        </div>
      </div>
      <div style={{ padding: 12, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        {(() => { const totalScale = (previewContainerWidth / pageWidth) * previewScale; const scaledWidth = Math.round(pageWidth * totalScale); return (
          <div style={{ width: previewContainerWidth, border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff', overflow: 'auto', position: 'relative', margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: scaledWidth }}>
              {fixImg && (
                <style>{`.mdx-content img{height:${fixImgH}px;width:100%;object-fit:cover;display:block}`}</style>
              )}
              <div ref={previewRef} style={{ transform: `scale(${totalScale})`, transformOrigin: 'top left', width: pageWidth, paddingBottom: pageGap, boxSizing: 'content-box' }}>
              {pagesHtml.map((htmlStr, idx) => (
                <div key={idx} style={{ margin: `0 auto ${pageGap}px auto`, position: 'relative' }}>
                  <CardXhs width={pageWidth} padding={canvasPadding} borderRadius={borderRadius} backgroundImageUrl={bgMode==='image'? bgUrl: ''} backgroundImageFit={bgFit} backgroundMaskOpacity={bgMask} style={cardBgStyle}>
                    <div className="mdx-content" style={{ fontSize: `${16 * fontScale}px`, fontFamily }} dangerouslySetInnerHTML={{ __html: htmlStr }} />
                  </CardXhs>
                  <div style={{ position: 'absolute', right: 8, bottom: 6, background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 12, padding: '2px 6px', borderRadius: 6 }}>
                    {idx + 1} / {pagesHtml.length}
                  </div>
                </div>
              ))}
              </div>
            </div>
            <div ref={measureRef} style={{ position: 'absolute', left: -99999, top: -99999, visibility: 'hidden' }} />
          </div>
        ) })()}
      </div>
    </div>
    </div>
  )
}
