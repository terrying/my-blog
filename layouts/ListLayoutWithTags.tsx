'use client'

import { usePathname } from 'next/navigation'
import { slug } from 'github-slugger'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import Image from '@/components/Image'
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
    'from-pink-400 to-rose-500'
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
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 max-w-screen-2xl mx-auto">
          {/* 左侧空白 - 1份 */}
          <div className="hidden lg:block lg:col-span-1"></div>
          
          {/* 左侧标签栏 - 2份 */}
          <div className="lg:col-span-2">
            <div className="sticky top-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                <div className="pt-6 pb-6 lg:hidden">
                  <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
                    {title}
                  </h1>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
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
                          <div className="inline-block px-3 py-1.5 text-sm font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 rounded-lg">
                            {`${t} (${tagCounts[t]})`}
                          </div>
                        ) : (
                          <Link
                            href={`/tags/${slug(t)}`}
                            className="inline-block px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
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
            <div className="hidden lg:block mb-8">
              <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
                {title}
              </h1>
            </div>
            
            <ul className="space-y-6">
              {displayPosts.map((post, index) => {
                const { path, date, title, summary, tags, images } = post
                return (
                  <li key={path}>
                    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-6">
                      <div className="space-y-4">
                        {/* 标题 - 独立一行 */}
                        <div>
                          <h2 className="text-xl lg:text-2xl leading-tight font-bold tracking-tight">
                            <Link
                              href={`/${path}`}
                              className="text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                              {title}
                            </Link>
                          </h2>
                        </div>

                        {/* 第二行：左侧图片，右侧内容 */}
                        <div className="flex gap-4">
                          {/* 左侧封面图片 - 正方形 */}
                          <div className="flex-shrink-0">
                            <Link href={`/${path}`} className="block w-24 h-24 lg:w-32 lg:h-32 relative group">
                              {images && images[0] ? (
                                <img
                                  src={images[0]}
                                  alt={title}
                                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${getDefaultCoverImage(index)} opacity-85 rounded-lg flex flex-col items-center justify-center text-white transition-all duration-300 group-hover:opacity-95`}>
                                  <svg className="h-6 w-6 lg:h-8 lg:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              )}
                            </Link>
                          </div>

                          {/* 右侧内容 */}
                          <div className="flex-1 min-w-0 space-y-3">
                            {/* 标签和时间 */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex flex-wrap gap-2">
                                {tags?.map((tag) => (
                                  <Tag key={tag} text={tag} />
                                ))}
                              </div>
                              <time 
                                dateTime={date}
                                className="text-sm text-gray-500 dark:text-gray-400 flex items-center whitespace-nowrap"
                                suppressHydrationWarning
                              >
                                <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}
                              </time>
                            </div>

                            {/* 摘要 */}
                            <div className="prose max-w-none text-gray-600 dark:text-gray-300 text-sm lg:text-base leading-relaxed">
                              {summary}
                            </div>

                            {/* 阅读更多 */}
                            <div className="flex items-center justify-between pt-2">
                              <Link
                                href={`/${path}`}
                                className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 group"
                                aria-label={`Read more: "${title}"`}
                              >
                                阅读更多
                                <svg className="ml-1.5 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
            
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
              </div>
            )}
          </div>

          {/* 右侧空白 - 2份 */}
          <div className="hidden lg:block lg:col-span-2"></div>
        </div>
      </div>
    </>
  )
}
