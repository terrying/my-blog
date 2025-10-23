'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import type { CommentsConfig } from 'pliny/comments'
import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)

  const isGiscus = siteMetadata.comments?.provider === 'giscus'
  let commentsConfig: CommentsConfig | undefined
  if (isGiscus) {
    const mappingRaw = (siteMetadata.comments as any)?.giscusConfig?.mapping
    const mapping: 'pathname' | 'url' | 'title' =
      mappingRaw === 'url' || mappingRaw === 'title' ? mappingRaw : 'pathname'
    const reactionsRaw = (siteMetadata.comments as any)?.giscusConfig?.reactions
    const reactions: '1' | '0' = reactionsRaw === '0' ? '0' : '1'
    const metadataRaw = (siteMetadata.comments as any)?.giscusConfig?.metadata
    const metadata: '1' | '0' = metadataRaw === '1' ? '1' : '0'
    commentsConfig = {
      provider: 'giscus',
      giscusConfig: {
        ...(siteMetadata.comments as any)?.giscusConfig,
        mapping,
        reactions,
        metadata,
      },
    }
  }

  if (!commentsConfig) {
    return null
  }
  return (
    <>
      {loadComments ? (
        <CommentsComponent commentsConfig={commentsConfig} slug={slug} />
      ) : (
        <button
          onClick={() => setLoadComments(true)}
          className="bg-primary-600 hover:bg-primary-700 w-full rounded-lg px-4 py-3 font-medium text-white transition-colors"
        >
          加载评论
        </button>
      )}
    </>
  )
}
