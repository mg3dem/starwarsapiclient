import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { getServerEnv } from "~/env.server"
import * as schema from "./schema.server"

let pool: Pool
let db: ReturnType<typeof drizzle>

export function getDb() {
	if (!db) {
		const env = getServerEnv()
		pool = new Pool({ connectionString: env.DATABASE_URL })
		db = drizzle(pool, { schema })
	}
	return db
}

export function closeDb() {
	if (pool) {
		pool.end()
	}
}
