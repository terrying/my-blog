import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import ListLayout from '@/layouts/ListLayoutWithTags'
import { genPageMetadata } from 'app/seo'
import { notFound } from 'next/navigation'
import { filterManualPosts } from '@/lib/postFilters'
import { getBlogCategoryLabel } from '@/lib/blogCategories'

const POSTS_PER_PAGE = 5

export async function generateMetadata(props: { params: Promise<{ category: string }> }) {
  const params = await props.params
  const category = decodeURI(params.category)
  return genPageMetadata({ title: getBlogCategoryLabel(category) })
}

export default async function BlogCategoryPage(props: { params: Promise<{ category: string }> }) {
  const params = await props.params
  const category = decodeURI(params.category)

  const allPosts = filterManualPosts(allCoreContent(sortPosts(allBlogs)))
  const posts = allPosts.filter(
    (p) => (p as unknown as { category?: string }).category === category
  )
  const pageNumber = 1
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  if (totalPages === 0) return notFound()

  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE * pageNumber)
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  }

  return (
    <ListLayout
      posts={posts}
      sidebarPosts={allPosts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title={getBlogCategoryLabel(category)}
    />
  )
}
