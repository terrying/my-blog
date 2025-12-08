'use client'

import { useCallback, useMemo, useState } from 'react'

const DEFAULT_WIDTH = 1080
const DEFAULT_HEIGHT = 1440

export default function CardStudio() {
  const [format, setFormat] = useState<'png' | 'jpeg'>('png')
  const [scale, setScale] = useState(2)
  const previewUrl = useMemo(() => '/card/ipo', [])

  const onExport = useCallback(async () => {
    const qs = new URLSearchParams({
      path: previewUrl,
      format,
      width: String(DEFAULT_WIDTH),
      height: String(DEFAULT_HEIGHT),
      scale: String(scale),
    })
    const res = await fetch(`/api/card/screenshot?${qs.toString()}`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ipo-card-${DEFAULT_WIDTH}x${DEFAULT_HEIGHT}@${scale}x.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }, [format, previewUrl, scale])

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
        <label>
          格式：
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
            style={{ marginLeft: 8 }}
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
        </label>
        <label>
          清晰度（DPR）：
          <select
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            style={{ marginLeft: 8 }}
          >
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={3}>3x</option>
          </select>
        </label>
        <button
          onClick={onExport}
          style={{ padding: '8px 12px', borderRadius: 8, background: '#111', color: '#fff' }}
        >
          导出图片
        </button>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <iframe
          src={previewUrl}
          width={DEFAULT_WIDTH}
          height={DEFAULT_HEIGHT}
          style={{ border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}
        />
      </div>
    </div>
  )
}
