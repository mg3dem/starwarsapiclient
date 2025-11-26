import { defineConfig } from "drizzle-kit"
import * as dotenv from "dotenv"

// Load environment variables
dotenv.config()

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL environment variable is required")
}

export default defineConfig({
	schema: "./app/db/schema.server.ts",
	out: "./drizzle",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL,
	},
})
