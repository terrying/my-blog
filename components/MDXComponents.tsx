import TOCInline from 'pliny/ui/TOCInline'
import Pre from 'pliny/ui/Pre'
import BlogNewsletterForm from 'pliny/ui/BlogNewsletterForm'
import type { MDXComponents } from 'mdx/types'
import Image from './Image'
import CustomLink from './Link'
import TableWrapper from './TableWrapper'
import Mermaid from './Mermaid'

export const components: MDXComponents = {
  Image,
  TOCInline,
  a: CustomLink as any,
  table: TableWrapper as any,
  BlogNewsletterForm,
  // Detect mermaid fences at the <pre><code class="language-mermaid"> level
  pre: (props: any) => {
    const child = props?.children as any
    const className: string | undefined = child?.props?.className
    const isMermaid = typeof className === 'string' && className.includes('language-mermaid')
    if (isMermaid) {
      const toText = (node: any): string => {
        if (node == null) return ''
        if (typeof node === 'string') return node
        if (Array.isArray(node)) return node.map(toText).join('')
        if (typeof node === 'object' && 'props' in node) return toText((node as any).props?.children)
        return String(node)
      }
      const chart = toText(child?.props?.children)
      return <Mermaid chart={chart} />
    }
    return <Pre as any {...props} />
  },
}
