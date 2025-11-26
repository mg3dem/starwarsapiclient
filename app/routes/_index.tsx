import { useState } from "react"
import { Link } from "react-router"
import type { MetaFunction } from "react-router"
import { useQuery } from "@tanstack/react-query"

export const meta: MetaFunction = () => {
	return [
		{ title: "SWStarter - Search" },
		{ name: "description", content: "Search for Star Wars characters and movies" },
	]
}

type SearchType = "people" | "films"

interface SearchResult {
	id: string
	name: string
}

interface SearchResponse {
	results: SearchResult[]
	query: string
	type: SearchType
	error: string | null
}

async function searchAPI(query: string, type: SearchType): Promise<SearchResponse> {
	const params = new URLSearchParams({ q: query, type })
	const response = await fetch(`/api/search?${params}`)
	if (!response.ok) {
		throw new Error("Search failed")
	}
	return response.json()
}

export default function Index() {
	const [query, setQuery] = useState("")
	const [searchType, setSearchType] = useState<SearchType>("people")
	const [submittedQuery, setSubmittedQuery] = useState("")

	const { data, isLoading, error } = useQuery({
		queryKey: ["search", submittedQuery, searchType],
		queryFn: () => searchAPI(submittedQuery, searchType),
		enabled: submittedQuery.length > 0,
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		if (query.trim()) {
			setSubmittedQuery(query.trim())
		}
	}

	const results = data?.results || []
	const searchError = error ? "Search failed. Please try again." : data?.error

	return (
		<div className="min-h-screen bg-gray-50 font-montserrat">
			{/* Header */}
			<header className="h-[50px] bg-white shadow-[0_2px_0_0_var(--color-sw-border)]">
				<div className="flex h-full items-center justify-center">
					<h1 className="text-lg font-bold text-sw-green">SWStarter</h1>
				</div>
			</header>

			{/* Main Content */}
			<div className="mx-auto flex max-w-[1440px] gap-[30px] px-[208px] pt-[80px]">
				{/* Search Container */}
				<div className="h-[230px] w-[410px] rounded border border-sw-border bg-white shadow-[0_1px_2px_0_rgba(132,132,132,0.749)]">
					<form onSubmit={handleSubmit} className="p-[30px]">
						<h2 className="mb-6 text-sm font-semibold text-sw-gray-dark">What are you searching for?</h2>

						{/* Radio Buttons */}
						<div className="mb-6 flex gap-6">
							<label className="flex cursor-pointer items-center gap-2">
								<input
									type="radio"
									name="type"
									value="people"
									checked={searchType === "people"}
									onChange={(e) => setSearchType(e.target.value as SearchType)}
									className="peer sr-only"
								/>
								<div className="flex h-4 w-4 items-center justify-center rounded-full border border-sw-gray bg-white peer-checked:border-transparent peer-checked:bg-sw-blue">
									<div className="h-1 w-1 rounded-full bg-transparent peer-checked:bg-white" />
								</div>
								<span className="text-sm font-bold text-black">People</span>
							</label>

							<label className="flex cursor-pointer items-center gap-2">
								<input
									type="radio"
									name="type"
									value="films"
									checked={searchType === "films"}
									onChange={(e) => setSearchType(e.target.value as SearchType)}
									className="peer sr-only"
								/>
								<div className="flex h-4 w-4 items-center justify-center rounded-full border border-sw-gray bg-white peer-checked:border-transparent peer-checked:bg-sw-blue">
									<div className="h-1 w-1 rounded-full bg-transparent peer-checked:bg-white" />
								</div>
								<span className="text-sm font-bold text-black">Movies</span>
							</label>
						</div>

						{/* Search Input */}
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="mb-4 h-[40px] w-full rounded border border-sw-gray px-[10px] text-sm font-bold text-sw-gray-dark shadow-[inset_0_1px_3px_0_rgba(132,132,132,0.749)] focus:outline-none focus:ring-2 focus:ring-sw-blue"
							placeholder="e.g. Chewbacca, Yoda, Boba Fett"
							required
						/>

						{/* Search Button */}
						<button
							type="submit"
							disabled={isLoading || !query.trim()}
							className="h-[34px] w-full rounded-[20px] border border-sw-green bg-sw-green text-sm font-bold text-white hover:bg-sw-green-dark focus:outline-none focus:ring-2 focus:ring-sw-green focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? "SEARCHING..." : "SEARCH"}
						</button>
					</form>
				</div>

				{/* Results Container */}
				<div className="min-h-[582px] w-[582px] rounded border border-sw-border bg-white shadow-[0_1px_2px_0_rgba(132,132,132,0.749)]">
					<div className="p-[30px]">
						<h2 className="mb-6 text-lg font-bold text-black">Results</h2>

						{searchError && (
							<div className="mb-4 rounded bg-red-50 p-4 text-sm text-red-600">{searchError}</div>
						)}

						<div className="border-t border-sw-gray">
							{isLoading ? (
								<div className="flex min-h-[480px] items-center justify-center">
									<div className="text-center">
										<div className="mb-3 text-base font-semibold text-sw-gray-dark">Searching...</div>
										<div className="h-1.5 w-48 overflow-hidden rounded-full bg-gray-200">
											<div className="h-full w-full origin-left animate-[loading_1.5s_ease-in-out_infinite] bg-sw-blue" />
										</div>
									</div>
								</div>
							) : results.length > 0 ? (
								results.map((result) => (
									<div
										key={result.id}
										className="flex items-center justify-between border-b border-sw-gray py-[18px]"
									>
										<h3 className="text-base font-bold text-black">{result.name}</h3>
										<Link
											to={searchType === "films" ? `/movie/${result.id}` : `/person/${result.id}`}
											className="flex h-[34px] w-[134px] items-center justify-center rounded-[17px] bg-sw-green text-sm font-bold text-white hover:bg-sw-green-dark focus:outline-none focus:ring-2 focus:ring-sw-green focus:ring-offset-2"
										>
											SEE DETAILS
										</Link>
									</div>
								))
							) : submittedQuery ? (
								<div className="flex min-h-[480px] items-center justify-center text-center text-sm text-sw-gray-dark">
									There are zero matches.
									<br />
									Use the form to search for People or Movies.
								</div>
							) : (
								<div className="flex min-h-[480px] items-center justify-center text-sm text-sw-gray-dark">
									Enter a search term to get started.
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
