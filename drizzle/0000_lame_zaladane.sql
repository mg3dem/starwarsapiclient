CREATE TABLE "search_queries" (
	"id" serial PRIMARY KEY NOT NULL,
	"query" text NOT NULL,
	"search_type" text NOT NULL,
	"response_time_ms" integer NOT NULL,
	"results_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statistics_cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"statistics_data" text NOT NULL,
	"computed_at" timestamp DEFAULT now() NOT NULL
);
