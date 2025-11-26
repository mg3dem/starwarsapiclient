import { sql } from "drizzle-orm"
import { getDb } from "~/db/client.server"
import { getRedis } from "~/queue/redis.server"

export async function loader() {
	const checks: Record<string, boolean> = {
		database: false,
		redis: false,
	}

	// Check database
	try {
		const db = getDb()
		await db.execute(sql`SELECT 1`)
		checks.database = true
	} catch (error) {
		console.error("Health check - Database error:", error)
	}

	// Check Redis
	try {
		const redis = await getRedis()
		await redis.ping()
		checks.redis = true
	} catch (error) {
		console.error("Health check - Redis error:", error)
	}

	const healthy = checks.database && checks.redis

	return Response.json(
		{
			status: healthy ? "healthy" : "unhealthy",
			checks,
			timestamp: new Date().toISOString(),
		},
		{
			status: healthy ? 200 : 503,
		}
	)
}
