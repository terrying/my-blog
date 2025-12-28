'use client'

import React, { useCallback, useMemo, useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import { CardSchema, CardSchemaElement, ColumnElement, ColumnSetElement } from './types'
import { THEMES } from './theme-presets'
import { SchemaRenderer } from './SchemaRenderer'
import { SAMPLE_SCHEMA } from './schema-presets'

const generateElementId = () => `elem-${Math.random().toString(36).slice(2, 9)}`

const hasElementChildren = (
  element: CardSchemaElement
): element is CardSchemaElement & { elements: CardSchemaElement[] } => {
  return Array.isArray((element as CardSchemaElement & { elements?: CardSchemaElement[] }).elements)
}

const isColumnSetElement = (element: CardSchemaElement): element is ColumnSetElement => {
  return element.tag === 'column_set' && Array.isArray((element as ColumnSetElement).columns)
}

const assignElementIds = (element: CardSchemaElement): CardSchemaElement => {
  if (!element.element_id) {
    element.element_id = generateElementId()
  }
  if (isColumnSetElement(element)) {
    element.columns = element.columns.map((column) => {
      return assignElementIds(column as CardSchemaElement) as CardSchemaElement
    }) as ColumnElement[]
  }
  if (hasElementChildren(element)) {
    element.elements = element.elements.map(assignElementIds)
  }
  return element
}

const ensureSchemaHasIds = (schema: CardSchema): CardSchema => {
  const clone = JSON.parse(JSON.stringify(schema)) as CardSchema
  clone.body.elements = clone.body.elements.map(assignElementIds)
  return clone
}

const cloneWithIds = (snippet: CardSchemaElement) => {
  const copy = JSON.parse(JSON.stringify(snippet)) as CardSchemaElement
  return assignElementIds(copy)
}

const insertElementIntoPosition = (
  schema: CardSchema,
  targetId: string,
  element: CardSchemaElement,
  position: 'inside' | 'after'
): CardSchema => {
  const clone = JSON.parse(JSON.stringify(schema)) as CardSchema
  const inserted = insertRecursive(clone.body.elements, targetId, element, position)

  // If not inserted and we were trying to insert at root level (fallback)
  if (!inserted) {
    clone.body.elements.push(element)
  }
  return clone
}

const insertRecursive = (
  elements: CardSchemaElement[],
  targetId: string,
  elementToInsert: CardSchemaElement,
  position: 'inside' | 'after'
): boolean => {
  for (let i = 0; i < elements.length; i++) {
    const current = elements[i]

    // Check if current element is the target
    if (current.element_id === targetId) {
      if (position === 'after') {
        elements.splice(i + 1, 0, elementToInsert)
        return true
      } else if (position === 'inside') {
        // If it's a container, append to its children
        if (hasElementChildren(current)) {
          current.elements = [...(current.elements || []), elementToInsert]
          return true
        }
        if (isColumnSetElement(current)) {
          // Can't really insert "inside" a column set directly without specifying column,
          // but maybe we append a new column? For now, let's treat column set specially
          // or just fail if user drops on column set without hitting a column.
          // Actually, dragging to column set usually means adding a column, but here we are adding content.
          // Let's assume we can't drop content *directly* into column set unless it is a column.
          // If the dropped item is a column, we could add it.
          if (elementToInsert.tag === 'column') {
            current.columns = [...current.columns, elementToInsert as ColumnElement]
            return true
          }
        }
      }
    }

    // Recursion for children
    if (isColumnSetElement(current)) {
      for (const column of current.columns) {
        // Check column itself
        if (column.element_id === targetId) {
          if (position === 'inside') {
            column.elements = [...(column.elements || []), elementToInsert]
            return true
          }
          // 'after' a column means inserting a sibling column? Or inserting after the column in the column set?
          // The current logic for 'after' operates on the list `elements`.
          // Columns are in `current.columns`.
        }

        // Check inside column
        if (
          column.elements &&
          insertRecursive(column.elements, targetId, elementToInsert, position)
        ) {
          return true
        }
      }

      // If target was one of the columns and we wanted to insert AFTER it (sibling column)
      // We need to handle that in the loop over columns
      for (let j = 0; j < current.columns.length; j++) {
        if (current.columns[j].element_id === targetId && position === 'after') {
          // Only allowed if inserting a column
          if (elementToInsert.tag === 'column') {
            current.columns.splice(j + 1, 0, elementToInsert as ColumnElement)
            return true
          }
        }
      }
    }

    if (hasElementChildren(current)) {
      if (insertRecursive(current.elements, targetId, elementToInsert, position)) {
        return true
      }
    }
  }
  return false
}

const COMPONENT_CARDS = {
  container: [
    {
      id: 'column_set',
      label: '分栏容器',
      description: 'column_set + column 支持嵌套，可添加多个区域',
      type: 'column_set',
    },
    {
      id: 'column',
      label: '列容器',
      description: 'column 容器用于包裹其他组件',
      type: 'column',
    },
  ],
  content: [
    {
      id: 'stat-row',
      label: '统计卡片',
      description: '3 列 + 标题，可添加 markdown',
      type: 'stat-row',
    },
    {
      id: 'markdown',
      label: '标题 / 文本块',
      description: '支持 markdown + 标签',
      type: 'markdown',
    },
    { id: 'image', label: '图片', description: '单张图片展示，可设置背景', type: 'image' },
    { id: 'table', label: '数据表格', description: '行列展示 + header 配置', type: 'table' },
    { id: 'divider', label: '分割线', description: 'hr 分隔', type: 'divider' },
  ],
}

const COMPONENT_SNIPPETS: Record<string, CardSchemaElement> = {
  'stat-row': {
    tag: 'column_set',
    flex_mode: 'stretch',
    horizontal_spacing: '12px',
    columns: [
      {
        tag: 'column',
        width: 'weighted',
        background_style: 'blue-50',
        padding: '12px',
        vertical_spacing: '2px',
        horizontal_align: 'center',
        vertical_align: 'top',
        weight: 1,
        elements: [
          {
            tag: 'markdown',
            content: "## <font color='blue'>${value}</font>",
            text_align: 'center',
          },
          {
            tag: 'markdown',
            content: "<font color='grey'>示例项</font>",
            text_align: 'center',
          },
        ],
      },
      {
        tag: 'column',
        width: 'weighted',
        background_style: 'blue-50',
        padding: '12px',
        vertical_spacing: '2px',
        horizontal_align: 'center',
        vertical_align: 'top',
        weight: 1,
        elements: [
          {
            tag: 'markdown',
            content: "## <font color='blue'>${value}</font>",
            text_align: 'center',
          },
          {
            tag: 'markdown',
            content: "<font color='grey'>说明</font>",
            text_align: 'center',
          },
        ],
      },
      {
        tag: 'column',
        width: 'weighted',
        background_style: 'blue-50',
        padding: '12px',
        vertical_spacing: '2px',
        horizontal_align: 'center',
        vertical_align: 'top',
        weight: 1,
        elements: [
          {
            tag: 'markdown',
            content: "## <font color='blue'>${value}</font>",
            text_align: 'center',
          },
          {
            tag: 'markdown',
            content: "<font color='grey'>辅助说明</font>",
            text_align: 'center',
          },
        ],
      },
    ],
  },
  column_set: {
    tag: 'column_set',
    flex_mode: 'stretch',
    horizontal_spacing: '12px',
    columns: [
      {
        tag: 'column',
        width: 'weighted',
        background_style: 'blue-50',
        padding: '12px',
        vertical_spacing: '8px',
        horizontal_align: 'left',
        vertical_align: 'top',
        weight: 1,
        elements: [
          {
            tag: 'markdown',
            content: '**Column Set 示例**\n拖放其他内容到这里',
          },
        ],
      },
    ],
  },
  column: {
    tag: 'column',
    width: 'weighted',
    background_style: 'grey',
    padding: '12px',
    vertical_spacing: '8px',
    horizontal_align: 'left',
    vertical_align: 'top',
    weight: 1,
    elements: [
      {
        tag: 'markdown',
        content: '**列容器**\n用于包裹更多内容',
      },
    ],
  },
  markdown: {
    tag: 'markdown',
    content: '### 新文本块\n使用 markdown 语法增强可视化。',
    text_align: 'left',
  },
  table: {
    tag: 'table',
    columns: [
      {
        data_type: 'text',
        name: 'label',
        display_name: '指标',
        horizontal_align: 'left',
        width: 'auto',
      },
      {
        data_type: 'text',
        name: 'value',
        display_name: '数值',
        horizontal_align: 'right',
        width: 'auto',
      },
    ],
    rows: [
      { label: '收入', value: '1234' },
      { label: '净利', value: '98' },
    ],
    row_height: 'normal',
    header_style: {
      text_align: 'left',
      background_style: 'grey',
      bold: true,
      lines: 1,
    },
  },
  image: {
    tag: 'markdown',
    content:
      "<img src='https://images.unsplash.com/photo-1509391361-cf743b9e78c2?auto=format&fit=crop&w=640&q=60' alt='示意图' style='width:100%; border-radius:16px; max-height:200px; object-fit:cover;'/>",
    text_align: 'center',
  },
  divider: {
    tag: 'hr',
  },
}

export default function KnowledgeCardPage() {
  const initialSchema = useMemo(() => ensureSchemaHasIds(SAMPLE_SCHEMA), [])
  const [cardSchema, setCardSchema] = useState<CardSchema>(initialSchema)
  const [schemaInput, setSchemaInput] = useState(JSON.stringify(initialSchema, null, 2))
  const [parseError, setParseError] = useState<string>('')
  const [currentThemeId, setCurrentThemeId] = useState('default-blue')
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)

  const handleSchemaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setSchemaInput(newValue)
    try {
      const parsed = ensureSchemaHasIds(JSON.parse(newValue) as CardSchema)
      setCardSchema(parsed)
      setParseError('')
    } catch (error) {
      setParseError('JSON 解析失败，请检查语法')
    }
  }

  const handleResetSchema = () => {
    const fresh = ensureSchemaHasIds(SAMPLE_SCHEMA)
    setSchemaInput(JSON.stringify(fresh, null, 2))
    setCardSchema(fresh)
    setParseError('')
    setSelectedElementId(null)
    setDropTargetId(null)
  }

  const handleFormatSchema = () => {
    try {
      const parsed = ensureSchemaHasIds(JSON.parse(schemaInput) as CardSchema)
      const formatted = JSON.stringify(parsed, null, 2)
      setSchemaInput(formatted)
      setCardSchema(parsed)
      setParseError('')
      setSelectedElementId(null)
    } catch {
      setParseError('JSON 语法错误，无法格式化')
    }
  }

  const handleSelectElement = (elementId: string) => {
    setSelectedElementId(elementId)
    setDropTargetId(null)
  }

  const handleHoverContainer = (elementId: string | null) => {
    setDropTargetId(elementId)
  }

  const insertComponent = (
    componentId: string,
    targetId?: string,
    position: 'inside' | 'after' = 'after'
  ) => {
    const snippet = COMPONENT_SNIPPETS[componentId]
    if (!snippet) return
    const elementWithIds = cloneWithIds(snippet)
    setCardSchema((prev) => {
      const nextSchema = targetId
        ? insertElementIntoPosition(prev, targetId, elementWithIds, position)
        : {
            ...prev,
            body: {
              ...prev.body,
              elements: [...prev.body.elements, elementWithIds],
            },
          }
      setSchemaInput(JSON.stringify(nextSchema, null, 2))
      return nextSchema
    })
    setSelectedElementId(elementWithIds.element_id ?? null)
    setParseError('')
  }

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 3 })
      const link = document.createElement('a')
      link.download = `knowledge-card-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error(err)
      alert('导出失败')
    }
  }, [])

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const componentId = event.dataTransfer.getData('component')
    if (componentId) {
      // Default drop on canvas: append to root
      insertComponent(componentId)
      setDropTargetId(null)
    }
  }

  const handleRendererDrop = (
    event: React.DragEvent,
    targetId: string,
    position: 'inside' | 'after'
  ) => {
    const componentId = event.dataTransfer.getData('component')
    if (componentId) {
      insertComponent(componentId, targetId, position)
      setDropTargetId(null)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDragStart = (componentId: string, event: React.DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData('component', componentId)
    setIsDragging(true)
    setDropTargetId(null)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDropTargetId(null)
  }

  const CurrentTheme = THEMES[currentThemeId] ?? THEMES['default-blue']

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <div className="flex w-1/3 min-w-[360px] flex-col overflow-y-auto border-r border-gray-200 bg-white p-6">
        <div>
          <h1 className="mb-2 text-2xl font-bold">✨ 知识卡片设计器</h1>
          <p className="text-sm text-gray-500">
            参照飞书卡片的容器 + 元素组合，任何结构都可以通过标准 JSON
            构建，最后导出静态页面或图片。
          </p>
        </div>

        <div className="mt-6">
          <label htmlFor="theme-select" className="mb-2 block text-sm font-bold text-gray-700">
            主题（缓存样式）
          </label>
          <select
            id="theme-select"
            value={currentThemeId}
            onChange={(e) => setCurrentThemeId(e.target.value)}
            className="w-full rounded-lg border p-2"
          >
            {Object.values(THEMES).map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 space-y-4 text-xs">
          {[
            { title: '容器类组件', subtitle: '用于布局和嵌套', list: COMPONENT_CARDS.container },
            { title: '内容类组件', subtitle: '文本、图片、表格等', list: COMPONENT_CARDS.content },
          ].map((group) => (
            <div key={group.title}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-[0.2em] text-gray-400 uppercase">
                  {group.title}
                </p>
                <p className="text-xs text-gray-400">{group.subtitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {group.list.map((card) => (
                  <button
                    key={card.id}
                    draggable
                    onDragStart={(event) => handleDragStart(card.type, event)}
                    onDragEnd={handleDragEnd}
                    className="rounded-lg border border-dashed border-gray-200 bg-white p-2 text-left transition-colors hover:border-blue-300"
                  >
                    <p className="text-sm font-semibold text-gray-900">{card.label}</p>
                    <p className="leading-tight text-gray-500">{card.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-700">JSON Schema 编辑</p>
            <p className="text-xs text-gray-400">支持 column_set / markdown / table / hr 等标签</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFormatSchema}
              className="rounded border border-blue-200 px-3 py-1 text-xs text-blue-600 hover:border-blue-400"
            >
              格式化
            </button>
            <button
              onClick={handleResetSchema}
              className="rounded border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-gray-400"
            >
              重置示例
            </button>
          </div>
        </div>

        <textarea
          value={schemaInput}
          onChange={handleSchemaChange}
          className="mt-2 w-full flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-xs outline-none focus:ring-2 focus:ring-blue-500"
          spellCheck={false}
        />
        {parseError && <p className="mt-2 text-xs text-red-500">{parseError}</p>}

        <button
          onClick={handleDownload}
          className="mt-6 w-full rounded-lg bg-black py-3 font-bold text-white hover:bg-gray-900"
        >
          导出图片
        </button>
      </div>

      <div
        className="flex flex-1 items-center justify-center overflow-auto bg-gray-200/50 p-8"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div
          ref={cardRef}
          className={`relative flex w-full justify-center transition-all duration-200 ${
            isDragging ? 'rounded-3xl ring-4 ring-blue-400/50' : ''
          }`}
        >
          <SchemaRenderer
            schema={cardSchema}
            theme={CurrentTheme}
            selectedElementId={selectedElementId}
            hoveredElementId={dropTargetId}
            onSelectElement={(id) => handleSelectElement(id)}
            onHoverContainer={handleHoverContainer}
            onDropNode={handleRendererDrop}
          />
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-semibold text-blue-600">
              松开即可将组件插入预览
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
