import { extractIdFromUrl, searchSWAPI } from "~/services/swapi.server"
import { logSearchQuery } from "~/services/query-logger.server"
import type { Route } from "./+types/api.search"

type SearchType = "people" | "films"

export async function loader({ request }: Route.LoaderArgs) {
	const url = new URL(request.url)
	const query = url.searchParams.get("q")
	const type = (url.searchParams.get("type") as SearchType) || "people"

	if (!query) {
		return Response.json({ results: [], query: "", type, error: null })
	}

	const startTime = Date.now()

	try {
		const searchResults = await searchSWAPI(query, type)
		const responseTime = Date.now() - startTime

		await logSearchQuery(query, type, responseTime, searchResults.count)

		const results = searchResults.results.map((item: any) => ({
			id: extractIdFromUrl(item.url),
			name: item.name || item.title,
		}))

		return Response.json({ results, query, type, error: null })
	} catch (error) {
		// biome-ignore lint/suspicious/noConsole
		console.error("SWAPI search failed:", error)
		return Response.json(
			{ results: [], query, type, error: "Search failed. Please try again." },
			{ status: 500 },
		)
	}
}
