import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Main from './Main'
import { filterManualPosts } from '@/lib/postFilters'

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs)
  // 首页只展示人工博客：过滤掉 nuclei 自动内容（nuclei-poc-*）
  const posts = filterManualPosts(allCoreContent(sortedPosts))
  return <Main posts={posts} />
}
