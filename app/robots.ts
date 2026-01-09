import { MetadataRoute } from 'next'
import siteMetadata from '@/data/siteMetadata'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  const basePath = process.env.BASE_PATH || ''
  const siteUrl = String(siteMetadata.siteUrl)
  const sitemapUrl = `${siteUrl}${basePath}/sitemap.xml`

  return {
    rules: [
      // Default: allow all crawlers
      { userAgent: '*', allow: '/' },

      // Common search engines
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'DuckDuckBot', allow: '/' },
      { userAgent: 'Applebot', allow: '/' },
      { userAgent: 'YandexBot', allow: '/' },
      { userAgent: 'Baiduspider', allow: '/' },

      // Common AI / LLM-related crawlers
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
    ],
    sitemap: sitemapUrl,
    host: siteUrl,
  }
}
