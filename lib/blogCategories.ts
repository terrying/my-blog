export const BLOG_CATEGORIES = [
  { slug: 'traffic-security', label: '流量安全' },
  { slug: 'app-vuln', label: '应用漏洞' },
  { slug: 'system-security', label: '系统安全' },
  { slug: 'compliance', label: '合规安全' },
] as const

export type BlogCategorySlug = (typeof BLOG_CATEGORIES)[number]['slug']

export function getBlogCategoryLabel(slug: string): string {
  return BLOG_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug
}
