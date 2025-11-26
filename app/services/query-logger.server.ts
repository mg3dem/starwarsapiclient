import { getDb } from "~/db/client.server"
import { searchQueries } from "~/db/schema.server"

export async function logSearchQuery(
	query: string,
	searchType: "people" | "films",
	responseTimeMs: number,
	resultsCount: number
) {
	const db = getDb()

	try {
		await db.insert(searchQueries).values({
			query,
			searchType,
			responseTimeMs,
			resultsCount,
		})
	} catch (error) {
		console.error("Failed to log search query:", error)
		// Don't throw - logging failure shouldn't break user experience
	}
}
