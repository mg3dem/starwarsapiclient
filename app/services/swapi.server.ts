import { z } from "zod/v4"
import { getServerEnv } from "~/env.server"
import { getRedis } from "~/queue/redis.server"

// Type definitions
const PersonSchema = z.object({
	name: z.string(),
	birth_year: z.string(),
	gender: z.string(),
	eye_color: z.string(),
	hair_color: z.string(),
	height: z.string(),
	mass: z.string(),
	films: z.array(z.string().url()),
})

const MovieSchema = z.object({
	title: z.string(),
	opening_crawl: z.string(),
	characters: z.array(z.string().url()),
})

const SearchResultSchema = z.object({
	count: z.number(),
	results: z.array(z.any()),
})

export type SWAPIPerson = z.infer<typeof PersonSchema>
export type SWAPIMovie = z.infer<typeof MovieSchema>

const CACHE_TTL = 3600

async function getCached<T>(key: string): Promise<T | null> {
	try {
		const redis = await getRedis()
		const cached = await redis.get(key)
		return cached ? JSON.parse(cached) : null
	} catch (error) {
		// biome-ignore lint/suspicious/noConsole
		console.error("Redis get error:", error)
		return null
	}
}

async function setCache<T>(key: string, value: T, ttl = CACHE_TTL): Promise<void> {
	try {
		const redis = await getRedis()
		await redis.setEx(key, ttl, JSON.stringify(value))
	} catch (error) {
		// biome-ignore lint/suspicious/noConsole
		console.error("Redis set error:", error)
	}
}

export async function searchSWAPI(query: string, type: "people" | "films") {
	const cacheKey = `swapi:search:${type}:${query}`

	const cached = await getCached<any>(cacheKey)
	if (cached) {
		// biome-ignore lint/suspicious/noConsole
		console.log(`Cache hit for search: ${query}`)
		return cached
	}

	const env = getServerEnv()
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), env.SWAPI_TIMEOUT_MS)

	try {
		const url = `${env.SWAPI_BASE_URL}/${type}/?search=${encodeURIComponent(query)}`
		const response = await fetch(url, { signal: controller.signal })

		if (!response.ok) {
			throw new Error(`SWAPI error: ${response.status}`)
		}

		const data = await response.json()
		const validated = SearchResultSchema.parse(data)

		await setCache(cacheKey, validated)

		return validated
	} catch (error) {
		if (error.name === "AbortError") {
			throw new Error("SWAPI request timeout")
		}
		throw error
	} finally {
		clearTimeout(timeoutId)
	}
}

export async function getPerson(url: string): Promise<SWAPIPerson> {
	const cacheKey = `swapi:person:${url}`

	const cached = await getCached<SWAPIPerson>(cacheKey)
	if (cached) {
		return cached
	}

	const response = await fetch(url)
	if (!response.ok) throw new Error(`Failed to fetch person: ${response.status}`)
	const data = await response.json()
	const validated = PersonSchema.parse(data)

	await setCache(cacheKey, validated)

	return validated
}

export async function getMovie(url: string): Promise<SWAPIMovie> {
	const cacheKey = `swapi:movie:${url}`

	const cached = await getCached<SWAPIMovie>(cacheKey)
	if (cached) {
		return cached
	}

	const response = await fetch(url)
	if (!response.ok) throw new Error(`Failed to fetch movie: ${response.status}`)
	const data = await response.json()
	const validated = MovieSchema.parse(data)

	await setCache(cacheKey, validated)

	return validated
}

export function extractIdFromUrl(url: string): string {
	const match = url.match(/\/(\d+)\/?$/)
	return match?.[1] || "0"
}
