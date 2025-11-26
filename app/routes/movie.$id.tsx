import { Link } from "react-router"
import type { MetaFunction } from "react-router"
import { extractIdFromUrl, getMovie, getPerson } from "~/services/swapi.server"
import { getServerEnv } from "~/env.server"
import type { Route } from "./+types/movie.$id"

export const meta: MetaFunction = () => {
	return [{ title: "Movie Details - SWStarter" }, { name: "description", content: "View Star Wars movie details" }]
}

interface Character {
	id: string
	name: string
}

interface Movie {
	id: string
	title: string
	openingCrawl: string
	characters: Character[]
}

export async function loader({ params }: Route.LoaderArgs) {
	const env = getServerEnv()
	const movieUrl = `${env.SWAPI_BASE_URL}/films/${params.id}/`

	try {
		// Fetch movie data
		const movieData = await getMovie(movieUrl)

		// Fetch all character details
		const characterPromises = movieData.characters.map((characterUrl) => getPerson(characterUrl))
		const charactersData = await Promise.all(characterPromises)

		// Map to UI format
		const movie: Movie = {
			id: params.id,
			title: movieData.title,
			openingCrawl: movieData.opening_crawl,
			characters: charactersData.map((character, index) => ({
				id: extractIdFromUrl(movieData.characters[index]),
				name: character.name,
			})),
		}

		return { movie }
	} catch (error) {
		// biome-ignore lint/suspicious/noConsole: We want this to be logged
		console.error("Failed to fetch movie:", error)
		throw new Response("Not Found", { status: 404 })
	}
}

export default function MovieDetails({ loaderData }: Route.ComponentProps) {
	const { movie } = loaderData

	return (
		<div className="min-h-screen bg-gray-50 font-montserrat">
			{/* Header */}
			<header className="h-[50px] bg-white shadow-[0_2px_0_0_var(--color-sw-border)]">
				<div className="flex h-full items-center justify-center">
					<h1 className="text-lg font-bold text-sw-green">SWStarter</h1>
				</div>
			</header>

			{/* Main Content */}
			<div className="mx-auto max-w-[1440px] px-[318px] pt-[80px]">
				{/* Details Card */}
				<div className="w-[804px] rounded border border-sw-border bg-white shadow-[0_1px_2px_0_rgba(132,132,132,0.749)]">
					<div className="p-[30px]">
						{/* Movie Title */}
						<h1 className="mb-[30px] text-lg font-bold text-black">{movie.title}</h1>

						{/* Two Column Layout */}
						<div className="grid grid-cols-2 gap-[100px]">
							{/* Opening Crawl Column */}
							<div>
								<h2 className="mb-[10px] text-base font-bold text-black">Opening Crawl</h2>
								<div className="border-t border-sw-gray pt-[6px]">
									<p className="whitespace-pre-line text-sm text-black">{movie.openingCrawl}</p>
								</div>
							</div>

							{/* Characters Column */}
							<div>
								<h2 className="mb-[10px] text-base font-bold text-black">Characters</h2>
								<div className="border-t border-sw-gray pt-[6px]">
									<div className="text-sm">
										{movie.characters.map((character, index) => (
											<span key={`${character.id}-${index}`}>
												<Link
													to={`/person/${character.id}`}
													className="text-sw-blue hover:underline focus:outline-none focus:underline"
												>
													{character.name}
												</Link>
												{index < movie.characters.length - 1 && (
													<span className="text-sw-gray-dark">, </span>
												)}
											</span>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Back to Search Button */}
						<div className="mt-[30px]">
							<Link
								to="/search"
								className="inline-flex h-[34px] w-[187px] items-center justify-center rounded-[17px] border border-sw-green-dark bg-sw-green-dark text-sm font-bold text-white hover:bg-[rgb(7,138,76)] focus:outline-none focus:ring-2 focus:ring-sw-green-dark focus:ring-offset-2"
							>
								BACK TO SEARCH
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
