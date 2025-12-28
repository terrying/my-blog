'use client'

import React from 'react'
import {
  CardSchema,
  CardSchemaElement,
  CardSchemaHeader,
  ColumnElement,
  ColumnSetElement,
  MarkdownElement,
  TableElement,
  ThemeConfig,
} from './types'

interface SchemaRendererProps {
  schema: CardSchema
  theme: ThemeConfig
  selectedElementId?: string | null
  hoveredElementId?: string | null
  onSelectElement?: (elementId: string, element: CardSchemaElement) => void
  onHoverContainer?: (elementId: string | null) => void
  onDropNode?: (e: React.DragEvent, targetId: string, position: 'inside' | 'after') => void
}

const ALIGN_MAP: Record<string, React.CSSProperties['justifyContent']> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
}

const TEXT_ALIGN_MAP: Record<string, React.CSSProperties['textAlign']> = {
  left: 'left',
  center: 'center',
  right: 'right',
}

const VERTICAL_ALIGN_MAP: Record<string, React.CSSProperties['justifyContent']> = {
  top: 'flex-start',
  center: 'center',
  bottom: 'flex-end',
}

const BACKGROUND_PALETTE: Record<string, string> = {
  'blue-50': '#e0f2fe',
  grey: '#f8fafc',
  'bg-white': '#ffffff',
  'blue-100': '#dbeafe',
}

const TEXT_SIZE_MAP: Record<string, number> = {
  small: 14,
  normal: 16,
  large: 20,
}

const ROW_PADDING_MAP: Record<string, string> = {
  low: '8px 12px',
  normal: '12px 12px',
  high: '16px 12px',
}

const normalizeBackgroundColor = (value?: string) => {
  if (!value) return 'transparent'
  if (BACKGROUND_PALETTE[value]) return BACKGROUND_PALETTE[value]
  return value
}

