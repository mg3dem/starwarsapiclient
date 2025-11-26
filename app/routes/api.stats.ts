import { computeStatistics, getLatestStatistics } from "~/services/statistics.server"
import type { Route } from "./+types/api.stats"

export async function loader({ request }: Route.LoaderArgs) {
	try {
		const url = new URL(request.url)
		const refresh = url.searchParams.get("refresh") === "true"

		if (refresh) {
			console.log("Manual statistics refresh requested")
			const statistics = await computeStatistics()
			return Response.json(statistics)
		}

		const statistics = await getLatestStatistics()

		if (!statistics) {
			console.log("No statistics cached, computing initial statistics")
			const newStatistics = await computeStatistics()
			return Response.json(newStatistics)
		}

		return Response.json(statistics)
	} catch (error) {
		console.error("Failed to load statistics:", error)
		return Response.json(
			{
				error: "Failed to load statistics",
			},
			{ status: 500 }
		)
	}
}
