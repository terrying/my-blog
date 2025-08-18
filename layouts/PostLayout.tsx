import { ReactNode } from 'react'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Authors } from 'contentlayer/generated'
import Comments from '@/components/Comments'
import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import TOC from '@/components/TOC'
import RelatedPosts from '@/components/RelatedPosts'
import siteMetadata from '@/data/siteMetadata'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'
import { allCoreContent, sortPosts } from 'pliny/utils/contentlayer'
import { allBlogs } from 'contentlayer/generated'

const editUrl = (path) => `${siteMetadata.siteRepo}/blob/main/data/${path}`
const discussUrl = (path) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(`${siteMetadata.siteUrl}/${path}`)}`

const postDateTemplate: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
}

interface LayoutProps {
  content: CoreContent<Blog>
  authorDetails: CoreContent<Authors>[]
  next?: { path: string; title: string }
  prev?: { path: string; title: string }
  children: ReactNode
}

export default function PostLayout({ content, authorDetails, next, prev, children }: LayoutProps) {
  const { filePath, path, slug, date, title, tags, toc } = content
  const basePath = path.split('/')[0]
  
  // 获取所有文章用于相关文章推荐
  const allPosts = allCoreContent(sortPosts(allBlogs))

  return (
    <>
      <ScrollTopAndComment />
      {/* 使用全屏宽度的12列网格布局 */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 max-w-screen-2xl mx-auto">
          {/* 左侧空白 - 1.5份 */}
          <div className="hidden lg:block lg:col-span-2"></div>
          
          {/* 主要内容区域 - 7份 */}
          <div className="lg:col-span-7">
            <article>
              {/* 文章头部 */}
              <header className="mb-8">
                <div className="text-center space-y-4">
                  <div>
                    <time 
                      dateTime={date}
                      className="text-base font-medium text-gray-500 dark:text-gray-400"
                    >
                      {new Date(date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}
                    </time>
                  </div>
                  <div>
                    <PageTitle>{title}</PageTitle>
                  </div>
                  
                  {/* 标签 */}
                  {tags && (
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  )}
                </div>
              </header>

              {/* 文章内容 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 lg:p-6 mb-6">
                <div className="prose max-w-none dark:prose-invert prose-p:my-3 prose-li:my-1 prose-ul:my-2 prose-ol:my-2">
                  {children}
                </div>
              </div>

              {/* 文章底部信息 */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <Link 
                    href={discussUrl(path)} 
                    rel="nofollow"
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    在 Twitter 上讨论
                  </Link>
                  <span>•</span>
                  <Link 
                    href={editUrl(filePath)}
                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    在 GitHub 上查看
                  </Link>
                </div>
              </div>

              {/* 评论区域 */}
              {siteMetadata.comments && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                  <div id="comment">
                    <Comments slug={slug} />
                  </div>
                </div>
              )}

              {/* 上一篇/下一篇导航 */}
              {(next || prev) && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {prev && prev.path && (
                      <div className="text-left">
                        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                          上一篇文章
                        </div>
                        <Link 
                          href={`/${prev.path}`}
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium line-clamp-2"
                        >
                          {prev.title}
                        </Link>
                      </div>
                    )}
                    {next && next.path && (
                      <div className="text-left md:text-right">
                        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                          下一篇文章
                        </div>
                        <Link 
                          href={`/${next.path}`}
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium line-clamp-2"
                        >
                          {next.title}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 返回按钮 */}
              <div className="text-center">
                <Link
                  href={`/${basePath}`}
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium group"
                  aria-label="Back to the blog"
                >
                  <svg className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  返回博客列表
                </Link>
              </div>
            </article>
          </div>

          {/* 右侧边栏 - 2.5份 */}
          <div className="lg:col-span-3">
            <div className="sticky top-8 space-y-6">
              {/* 文章目录 */}
              <TOC toc={toc} />
              
              {/* 相关文章推荐 */}
              <RelatedPosts 
                currentSlug={slug}
                currentTags={tags || []}
                allPosts={allPosts}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
