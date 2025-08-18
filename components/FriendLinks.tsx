import Link from '@/components/Link'

interface FriendLink {
  name: string
  url: string
  description: string
  avatar?: string
}

const friendLinks: FriendLink[] = [
  {
    name: 'Next.js',
    url: 'https://nextjs.org',
    description: 'React 框架，用于构建现代 Web 应用',
    avatar: '⚡'
  },
  {
    name: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    description: '实用优先的 CSS 框架',
    avatar: '🎨'
  },
  {
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org',
    description: 'JavaScript 的超集，具有静态类型',
    avatar: '📘'
  },
  {
    name: 'MDX',
    url: 'https://mdxjs.com',
    description: '在 Markdown 中使用 JSX',
    avatar: '📝'
  },
  {
    name: 'Vercel',
    url: 'https://vercel.com',
    description: '现代 Web 应用部署平台',
    avatar: '▲'
  }
]

export default function FriendLinks() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <svg className="h-5 w-5 mr-2 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        友情链接
      </h3>
      <div className="space-y-3">
        {friendLinks.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            className="block p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-600 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                {link.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {link.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {link.description}
                </p>
              </div>
              <svg className="flex-shrink-0 h-4 w-4 text-gray-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}