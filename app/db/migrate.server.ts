import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

async function runMigrations() {
  // biome-ignore lint/suspicious/noConsole
  console.log("Running database migrations...");

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  const db = drizzle(pool);

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    // biome-ignore lint/suspicious/noConsole
    console.log("Migrations completed successfully");
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
