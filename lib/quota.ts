import { redis } from "./redis"
import { db } from "./db"

const QUOTA_TTL_SECONDS = 60 * 60 * 24 // 24 hours

function quotaKey(userId: string) {
    return `quota:${userId}`
}

export async function getQuotaUsage(userId: string): Promise<{
    used: number
    limit: number
}> {
    const key = quotaKey(userId)
    //used to send request to Redis
    const cached = await redis.get(key)

    if (cached) {
        const parsed = JSON.parse(cached)
        return parsed
    }
    // Cache miss — fall back to PostgreSQL, then populate Redis
    const user = await db.user.findUnique({ where: { id: userId } })

    if (!user) {
        throw new Error("User not found")
    }

    const data = { used: user.quotaUsed, limit: user.quotaLimit }
    //repopulate cache
    await redis.set(key, JSON.stringify(data), "EX", QUOTA_TTL_SECONDS)

    return data
}

export async function incrementQuotaUsage(userId: string): Promise<void> {
    const key = quotaKey(userId) 

    const current = await getQuotaUsage(userId)
    //create new object with updated usage count
    const updated = {...current, used: current.used + 1 }

    await redis.set(key, JSON.stringify(updated), "EX", QUOTA_TTL_SECONDS)

    // Sync to PostgreSQL too — Redis is the fast read path,
    // PostgreSQL stays the source of truth
    await db.user.update({
        where: { id: userId },
        data: { quotaUsed: { increment: 1 } },
    })
}

export async function resetQuotaCache(userId: string): Promise<void> {
  await redis.del(quotaKey(userId))
}