'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import Image from '@/components/Image'
import ViewCounter from '@/components/ViewCounter'
import siteMetadata from '@/data/siteMetadata'
import tagData from 'app/tag-data.json'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog>[]
  pagination?: PaginationProps
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname()
  const segments = pathname.split('/')
  const lastSegment = segments[segments.length - 1]
  const basePath = pathname
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/page\/\d+\/?$/, '') // Remove any trailing /page
    .replace(/\/$/, '') // Remove trailing slash
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {!prevPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!prevPage}>
            Previous
          </button>
        )}
        {prevPage && (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            Previous
          </Link>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {!nextPage && (
          <button className="cursor-auto disabled:opacity-50" disabled={!nextPage}>
            Next
          </button>
        )}
        {nextPage && (
          <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
            Next
          </Link>
        )}
      </nav>
    </div>
  )
}

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

export default function ListLayoutWithTags({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
}: ListLayoutProps) {
  const pathname = usePathname()
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])

  const displayPosts = initialDisplayPosts.length > 0 ? initialDisplayPosts : posts

  return (
    <>
      {/* 使用全屏宽度的12列网格布局 */}
      <div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 gap-6 lg:grid-cols-12 xl:gap-8">
          {/* 左侧空白 - 1份 */}
          <div className="hidden lg:col-span-1 lg:block"></div>

          {/* 左侧标签栏 - 2份 */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <div className="mb-6 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="pt-6 pb-6 lg:hidden">
                  <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
                    {title}
                  </h1>
                </div>

                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">
                  {pathname.startsWith('/blog') ? (
                    <span className="text-primary-500">全部文章</span>
                  ) : (
                    <Link
                      href={`/blog`}
                      className="hover:text-primary-500 dark:hover:text-primary-500 text-gray-700 dark:text-gray-300"
                    >
                      全部文章
                    </Link>
                  )}
                </h3>

                <div className="space-y-2">
                  {sortedTags.map((t) => {
                    const isActive = decodeURI(pathname.split('/tags/')[1] || '') === slug(t)
                    return (
                      <div key={t}>
                        {isActive ? (
                          <div className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 inline-block rounded-lg px-3 py-1.5 text-sm font-medium">
                            {`${t} (${tagCounts[t]})`}
                          </div>
                        ) : (
                          <Link
                            href={`/tags/${slug(t)}`}
                            className="hover:text-primary-600 dark:hover:text-primary-400 inline-block rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50"
                            aria-label={`View posts tagged ${t}`}
                          >
                            {`${t} (${tagCounts[t]})`}
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 文章列表 - 7份 */}
          <div className="lg:col-span-7">
            <div className="mb-8 hidden lg:block">
              <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
                {title}
              </h1>
            </div>

            <ul className="space-y-6">
              {displayPosts.map((post, index) => {
                const { path, date, title, summary, tags, images, slug } = post
                return (
                  <li key={path}>
                    <article className="rounded-xl bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg dark:bg-gray-800">
                      <div className="space-y-4">
                        {/* 标题 - 独立一行 */}
                        <div>
                          <h2 className="text-xl leading-tight font-bold tracking-tight lg:text-2xl">
                            <Link
                              href={`/${path}`}
                              className="hover:text-primary-600 dark:hover:text-primary-400 text-gray-900 transition-colors dark:text-gray-100"
                            >
                              {title}
                            </Link>
                          </h2>
                        </div>

                        {/* 第二行：左侧图片，右侧内容 */}
                        <div className="flex gap-4">
                          {/* 左侧封面图片 - 16:9 比例 */}
                          <div className="flex-shrink-0">
                            <Link
                              href={`/${path}`}
                              className="group relative block h-20 w-36 lg:h-24 lg:w-44"
                            >
                              {images && images[0] ? (
                                <img
                                  src={images[0]}
                                  alt={title}
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
                                {tags?.map((tag) => <Tag key={tag} text={tag} />)}
                              </div>
                              <time
                                dateTime={date}
                                className="flex items-center text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
                                suppressHydrationWarning
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

                            {/* 阅读更多和统计信息 */}
                            <div className="flex items-center justify-between pt-2">
                              <Link
                                href={`/${path}`}
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
                              <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                                <ViewCounter slug={slug} className="text-xs" />
                                <span>约 {Math.ceil((summary?.length || 0) / 5)} 分钟阅读</span>
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

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                />
              </div>
            )}
          </div>

          {/* 右侧空白 - 2份 */}
          <div className="hidden lg:col-span-2 lg:block"></div>
        </div>
      </div>
    </>
  )
}
