export const NUCLEI_SLUG_PREFIX = 'nuclei-poc-'

export function isNucleiPost(
  post: { slug?: string; filePath?: string } | null | undefined
): boolean {
  if (!post) return false
  const slug = post.slug ?? ''
  const filePath = post.filePath ?? ''
  return slug.startsWith(NUCLEI_SLUG_PREFIX) || filePath.includes(NUCLEI_SLUG_PREFIX)
}

export function filterManualPosts<T extends { slug?: string; filePath?: string }>(posts: T[]): T[] {
  return posts.filter((p) => !isNucleiPost(p))
}

export function filterNucleiPosts<T extends { slug?: string; filePath?: string }>(posts: T[]): T[] {
  return posts.filter((p) => isNucleiPost(p))
}
