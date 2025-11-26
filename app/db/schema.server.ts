import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const searchQueries = pgTable("search_queries", {
	id: serial("id").primaryKey(),
	query: text("query").notNull(),
	searchType: text("search_type").notNull(), // 'people' | 'films'
	responseTimeMs: integer("response_time_ms").notNull(),
	resultsCount: integer("results_count").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const statisticsCache = pgTable("statistics_cache", {
	id: serial("id").primaryKey(),
	statisticsData: text("statistics_data").notNull(), // JSON string
	computedAt: timestamp("computed_at").defaultNow().notNull(),
})
