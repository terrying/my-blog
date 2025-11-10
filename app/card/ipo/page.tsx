import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-static'

const CARD_WIDTH = 1080
const CARD_HEIGHT = 1440

function readTemplate(): string {
  const templatePath = path.join(process.cwd(), 'data', 'card-templates', 'ipo.html')
  return fs.readFileSync(templatePath, 'utf-8')
}

export default function IPOCardPage() {
  const html = readTemplate()
  return (
    <div
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        boxSizing: 'border-box',
        padding: '24px',
        background: '#fff',
        borderRadius: '24px',
        overflow: 'hidden',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
      }}
      className="shot-canvas"
    >
      <div
        style={{ width: '100%', height: '100%' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <style>{`
        :root { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        body { background: #f5f5f5; }
        /* 可选：限制模板内容最大宽度，避免溢出 */
        .shot-canvas > * { max-width: 100%; }
      `}</style>
    </div>
  )
}
