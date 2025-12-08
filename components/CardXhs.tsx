import React from 'react'

type CardXhsProps = {
  width?: number
  padding?: number
  /** height = width * ratio (default 4/3) */
  ratio?: number
  borderRadius?: number
  className?: string
  style?: React.CSSProperties
  header?: React.ReactNode
  footer?: React.ReactNode
  /** Optional background image for the card */
  backgroundImageUrl?: string
  backgroundImageFit?: 'cover' | 'contain'
  /** 0..1 white mask over background to keep text readable */
  backgroundMaskOpacity?: number
  children?: React.ReactNode
}

/**
 * CardXhs - A simple Little-Red-Book style card shell used for preview/export.
 * - Default width: 600, ratio 3:4 (height = width * 4/3)
 * - Header/Footer are optional; content area clips overflow
 */
export function CardXhs({
  width = 600,
  padding = 16,
  ratio = 4 / 3,
  borderRadius = 24,
  className,
  style,
  header,
  footer,
  backgroundImageUrl,
  backgroundImageFit = 'cover',
  backgroundMaskOpacity = 0.9,
  children,
}: CardXhsProps) {
  const height = Math.round(width * ratio)
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  return (
    <div
      className={['card', className].filter(Boolean).join(' ')}
      style={{
        width,
        height,
        boxSizing: 'border-box',
        padding,
        // default background provided by .card class in CSS (gradient). Keep inline bg only when custom image is set.
        ...(backgroundImageUrl
          ? {
              backgroundImage: `linear-gradient(rgba(25,1,255,${backgroundMaskOpacity}), rgba(255,15,255,${backgroundMaskOpacity})), url(${backgroundImageUrl})`,
              backgroundSize: backgroundImageFit,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }
          : {}),
        borderRadius,
        overflow: 'hidden',
        margin: '0 auto',
        ...style,
      }}
    >
      <section className="card-header">
        <section className="card-title">{header}</section>
      </section>
      <section className="card-content">
        <div
          className="card-content-inner"
          style={{ width: innerWidth, height: innerHeight, overflow: 'hidden' }}
        >
          {children}
        </div>
      </section>
      <section className="card-footer">
        <section className="card-footer-inner">{footer}</section>
      </section>
    </div>
  )
}

export default CardXhs
