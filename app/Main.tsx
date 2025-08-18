import Link from '@/components/Link'
import Tag from '@/components/Tag'
import Image from '@/components/Image'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'
import WelcomeBanner from '@/components/WelcomeBanner'
import AuthorCard from '@/components/AuthorCard'
import RecentPosts from '@/components/RecentPosts'
import TagCloud from '@/components/TagCloud'
import BlogStats from '@/components/BlogStats'
import FriendLinks from '@/components/FriendLinks'

const MAX_DISPLAY = 5

// 生成默认封面图片
const getDefaultCoverImage = (index: number) => {
  const patterns = [
    'from-blue-400 to-purple-500',
    'from-green-400 to-blue-500',
    'from-purple-400 to-pink-500',
    'from-yellow-400 to-orange-500',
    'from-indigo-400 to-cyan-500',
    'from-pink-400 to-rose-500',
  ]
  return patterns[index % patterns.length]
}

export default function Home({ posts }) {
  return (
    <>
      {/* 欢迎横幅 - 突破容器限制，真正全宽 */}
      <div className="relative right-1/2 left-1/2 -mr-[50vw] mb-8 -ml-[50vw] w-screen">
        <WelcomeBanner />
      </div>

      {/* 主内容区域 - 1.5:5:2:1.5 布局 - 突破容器限制 */}
      <div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-6 lg:grid-cols-12 xl:gap-8">
          {/* 左侧空白 - 1.5份 */}
          <div className="hidden lg:col-span-2 lg:block"></div>

          {/* 文章列表 - 5份 */}
          <div className="lg:col-span-6">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <ul className="space-y-6">
                {!posts.length && 'No posts found.'}
                {posts.slice(0, MAX_DISPLAY).map((post, index) => {
                  const { slug, date, title, summary, tags, images } = post
                  return (
                    <li key={slug}>
                      <article className="overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg dark:bg-gray-800">
                        <div className="space-y-4">
                          {/* 标题 - 独立一行 */}
                          <div>
                            <h2 className="text-xl leading-tight font-bold tracking-tight lg:text-2xl">
                              <Link
                                href={`/blog/${slug}`}
                                className="hover:text-primary-600 dark:hover:text-primary-400 text-gray-900 transition-colors dark:text-gray-100"
                              >
                                {title}
                              </Link>
                            </h2>
                          </div>

                          {/* 第二行：左侧图片，右侧内容 */}
                          <div className="flex gap-4">
                            {/* 左侧封面图片 - 正方形 */}
                            <div className="flex-shrink-0">
                              <Link
                                href={`/blog/${slug}`}
                                className="group relative block h-24 w-24 lg:h-32 lg:w-32"
                              >
                                {images && images[0] ? (
                                  <Image
                                    src={images[0]}
                                    alt={title}
                                    width={128}
                                    height={128}
                                    className="h-full w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                ) : (
                                  <div
                                    className={`h-full w-full bg-gradient-to-br ${getDefaultCoverImage(index)} flex flex-col items-center justify-center rounded-lg text-white opacity-85 transition-all duration-300 group-hover:opacity-95`}
                                  >
                                    <svg
                                      className="h-6 w-6 lg:h-8 lg:w-8"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </Link>
                            </div>

                            {/* 右侧内容 */}
                            <div className="min-w-0 flex-1 space-y-3">
                              {/* 标签和时间 */}
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap gap-2">
                                  {tags.map((tag) => (
                                    <Tag key={tag} text={tag} />
                                  ))}
                                </div>
                                <time
                                  dateTime={date}
                                  className="flex items-center text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
                                >
                                  <svg
                                    className="mr-1.5 h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  {new Date(date)
                                    .toLocaleDateString('zh-CN', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                    })
                                    .replace(/\//g, '-')}
                                </time>
                              </div>

                              {/* 摘要 */}
                              <div className="prose max-w-none text-sm leading-relaxed text-gray-600 lg:text-base dark:text-gray-300">
                                {summary}
                              </div>

                              {/* 阅读更多 */}
                              <div className="flex items-center justify-between pt-2">
                                <Link
                                  href={`/blog/${slug}`}
                                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 group inline-flex items-center text-sm font-medium"
                                  aria-label={`Read more: "${title}"`}
                                >
                                  阅读更多
                                  <svg
                                    className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </Link>
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                  约 {Math.ceil((summary?.length || 0) / 5)} 分钟阅读
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    </li>
                  )
                })}
              </ul>
            </div>
            {posts.length > MAX_DISPLAY && (
              <div className="mt-8 flex justify-end text-base leading-6 font-medium">
                <Link
                  href="/blog"
                  className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label="All posts"
                >
                  查看全部文章 &rarr;
                </Link>
              </div>
            )}
            {siteMetadata.newsletter?.provider && (
              <div className="flex items-center justify-center pt-4">
                <NewsletterForm />
              </div>
            )}
          </div>

          {/* 右侧边栏 - 2份 */}
          <div className="space-y-6 lg:col-span-3">
            <AuthorCard />
            <RecentPosts posts={posts} />
            <TagCloud />
            <BlogStats posts={posts} />
            {/* <FriendLinks /> */}
          </div>

          {/* 右侧空白 - 1.5份 */}
          <div className="hidden lg:col-span-1 lg:block"></div>
        </div>
      </div>
    </>
  )
}
