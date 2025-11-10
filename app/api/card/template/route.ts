import fs from 'node:fs'
import path from 'node:path'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name = (searchParams.get('name') || 'ipo').replace(/[^a-zA-Z0-9_-]/g, '')
  const p = path.join(process.cwd(), 'data', 'card-templates', `${name}.html`)
  try {
    const html = fs.readFileSync(p, 'utf-8')
    return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  } catch (e) {
    return new Response('Not found', { status: 404 })
  }
}
