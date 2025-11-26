import { sql } from "drizzle-orm"
import { getDb } from "~/db/client.server"
import { searchQueries, statisticsCache } from "~/db/schema.server"

export interface Statistics {
	topQueries: Array<{ query: string; count: number }>
	averageResponseTime: number
	mostPopularHour: { hour: number; count: number } | null
	computedAt: string
}

export async function computeStatistics(): Promise<Statistics> {
	const db = getDb()

	try {
		// 1. Top 5 most frequent search queries
		const topQueriesResult = await db
			.select({
				query: searchQueries.query,
				count: sql<number>`count(*)::int`,
			})
			.from(searchQueries)
			.groupBy(searchQueries.query)
			.orderBy(sql`count(*) desc`)
			.limit(5)

		// 2. Average response time
		const avgResponseResult = await db
			.select({
				avgTime: sql<number>`coalesce(avg(${searchQueries.responseTimeMs})::int, 0)`,
			})
			.from(searchQueries)

		const averageResponseTime = avgResponseResult[0]?.avgTime || 0

		// 3. Most popular hour of the day
		const mostPopularHourResult = await db
			.select({
				hour: sql<number>`extract(hour from ${searchQueries.createdAt})::int`,
				count: sql<number>`count(*)::int`,
			})
			.from(searchQueries)
			.groupBy(sql`extract(hour from ${searchQueries.createdAt})`)
			.orderBy(sql`count(*) desc`)
			.limit(1)

		const mostPopularHour = mostPopularHourResult[0] || null

		const statistics: Statistics = {
			topQueries: topQueriesResult,
			averageResponseTime,
			mostPopularHour,
			computedAt: new Date().toISOString(),
		}

		// Save to cache table
		await db.insert(statisticsCache).values({
			statisticsData: JSON.stringify(statistics),
		})

		// biome-ignore lint/suspicious/noConsole: We want this to be logged
		console.log("Statistics computed and cached successfully")

		return statistics
	} catch (error) {
		// biome-ignore lint/suspicious/noConsole: We want this to be logged
		console.error("Failed to compute statistics:", error)
		throw error
	}
}

export async function getLatestStatistics(): Promise<Statistics | null> {
	const db = getDb()

	try {
		const result = await db
			.select({
				statisticsData: statisticsCache.statisticsData,
			})
			.from(statisticsCache)
			.orderBy(sql`${statisticsCache.computedAt} desc`)
			.limit(1)

		if (!result[0]) {
			return null
		}

		return JSON.parse(result[0].statisticsData)
	} catch (error) {
		// biome-ignore lint/suspicious/noConsole: We want this to be logged
		console.error("Failed to get latest statistics:", error)
		return null
	}
}
