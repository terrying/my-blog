import Link from '@/components/Link'
import { formatDate } from 'pliny/utils/formatDate'
import siteMetadata from '@/data/siteMetadata'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

interface RecentPostsProps {
  posts: CoreContent<Blog>[]
}

export default function RecentPosts({ posts }: RecentPostsProps) {
  const recentPosts = posts.slice(0, 5)

  return (
    <div className="mb-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h3 className="mb-4 flex items-center text-lg font-bold text-gray-900 dark:text-gray-100">
        <svg
          className="mr-2 h-5 w-5 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        最新文章
      </h3>
      <div className="space-y-3">
        {recentPosts.map((post) => (
          <div
            key={post.slug}
            className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0 dark:border-gray-700"
          >
            <Link href={`/blog/${post.slug}`} className="group block">
              <h4 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                {post.title}
              </h4>
              <time dateTime={post.date} className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(post.date)
                  .toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })
                  .replace(/\//g, '-')}
              </time>
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-700">
        <Link
          href="/blog"
          className="group flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          查看全部文章
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
