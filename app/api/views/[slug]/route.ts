import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getRedisClient } from '@/lib/redis'

const DEDUP_TTL = 86400 // 24 hours

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || '127.0.0.1'
}

function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 12)
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const redis = await getRedisClient()
    const views = await redis.get(`views:${slug}`)
    const viewCount = views ? parseInt(views, 10) : 0

    return NextResponse.json({ views: viewCount })
  } catch (error) {
    console.error('Error fetching views:', error)
    return NextResponse.json({ error: 'Failed to fetch views' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const redis = await getRedisClient()

    const ip = getClientIp(request)
    const ipHash = hashIp(ip)
    const dedupKey = `viewed:${ipHash}:${slug}`

    const alreadyViewed = await redis.exists(dedupKey)
    if (alreadyViewed) {
      const views = await redis.get(`views:${slug}`)
      return NextResponse.json({ views: views ? parseInt(views, 10) : 0 })
    }

    const views = await redis.incr(`views:${slug}`)
    await redis.set(dedupKey, '1', { EX: DEDUP_TTL })

    return NextResponse.json({ views })
  } catch (error) {
    console.error('Error incrementing views:', error)
    return NextResponse.json({ error: 'Failed to increment views' }, { status: 500 })
  }
}
