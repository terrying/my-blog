import { sortPosts, allCoreContent } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'
import Main from './Main'

export default async function Page() {
  const sortedPosts = sortPosts(allBlogs)
  // 过滤掉 security-intel 分类的文章，避免 POC 分析文章淹没主页
  const filteredPosts = sortedPosts.filter(post => post.category !== 'security-intel')
  const posts = allCoreContent(filteredPosts)
  return <Main posts={posts} />
}
