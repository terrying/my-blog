import Link from '@/components/Link'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

interface RelatedPostsProps {
  currentSlug: string
  currentTags: string[]
  allPosts: CoreContent<Blog>[]
}

export default function RelatedPosts({ currentSlug, currentTags, allPosts }: RelatedPostsProps) {
  // 计算相关度分数
  const getRelatednessScore = (post: CoreContent<Blog>) => {
    if (post.slug === currentSlug) return -1 // 排除当前文章

    let score = 0
    const postTags = post.tags || []

    // 标签匹配度计算
    currentTags.forEach((tag) => {
      if (postTags.includes(tag)) {
        score += 1
      }
    })

    return score
  }

  // 获取相关文章
  const relatedPosts = allPosts
    .map((post) => ({
      ...post,
      score: getRelatednessScore(post),
    }))
    .filter((post) => post.score > 0) // 只要有至少一个共同标签
    .sort((a, b) => {
      // 先按相关度排序，再按日期排序
      if (b.score !== a.score) {
        return b.score - a.score
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    .slice(0, 5) // 最多显示5篇

  if (relatedPosts.length === 0) {
    return (
      <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
        <h3 className="mb-4 flex items-center text-lg font-bold text-gray-900 dark:text-gray-100">
          <svg
            className="mr-2 h-5 w-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 011 2v1m-4 0l2-2m0 0l2 2m-2-2v6m3 0a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          相关文章
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">暂无相关文章推荐</div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
      <h3 className="mb-4 flex items-center text-lg font-bold text-gray-900 dark:text-gray-100">
        <svg
          className="mr-2 h-5 w-5 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 011 2v1m-4 0l2-2m0 0l2 2m-2-2v6m3 0a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        相关文章
      </h3>
      <div className="space-y-4">
        {relatedPosts.map((post) => (
          <Link key={post.slug} href={`/${post.path}`} className="group block">
            <div className="hover:border-primary-200 dark:hover:border-primary-600 rounded-lg border border-gray-100 p-3 transition-all duration-200 hover:shadow-sm dark:border-gray-700">
              <h4 className="group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-2 line-clamp-2 text-sm font-medium text-gray-900 transition-colors dark:text-gray-100">
                {post.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <time dateTime={post.date}>
                  {new Date(post.date)
                    .toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })
                    .replace(/\//g, '-')}
                </time>
                {post.score > 1 && (
                  <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-full px-2 py-0.5">
                    {post.score} 个共同标签
                  </span>
                )}
              </div>
              {post.summary && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                  {post.summary}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-700">
        <Link
          href="/blog"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 group flex items-center text-sm font-medium"
        >
          查看更多文章
          <svg
            className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
