import type { MetaFunction } from "react-router"
import { Link, useNavigation } from "react-router"
import { getServerEnv } from "~/env.server"
import { extractIdFromUrl, getMovie, getPerson } from "~/services/swapi.server"
import type { Route } from "./+types/person.$id"

export const meta: MetaFunction = () => {
	return [{ title: "Person Details - SWStarter" }, { name: "description", content: "View character details" }]
}

interface Movie {
	id: string
	title: string
}

interface Person {
	id: string
	name: string
	birthYear: string
	gender: string
	eyeColor: string
	hairColor: string
	height: string
	mass: string
	movies: Movie[]
}

export async function loader({ params }: Route.LoaderArgs) {
	const env = getServerEnv()
	const personUrl = `${env.SWAPI_BASE_URL}/people/${params.id}/`

	try {
		// Fetch person data
		const personData = await getPerson(personUrl)

		// Fetch all movie details
		const moviePromises = personData.films.map((filmUrl) => getMovie(filmUrl))
		const moviesData = await Promise.all(moviePromises)

		// Map to UI format
		const person: Person = {
			id: params.id,
			name: personData.name,
			birthYear: personData.birth_year,
			gender: personData.gender,
			eyeColor: personData.eye_color,
			hairColor: personData.hair_color,
			height: personData.height,
			mass: personData.mass,
			movies: moviesData.map((movie, index) => ({
				id: extractIdFromUrl(personData.films[index]),
				title: movie.title,
			})),
		}

		return { person }
	} catch (error) {
		console.error("Failed to fetch person:", error)
		throw new Response("Not Found", { status: 404 })
	}
}

export default function PersonDetails({ loaderData }: Route.ComponentProps) {
	const { person } = loaderData
	const navigation = useNavigation()
	const isNavigating = navigation.state === "loading"

	return (
		<div className="min-h-screen bg-gray-50 font-montserrat">
			{/* Header */}
			<header className="h-[50px] bg-white shadow-[0_2px_0_0_var(--color-sw-border)]">
				<div className="flex h-full items-center justify-center">
					<h1 className="font-bold text-lg text-sw-green">SWStarter</h1>
				</div>
			</header>

			{/* Main Content */}
			<div className="mx-auto max-w-[1440px] px-[318px] pt-[80px]">
				{/* Details Card */}
				<div className="w-[804px] rounded border border-sw-border bg-white shadow-[0_1px_2px_0_rgba(132,132,132,0.749)]">
					<div className="p-[30px]">
						{/* Person Name */}
						<h1 className="mb-[30px] font-bold text-black text-lg">{person.name}</h1>

						{/* Two Column Layout */}
						<div className="grid grid-cols-2 gap-[100px]">
							{/* Details Column */}
							<div>
								<h2 className="mb-[10px] font-bold text-base text-black">Details</h2>
								<div className="border-sw-gray border-t pt-[6px]">
									<div className="space-y-0 text-black text-sm">
										<p>Birth Year: {person.birthYear}</p>
										<p>Gender: {person.gender}</p>
										<p>Eye Color: {person.eyeColor}</p>
										<p>Hair Color: {person.hairColor}</p>
										<p>Height: {person.height}</p>
										<p>Mass: {person.mass}</p>
									</div>
								</div>
							</div>

							{/* Movies Column */}
							<div>
								<h2 className="mb-[10px] font-bold text-base text-black">Movies</h2>
								<div className="border-sw-gray border-t pt-[6px]">
									<div className="space-y-0">
										{person.movies.map((movie) => (
											<Link
												key={movie.id}
												to={`/movie/${movie.id}`}
												className="block text-sm text-sw-blue transition-opacity hover:underline focus:underline focus:outline-none disabled:opacity-50"
												style={{ opacity: isNavigating ? 0.5 : 1, pointerEvents: isNavigating ? "none" : "auto" }}
											>
												{movie.title}
											</Link>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Back to Search Button */}
						<div className="mt-[134px]">
							<Link
								to="/"
								className="inline-flex h-[34px] w-[187px] items-center justify-center rounded-[17px] border border-sw-green bg-sw-green font-bold text-sm text-white transition-opacity hover:bg-sw-green-dark focus:outline-none focus:ring-2 focus:ring-sw-green focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								style={{ opacity: isNavigating ? 0.5 : 1, pointerEvents: isNavigating ? "none" : "auto" }}
							>
								{isNavigating ? "LOADING..." : "BACK TO SEARCH"}
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