const renderHeader = (header: CardSchemaHeader, theme: ThemeConfig) => {
  return (
    <div
      className="space-y-2"
      style={{
        padding: header.padding,
        borderBottom: header.padding ? '1px solid rgba(148, 163, 184, 0.4)' : undefined,
      }}
    >
      {header.title && (
        <div
          className="text-3xl leading-tight font-semibold"
          style={{ color: theme.colors.primary }}
          dangerouslySetInnerHTML={{ __html: header.title.content }}
        />
      )}
      {header.subtitle && (
        <div
          className="text-sm text-gray-500"
          dangerouslySetInnerHTML={{ __html: header.subtitle.content }}
        />
      )}
      {header.text_tag_list && (
        <div className="flex flex-wrap gap-2">
          {header.text_tag_list.map((tag, index) => (
            <span
              key={`tag-${index}`}
              className="inline-flex items-center rounded-full border px-3 py-1 text-[0.6rem] font-semibold tracking-[0.1em] uppercase"
              style={{
                color: tag.color ?? '#92400e',
                borderColor: tag.color ?? '#fde68a',
                backgroundColor: tag.background_color ?? 'rgba(248, 113, 113, 0.12)',
              }}
            >
              {tag.text.content}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export const SchemaRenderer: React.FC<SchemaRendererProps> = ({
  schema,
  theme,
  selectedElementId,
  hoveredElementId,
  onSelectElement,
  onHoverContainer,
  onDropNode,
}) => {
  const buildHighlightClass = (elementId?: string | null) => {
    if (!elementId) return ''
    const isSelected = selectedElementId === elementId
    const isHovered = hoveredElementId === elementId
    return [
      isSelected ? 'ring-2 ring-blue-400/80 rounded-2xl' : '',
      isHovered ? 'border-2 border-dashed border-blue-300/70 rounded-2xl' : '',
    ]
      .filter(Boolean)
      .join(' ')
  }

  const handleSelect = (
    elementId: string | undefined,
    element: CardSchemaElement,
    event: React.SyntheticEvent
  ) => {
    event.stopPropagation()
    if (!elementId) return
    onSelectElement?.(elementId, element)
  }

  const handleKeyActivate = (
    event: React.KeyboardEvent,
    elementId: string | undefined,
    element: CardSchemaElement
  ) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    handleSelect(elementId, element, event)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (
    e: React.DragEvent,
    elementId: string | undefined,
    type: 'container' | 'item'
  ) => {
    e.preventDefault()
    e.stopPropagation()
    if (!elementId) return
    // If dropping on a container, insert inside. If on an item, insert after.
    const position = type === 'container' ? 'inside' : 'after'
    onDropNode?.(e, elementId, position)
  }

  const renderMarkdown = (element: MarkdownElement, key: string) => {
    const elementId = element.element_id ?? key
    const textAlign = TEXT_ALIGN_MAP[element.text_align ?? 'left']
    const fontSize = TEXT_SIZE_MAP[element.text_size ?? 'normal']
    const html = element.content.replace(/\n/g, '<br/>')
    return (
      <div
        key={key}
        className={`w-full transition-all duration-150 ${buildHighlightClass(elementId)}`}
        onClick={(event) => handleSelect(elementId, element, event)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => handleKeyActivate(event, elementId, element)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, elementId, 'item')}
        style={{
          textAlign,
          color: element.color ?? '#0f172a',
          fontSize,
          margin: element.margin,
          padding: element.padding,
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  const renderTable = (element: TableElement, key: string) => {
    const elementId = element.element_id ?? key
    const headerStyle = element.header_style
    const headerBg = normalizeBackgroundColor(headerStyle?.background_style)
    const rowPadding = ROW_PADDING_MAP[element.row_height ?? 'normal']
    return (
      <div
        key={key}
        className={`w-full overflow-hidden rounded-3xl border border-gray-200 bg-white transition-all duration-150 ${buildHighlightClass(
          elementId
        )}`}
        onClick={(event) => handleSelect(elementId, element, event)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => handleKeyActivate(event, elementId, element)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, elementId, 'item')}
        style={{ margin: element.margin, padding: element.padding ?? '0px' }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {element.columns.map((col) => (
                <th
                  key={`th-${col.name}`}
                  className="text-xs font-semibold tracking-[0.2em] text-gray-600 uppercase"
                  style={{
                    textAlign: TEXT_ALIGN_MAP[col.horizontal_align ?? 'left'],
                    backgroundColor: headerBg,
                    padding: '10px 14px',
                    fontWeight: headerStyle?.bold ? 600 : 500,
                  }}
                >
                  {col.display_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {element.rows.map((row, rowIndex) => (
              <tr
                key={`row-${rowIndex}`}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              >
                {element.columns.map((col) => (
                  <td
                    key={`cell-${rowIndex}-${col.name}`}
                    className="text-sm text-gray-700"
                    style={{
                      textAlign: TEXT_ALIGN_MAP[col.horizontal_align ?? 'left'],
                      padding: rowPadding,
                    }}
                  >
                    {row[col.name]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderHr = (element: CardSchemaElement, key: string) => {
    const elementId = element.element_id ?? key
    return (
      <div
        key={key}
        className={`w-full border-t border-gray-200/60 transition-all duration-150 ${buildHighlightClass(elementId)}`}
        onClick={(event) => handleSelect(elementId, element, event)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => handleKeyActivate(event, elementId, element)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, elementId, 'item')}
        style={{ margin: element.margin }}
      />
    )
  }

  const renderColumn = (element: ColumnElement, key: string) => {
    const elementId = element.element_id ?? key
    const justifyContent = VERTICAL_ALIGN_MAP[element.vertical_align ?? 'top']
    const alignItems = ALIGN_MAP[element.horizontal_align ?? 'left']
    const direction = element.direction === 'horizontal' ? 'row' : 'column'
    const backgroundColor = normalizeBackgroundColor(element.background_style)
    const selfFlex = element.width === 'auto' ? '0 0 auto' : (element.weight ?? 1)
    const minWidth = element.width === 'auto' ? 140 : undefined
    return (
      <div
        key={key}
        className={`rounded-2xl shadow-sm transition-all duration-150 ${buildHighlightClass(elementId)}`}
        onClick={(event) => handleSelect(elementId, element, event)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => handleKeyActivate(event, elementId, element)}
        onMouseEnter={(e) => {
          e.stopPropagation()
          onHoverContainer?.(elementId)
        }}
        onMouseLeave={(e) => {
          e.stopPropagation()
          onHoverContainer?.(null)
        }}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, elementId, 'container')}
        style={{
          display: 'flex',
          flexDirection: direction,
          flex: selfFlex,
          minWidth,
          backgroundColor,
          padding: element.padding,
          margin: element.margin,
          gap: element.vertical_spacing,
          justifyContent,
          alignItems,
        }}
      >
        {element.elements.map((child, index) => renderElement(child, `${key}-child-${index}`))}
      </div>
    )
  }

  const renderColumnSet = (element: ColumnSetElement, key: string) => {
    const elementId = element.element_id ?? key
    const justifyContent = ALIGN_MAP[element.horizontal_align ?? 'left']
    const gap = element.horizontal_spacing ?? '12px'
    return (
      <div
        key={key}
        className={`flex flex-wrap items-stretch transition-all duration-150 ${buildHighlightClass(elementId)}`}
        onClick={(event) => handleSelect(elementId, element, event)}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => handleKeyActivate(event, elementId, element)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, elementId, 'container')}
        style={{
          justifyContent,
          gap,
          margin: element.margin,
          padding: element.padding,
        }}
      >
        {element.columns.map((column, index) => renderColumn(column, `${key}-col-${index}`))}
      </div>
    )
  }

  const renderElement = (element: CardSchemaElement, key: string): React.ReactNode => {
    switch (element.tag) {
      case 'column_set':
        return renderColumnSet(element as ColumnSetElement, key)
      case 'column':
        return renderColumn(element as ColumnElement, key)
      case 'markdown':
        return renderMarkdown(element as MarkdownElement, key)
      case 'table':
        return renderTable(element as TableElement, key)
      case 'hr':
        return renderHr(element, key)
      default:
        return null
    }
  }

  return (
    <div
      className={`w-full max-w-[900px] rounded-[32px] shadow-2xl ${theme.container}`}
      style={{
        fontFamily: theme.fontFamily,
        color: theme.colors.text,
        backgroundImage: theme.backgroundPattern ?? undefined,
      }}
    >
      <div className="w-full space-y-5" style={{ padding: '32px' }}>
        {schema.header && renderHeader(schema.header, theme)}
        <div
          className="flex flex-col"
          style={{
            gap: schema.body.vertical_spacing ?? '20px',
            flexDirection: schema.body.direction === 'horizontal' ? 'row' : 'column',
          }}
        >
          {schema.body.elements.map((element, index) => renderElement(element, `element-${index}`))}
        </div>
      </div>
    </div>
  )
}
