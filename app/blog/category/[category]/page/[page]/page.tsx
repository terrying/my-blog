import ListLayout from '@/layouts/ListLayoutWithTags'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { notFound } from 'next/navigation'
import { filterManualPosts } from '@/lib/postFilters'
import { getBlogCategoryLabel } from '@/lib/blogCategories'

const POSTS_PER_PAGE = 5

export const generateStaticParams = async () => {
  // Pre-generate pages for the 4 fixed categories.
  // We can’t reliably know page counts at build without reading generated content here,
  // so we only return the first page params; Next will render others on demand if needed.
  return [
    { category: 'traffic-security', page: '1' },
    { category: 'app-vuln', page: '1' },
    { category: 'system-security', page: '1' },
    { category: 'compliance', page: '1' },
  ]
}

export default async function Page(props: { params: Promise<{ category: string; page: string }> }) {
  const params = await props.params
  const category = decodeURI(params.category)
  const pageNumber = parseInt(params.page as string)

  const allPosts = filterManualPosts(allCoreContent(sortPosts(allBlogs)))
  const posts = allPosts.filter(
    (p) => (p as unknown as { category?: string }).category === category
  )
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)

  if (pageNumber <= 0 || pageNumber > totalPages || isNaN(pageNumber) || totalPages === 0) {
    return notFound()
  }

  const initialDisplayPosts = posts.slice(
    POSTS_PER_PAGE * (pageNumber - 1),
    POSTS_PER_PAGE * pageNumber
  )
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
