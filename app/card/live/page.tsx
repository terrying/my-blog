export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CARD_WIDTH = 1080
const CARD_HEIGHT = 1440

function decodeBase64(input?: string | null): string {
  if (!input) return ''
  try { return Buffer.from(input, 'base64').toString('utf-8') } catch { return '' }
}

export default function LiveCardPage({
  searchParams,
}: {
  searchParams: { html?: string; css?: string; width?: string; height?: string }
}) {
  const html = decodeBase64(searchParams?.html)
  const css = decodeBase64(searchParams?.css)
  const width = Number(searchParams?.width || CARD_WIDTH)
  const height = Number(searchParams?.height || CARD_HEIGHT)

  return (
    <div
      className="shot-canvas"
      style={{
        width: `${width}px`,
        height: `${height}px`,
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
    >
      {/* user CSS for template */}
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}
      {/* template HTML */}
      <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
