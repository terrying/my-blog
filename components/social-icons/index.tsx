import {
  Mail,
  Github,
  Facebook,
  Youtube,
  Linkedin,
  Twitter,
  X,
  Mastodon,
  Threads,
  Instagram,
  Medium,
  Bluesky,
  Wechat,
} from './icons'

const components = {
  mail: Mail,
  github: Github,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  twitter: Twitter,
  x: X,
  mastodon: Mastodon,
  threads: Threads,
  instagram: Instagram,
  medium: Medium,
  bluesky: Bluesky,
  wechat: Wechat,
}

type SocialIconProps = {
  kind: keyof typeof components
  href: string | undefined
  size?: number
}

const SocialIcon = ({ kind, href, size = 8 }: SocialIconProps) => {
  if (
    !href ||
    (kind === 'mail' && !/^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(href))
  )
    return null

  const SocialSvg = components[kind]

  // 微信特殊处理 - 显示悬浮框
  if (kind === 'wechat') {
    return (
      <div className="group relative">
        <div className="cursor-pointer text-sm text-gray-500 transition hover:text-gray-600">
          <span className="sr-only">{kind}</span>
          <SocialSvg
            className={`hover:text-primary-500 dark:hover:text-primary-400 fill-current text-gray-700 dark:text-gray-200 h-${size} w-${size}`}
          />
        </div>
        {/* 悬浮框 */}
        <div
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 transform rounded-lg border border-gray-200 bg-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100"
          style={{ width: '180px' }}
        >
          <div className="p-3">
            <img
              src="/static/images/wechat.jpg"
              alt="微信二维码"
              className="mx-auto block h-auto w-full rounded object-contain"
              style={{ width: '150px', height: '150px' }}
            />
            <div className="mt-2 text-center text-xs text-gray-600">扫码添加微信</div>
          </div>
          <div className="absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-4 border-l-4 border-transparent border-t-white"></div>
        </div>
      </div>
    )
  }

  return (
    <a
      className="text-sm text-gray-500 transition hover:text-gray-600"
      target="_blank"
      rel="noopener noreferrer"
      href={href}
    >
      <span className="sr-only">{kind}</span>
      <SocialSvg
        className={`hover:text-primary-500 dark:hover:text-primary-400 fill-current text-gray-700 dark:text-gray-200 h-${size} w-${size}`}
      />
    </a>
  )
}

export default SocialIcon
