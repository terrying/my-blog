import { createClient } from 'redis'

let client: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
    })

    client.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    if (!client.isOpen) {
      await client.connect()
    }
  }

  return client
}

export async function disconnectRedis() {
  if (client && client.isOpen) {
    await client.disconnect()
    client = null
  }
}
