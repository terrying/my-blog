import Link from '@/components/Link'
import { slug } from 'github-slugger'
import tagData from 'app/tag-data.json'

export default function TagCloud() {
  const tagCounts = tagData as Record<string, number>
  const tagKeys = Object.keys(tagCounts)
  const sortedTags = tagKeys.sort((a, b) => tagCounts[b] - tagCounts[a])
  const maxCount = Math.max(...Object.values(tagCounts))
  const minCount = Math.min(...Object.values(tagCounts))

  const getTagSize = (count: number) => {
    const ratio = (count - minCount) / (maxCount - minCount)
    const minSize = 0.75
    const maxSize = 1.5
    return minSize + ratio * (maxSize - minSize)
  }

  const getTagColor = (index: number) => {
    const colors = [
      'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
      'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
      'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300',
      'text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300',
      'text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300',
      'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
        <svg className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        热门标签
      </h3>
      <div className="flex flex-wrap gap-2">
        {sortedTags.slice(0, 12).map((tag, index) => (
          <Link
            key={tag}
            href={`/tags/${slug(tag)}`}
            className={`inline-block px-3 py-1 rounded-full border border-gray-200 dark:border-gray-600 hover:border-transparent transition-all duration-200 ${getTagColor(index)} hover:shadow-md transform hover:scale-105`}
            style={{ fontSize: `${getTagSize(tagCounts[tag])}rem` }}
          >
            #{tag}
            <span className="ml-1 text-xs opacity-75">({tagCounts[tag]})</span>
          </Link>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <Link
          href="/tags"
          className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium flex items-center group"
        >
          查看所有标签
          <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}