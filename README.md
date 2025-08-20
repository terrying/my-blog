# T3rry 的多元世界

[![GitHub](https://img.shields.io/github/license/terrying/my-blog)](https://github.com/terrying/my-blog)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-blueviolet)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0.5-38B2AC)](https://tailwindcss.com/)

欢迎来到我的个人技术博客！这是一个基于 Next.js 和 Tailwind CSS 构建的现代化博客网站，专注于技术分享，特别是API安全、网络安全等领域的深度内容。

## 关于我

👋 我是 T3rry，一名专注于网络安全和软件开发的技术爱好者。在这里，我分享我的学习心得、技术见解和实践经验。

📧 联系我：t3rry1ng@gmail.com  
🔗 GitHub: [terrying](https://github.com/terrying)

## 博客特色

- 🎨 **现代化设计**：基于 Tailwind CSS 的响应式设计，支持明暗主题切换
- 📝 **Markdown 支持**：使用 MDX 格式，支持在 Markdown 中嵌入 React 组件
- 🔍 **全文搜索**：内置 Kbar 搜索功能，快速查找内容
- 🏷️ **标签分类**：完善的标签系统，方便内容分类和查找
- 💬 **评论系统**：集成 Giscus 评论系统，基于 GitHub Discussions
- 📊 **SEO 优化**：完整的 SEO 支持，包括 sitemap、RSS 等
- ⚡ **性能优化**：基于 Next.js 15，优秀的页面加载性能

## 内容主题

本博客主要涵盖以下技术领域：

- 🔐 **API 安全**：API安全框架、威胁分析、防护策略等
- 🛡️ **网络安全**：安全体系构建、资产管理、风险治理
- 💻 **软件开发**：前端技术、后端架构、开发工具
- 📚 **技术分享**：学习笔记、实战经验、最佳实践

## 技术栈

- **框架**: [Next.js 15](https://nextjs.org/) - React 全栈框架
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/) - 实用优先的 CSS 框架
- **内容管理**: [Contentlayer](https://contentlayer.dev/) - 类型安全的内容 SDK
- **部署**: [Vercel](https://vercel.com/) - 现代化部署平台
- **评论**: [Giscus](https://giscus.app/) - 基于 GitHub Discussions
- **分析**: [Umami](https://umami.is/) - 隐私友好的网站分析

## 快速开始

### 环境要求

- Node.js 18.17 或更高版本
- Yarn 3.6.1 或更高版本

### 本地开发

1. **克隆仓库**
   ```bash
   git clone https://github.com/terrying/my-blog.git
   cd my-blog
   ```

2. **安装依赖**
   ```bash
   yarn install
   ```

3. **启动开发服务器**
   ```bash
   yarn dev
   ```

4. **访问网站**
   
   打开 [http://localhost:3003](http://localhost:3003) 查看网站

### 构建和部署

```bash
# 构建项目
yarn build

# 预览构建结果
yarn serve

# 代码检查
yarn lint
```

## 项目结构

```
my-blog/
├── app/                 # Next.js App Router 页面
├── components/          # React 组件
├── data/               # 博客内容和配置
│   ├── blog/           # 博客文章 (MDX)
│   ├── authors/        # 作者信息
│   └── siteMetadata.js # 网站配置
├── layouts/            # 页面布局组件
├── public/             # 静态资源
└── css/               # 样式文件
```

## 自定义配置

### 网站信息

编辑 `data/siteMetadata.js` 文件来修改网站基本信息：

```javascript
const siteMetadata = {
  title: 'T3rry \'的多元世界',
  author: 'T3rry',
  description: 'T3rry 的多元世界',
  language: 'zh-cn',
  siteUrl: 'https://your-domain.com',
  email: 't3rry1ng@gmail.com',
  // ...更多配置
}
```

### 添加文章

1. 在 `data/blog/` 目录下创建新的 MDX 文件
2. 添加必要的 frontmatter：

```markdown
---
title: '文章标题'
date: '2024-01-01'
tags: ['标签1', '标签2']
draft: false
summary: '文章摘要'
---

文章内容...
```

## Quick Start Guide

1. Clone the repo

```bash
npx degit 'timlrx/tailwind-nextjs-starter-blog'
```

2. Personalize `siteMetadata.js` (site related information)
3. Modify the content security policy in `next.config.js` if you want to use
   other analytics provider or a commenting solution other than giscus.
4. Personalize `authors/default.md` (main author)
5. Modify `projectsData.ts`
6. Modify `headerNavLinks.ts` to customize navigation links
7. Add blog posts
8. Deploy on Vercel

## Installation

```bash
yarn
```

Please note, that if you are using Windows, you may need to run:

```bash
$env:PWD = $(Get-Location).Path
```

## Development

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Edit the layout in `app` or content in `data`. With live reloading, the pages auto-updates as you edit them.

## Extend / Customize

`data/siteMetadata.js` - contains most of the site related information which should be modified for a user's need.

`data/authors/default.md` - default author information (required). Additional authors can be added as files in `data/authors`.

`data/projectsData.js` - data used to generate styled card on the projects page.

`data/headerNavLinks.js` - navigation links.

`data/logo.svg` - replace with your own logo.

`data/blog` - replace with your own blog posts.

`public/static` - store assets such as images and favicons.

`tailwind.config.js` and `css/tailwind.css` - tailwind configuration and stylesheet which can be modified to change the overall look and feel of the site.

`css/prism.css` - controls the styles associated with the code blocks. Feel free to customize it and use your preferred prismjs theme e.g. [prism themes](https://github.com/PrismJS/prism-themes).

`contentlayer.config.ts` - configuration for Contentlayer, including definition of content sources and MDX plugins used. See [Contentlayer documentation](https://www.contentlayer.dev/docs/getting-started) for more information.

`components/MDXComponents.js` - pass your own JSX code or React component by specifying it over here. You can then use them directly in the `.mdx` or `.md` file. By default, a custom link, `next/image` component, table of contents component and Newsletter form are passed down. Note that the components should be default exported to avoid [existing issues with Next.js](https://github.com/vercel/next.js/issues/51593).

`layouts` - main templates used in pages:

- There are currently 3 post layouts available: `PostLayout`, `PostSimple` and `PostBanner`. `PostLayout` is the default 2 column layout with meta and author information. `PostSimple` is a simplified version of `PostLayout`, while `PostBanner` features a banner image.
- There are 2 blog listing layouts: `ListLayout`, the layout used in version 1 of the template with a search bar and `ListLayoutWithTags`, currently used in version 2, which omits the search bar but includes a sidebar with information on the tags.

`app` - pages to route to. Read the [Next.js documentation](https://nextjs.org/docs/app) for more information.

`next.config.js` - configuration related to Next.js. You need to adapt the Content Security Policy if you want to load scripts, images etc. from other domains.

## Post

Content is modelled using [Contentlayer](https://www.contentlayer.dev/), which allows you to define your own content schema and use it to generate typed content objects. See [Contentlayer documentation](https://www.contentlayer.dev/docs/getting-started) for more information.

### Frontmatter

Frontmatter follows [Hugo's standards](https://gohugo.io/content-management/front-matter/).

Please refer to `contentlayer.config.ts` for an up to date list of supported fields. The following fields are supported:

```
title (required)
date (required)
tags (optional)
lastmod (optional)
draft (optional)
summary (optional)
images (optional)
authors (optional list which should correspond to the file names in `data/authors`. Uses `default` if none is specified)
layout (optional list which should correspond to the file names in `data/layouts`)
canonicalUrl (optional, canonical url for the post for SEO)
```

Here's an example of a post's frontmatter:

```
---
title: 'Introducing Tailwind Nexjs Starter Blog'
date: '2021-01-12'
lastmod: '2021-01-18'
tags: ['next-js', 'tailwind', 'guide']
draft: false
summary: 'Looking for a performant, out of the box template, with all the best in web technology to support your blogging needs? Checkout the Tailwind Nextjs Starter Blog template.'
images: ['/static/images/canada/mountains.jpg', '/static/images/canada/toronto.jpg']
authors: ['default', 'sparrowhawk']
layout: PostLayout
canonicalUrl: https://tailwind-nextjs-starter-blog.vercel.app/blog/introducing-tailwind-nextjs-starter-blog
---
```

## Deploy

### GitHub Pages

A [`pages.yml`](.github/workflows/pages.yml) workflow is already provided. Simply select "GitHub Actions" in: `Settings > Pages > Build and deployment > Source`.

### Vercel

The easiest way to deploy the template is to deploy on [Vercel](https://vercel.com). Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### Netlify

[Netlify](https://www.netlify.com/)’s Next.js runtime configures enables key Next.js functionality on your website without the need for additional configurations. Netlify generates serverless functions that will handle Next.js functionalities such as server-side rendered (SSR) pages, incremental static regeneration (ISR), `next/images`, etc.

See [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/overview/#next-js-runtime) for suggested configuration values and more details.

### Static hosting services (GitHub Pages / S3 / Firebase etc.)

Run:

```sh
$ EXPORT=1 UNOPTIMIZED=1 yarn build
```

Then, deploy the generated `out` folder or run `npx serve out` it locally.

> [!IMPORTANT]
> If deploying with a URL base path, like https://example.org/myblog you need an extra `BASE_PATH` shell-var to the build command:
>
> ```sh
> $ EXPORT=1 UNOPTIMIZED=1 BASE_PATH=/myblog yarn build
> ```
>
> => In your code, `${process.env.BASE_PATH || ''}/robots.txt` will print `"/myblog/robots.txt"` in the `out` build (or only `/robots.txt` if `yarn dev`, ie: on localhost:3000)

> [!TIP]
> Alternatively to `UNOPTIMIZED=1`, to continue using `next/image`, you can use an alternative image optimization provider such as Imgix, Cloudinary or Akamai. See [image optimization documentation](https://nextjs.org/docs/app/building-your-application/deploying/static-exports#image-optimization) for more details.

Consider removing the following features that cannot be used in a static build:

1. Comment out `headers()` from `next.config.js`.
2. Remove `api` folder and components which call the server-side function such as the Newsletter component. Not technically required and the site will build successfully, but the APIs cannot be used as they are server-side functions.

## Frequently Asked Questions

- [How can I add a custom MDX component?](/faq/custom-mdx-component.md)
- [How can I customize the `kbar` search?](/faq/customize-kbar-search.md)
- [Deploy with docker](/faq/deploy-with-docker.md)

## Support

Using the template? Support this effort by giving a star on GitHub, sharing your own blog and giving a shoutout on Twitter or becoming a project [sponsor](https://github.com/sponsors/timlrx).

## Licence

[MIT](https://github.com/timlrx/tailwind-nextjs-starter-blog/blob/main/LICENSE) © [Timothy Lin](https://www.timlrx.com)
