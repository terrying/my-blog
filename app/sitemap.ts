import { MetadataRoute } from 'next'
import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl
  const basePath = process.env.BASE_PATH || ''
  const prefix = `${siteUrl}${basePath}`

  const urlFor = (path: string) => {
    if (!path) return `${prefix}/`
    return `${prefix}${path.startsWith('/') ? '' : '/'}${path}`
  }

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: urlFor(post.path),
      lastModified: post.lastmod || post.date,
    }))

  const routes = ['', 'blog', 'nuclei', 'projects', 'tags'].map((route) => ({
    url: urlFor(route),
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogRoutes]
}
