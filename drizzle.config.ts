import { defineConfig } from "drizzle-kit"
import { getServerEnv } from "~/env.server"

// Load environment variables
const env = getServerEnv()

if (!env.DATABASE_URL) {
	throw new Error("DATABASE_URL environment variable is required")
}

export default defineConfig({
	schema: "./app/db/schema.server.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: env.DATABASE_URL,
	},
})
