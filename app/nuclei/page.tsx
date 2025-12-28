import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import { genPageMetadata } from 'app/seo'
import ListLayout from '@/layouts/ListLayout'
import { filterNucleiPosts } from '@/lib/postFilters'

const POSTS_PER_PAGE = 5

export const metadata = genPageMetadata({ title: 'Nuclei 专栏' })

export default async function NucleiPage() {
  const posts = filterNucleiPosts(allCoreContent(sortPosts(allBlogs)))
  const pageNumber = 1
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const initialDisplayPosts = posts.slice(0, POSTS_PER_PAGE * pageNumber)
  const pagination = {
    currentPage: pageNumber,
    totalPages: totalPages,
  }

  return (
    <ListLayout
      posts={posts}
      initialDisplayPosts={initialDisplayPosts}
      pagination={pagination}
      title="Nuclei 专栏"
    />
  )
}
