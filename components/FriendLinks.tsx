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
    avatar: '⚡',
  },
  {
    name: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    description: '实用优先的 CSS 框架',
    avatar: '🎨',
  },
  {
    name: 'TypeScript',
    url: 'https://www.typescriptlang.org',
    description: 'JavaScript 的超集，具有静态类型',
    avatar: '📘',
  },
  {
    name: 'MDX',
    url: 'https://mdxjs.com',
    description: '在 Markdown 中使用 JSX',
    avatar: '📝',
  },
  {
    name: 'Vercel',
    url: 'https://vercel.com',
    description: '现代 Web 应用部署平台',
    avatar: '▲',
  },
]

export default function FriendLinks() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h3 className="mb-4 flex items-center text-lg font-bold text-gray-900 dark:text-gray-100">
        <svg
          className="mr-2 h-5 w-5 text-pink-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        友情链接
      </h3>
      <div className="space-y-3">
        {friendLinks.map((link, index) => (
          <Link
            key={index}
            href={link.url}
            className="group block rounded-lg border border-gray-100 p-3 transition-all duration-200 hover:border-pink-200 hover:shadow-md dark:border-gray-700 dark:hover:border-pink-600"
          >
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-pink-100 to-purple-100 text-lg transition-transform group-hover:scale-110 dark:from-pink-900/30 dark:to-purple-900/30">
                {link.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-900 transition-colors group-hover:text-pink-600 dark:text-gray-100 dark:group-hover:text-pink-400">
                  {link.name}
                </h4>
                <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
                  {link.description}
                </p>
              </div>
              <svg
                className="h-4 w-4 flex-shrink-0 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-pink-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
