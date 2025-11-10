import type { ReactNode } from 'react'
import '../../public/card/universal-card.css'

export const runtime = 'nodejs'
export const dynamic = 'force-static'

export default function CardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ margin: 0, background: '#f5f5f5' }}>
      {children}
    </div>
  )
}
