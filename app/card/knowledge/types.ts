export type SectionColor =
  | 'blue'
  | 'purple'
  | 'green'
  | 'teal'
  | 'orange'
  | 'red'
  | 'gray'
  | 'black'

// Layout types
export type CardLayout = 'list' | 'poster' | 'grid'

export interface CardSection {
  id: string
  title: string
  content: string[]
  // Allow per-section override
  colorOverride?: SectionColor
}

export interface CardData {
  title: string
  subtitle?: string
  author?: string
  date?: string
  sections: CardSection[]
}

export type CardFont = 'kaiti' | 'sans' | 'serif'
export type CardTheme = 'grid' | 'dots' | 'plain' | 'gradient' | 'noise'
export type AspectRatio = '3/4' | '9/16' | '1/1' | '16/9'
export type ColorScheme = 'default' | 'ocean' | 'sunset' | 'forest' | 'lavender' | 'monochrome'

export interface CardStyle {
  font: CardFont
  theme: CardTheme
  aspectRatio: AspectRatio
  layout: CardLayout
  colorScheme: ColorScheme
}

export interface ThemeClasses {
  title: string
  subtitle: string
  sectionTitle: string
  sectionContainer: string
  content: string
}

export interface ThemeConfig {
  id: string
  name: string
  container: string
  backgroundPattern?: string
  fontFamily: string
  colors: {
    primary: string
    secondary: string
    text: string
    highlight: string
    accent: string
  }
  classes: ThemeClasses
}

// Schema driven card definition inspired by Feishu cards
export interface CardSchema {
  schema: string
  config?: {
    update_multi?: boolean
    [key: string]: unknown
  }
  header?: CardSchemaHeader
  body: CardSchemaBody
}

export interface CardSchemaHeader {
  title?: PlainTextContent
  subtitle?: PlainTextContent
  text_tag_list?: CardSchemaTextTag[]
  template?: string
  padding?: string
  element_id?: string
}

export interface PlainTextContent {
  tag: 'plain_text'
  content: string
}

export interface CardSchemaTextTag {
  tag: 'text_tag'
  text: PlainTextContent
  color?: string
  background_color?: string
}

export interface CardSchemaBody {
  direction?: 'vertical' | 'horizontal'
  horizontal_spacing?: string
  vertical_spacing?: string
  elements: CardSchemaElement[]
}

interface BaseSchemaElement {
  tag: string
  margin?: string
  padding?: string
  element_id?: string
}

export type CardSchemaElement =
  | ColumnSetElement
  | ColumnElement
  | MarkdownElement
  | TableElement
  | HrElement

export interface ColumnSetElement extends BaseSchemaElement {
  tag: 'column_set'
  flex_mode?: 'stretch' | 'compact'
  horizontal_spacing?: string
  vertical_spacing?: string
  horizontal_align?: 'left' | 'center' | 'right'
  direction?: 'vertical' | 'horizontal'
  columns: ColumnElement[]
}

export interface ColumnElement extends BaseSchemaElement {
  tag: 'column'
  width?: 'auto' | 'weighted'
  weight?: number
  background_style?: string
  direction?: 'vertical' | 'horizontal'
  horizontal_spacing?: string
  vertical_spacing?: string
  horizontal_align?: 'left' | 'center' | 'right'
  vertical_align?: 'top' | 'center' | 'bottom'
  elements: CardSchemaElement[]
}

export interface MarkdownElement extends BaseSchemaElement {
  tag: 'markdown'
  content: string
  text_align?: 'left' | 'center' | 'right'
  text_size?: 'small' | 'normal' | 'large'
  color?: string
}

export interface TableElement extends BaseSchemaElement {
  tag: 'table'
  columns: CardTableColumn[]
  rows: CardTableRow[]
  row_height?: 'low' | 'normal' | 'high'
  header_style?: {
    text_align?: 'left' | 'center' | 'right'
    background_style?: string
    bold?: boolean
    lines?: number
  }
  page_size?: number
  margin?: string
}

export interface CardTableColumn {
  data_type: 'text' | 'number' | string
  name: string
  display_name: string
  horizontal_align?: 'left' | 'center' | 'right'
  width?: 'auto' | 'stretch'
}

export interface CardTableRow {
  [key: string]: string
}

export interface HrElement extends BaseSchemaElement {
  tag: 'hr'
}
