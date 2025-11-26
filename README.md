## Star Wars API Application

This application integrates with the Star Wars API (SWAPI) to provide search functionality for Star Wars characters and movies. It includes:

- **Search**: Search for Star Wars characters and movies
- **Details**: View detailed information about characters (with their movies) and movies (with their cast)
- **Statistics**: Automated statistics computation showing search trends
- **Caching**: Redis-based caching with 1-hour TTL for API responses
- **Background Jobs**: BullMQ queue system for periodic statistics computation

### Architecture

- **Frontend**: React 19 with React Router v7, TailwindCSS v4
- **Backend**: Hono server with TypeScript
- **Database**: PostgreSQL 17 (query logging and statistics cache)
- **Cache**: Redis 7 (SWAPI response caching)
- **Queue**: BullMQ (background job processing)
- **ORM**: Drizzle ORM (type-safe database operations)

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/swapi_db"

# Redis
REDIS_URL="redis://localhost:6379"

# SWAPI Configuration
SWAPI_BASE_URL="https://swapi.dev/api"
SWAPI_TIMEOUT_MS="5000"

# Statistics
STATS_COMPUTATION_INTERVAL_MS="300000"  # 5 minutes
```

### Database Setup

#### Generate Migrations

After modifying the schema in `app/db/schema.server.ts`, generate migration files:

```bash
pnpm db:generate
```

#### Run Migrations

Apply pending migrations to your database:

```bash
pnpm db:migrate
```

#### Database Studio

Open Drizzle Studio to browse and edit your database:

```bash
pnpm db:studio
```

### Docker Deployment

The application is fully containerized with Docker Compose, including all dependencies.

#### Quick Start with Docker

1. **Build and start all services**:

```bash
docker-compose up --build
```

This will start:

- PostgreSQL 17 on port 5432
- Redis 7 on port 6379
- Application on port 4280

2. **Access the application**:

```
http://localhost:3000 or http://localhost:4280
```

3. **Stop all services**:

```bash
docker-compose down
```

4. **Stop and remove volumes** (clean slate):

```bash
docker-compose down -v
```

#### Docker Services

- **postgres**: PostgreSQL 17 Alpine with persistent volume
- **redis**: Redis 7 Alpine with AOF persistence
- **app**: Node.js 24 application with automatic migrations

All services include health checks and proper dependency management.

### API Endpoints

#### Statistics API

Get computed statistics about search queries:

```bash
GET /api/stats
```

**Response**:

```json
{
  "topQueries": [
    { "query": "luke", "count": 42 },
    { "query": "vader", "count": 38 },
    { "query": "leia", "count": 25 }
  ],
  "averageResponseTime": 245,
  "mostPopularHour": { "hour": 14, "count": 156 },
  "computedAt": "2025-11-25T14:30:00.000Z"
}
```

**Manual Refresh**:

```bash
GET /api/stats?refresh=true
```

### Development Workflow

#### Local Development (without Docker)

1. **Start PostgreSQL and Redis**:

```bash
# Using Docker for dependencies only
docker-compose up postgres redis -d
```

2. **Run migrations**:

```bash
pnpm db:migrate
```

3. **Start development server**:

```bash
pnpm dev
```

#### Production Build

```bash
pnpm build
pnpm start
```

### Statistics Computation

Statistics are automatically computed every 5 minutes (configurable via `STATS_COMPUTATION_INTERVAL_MS`) and include:

1. **Top 5 Search Queries**: Most frequently searched terms
2. **Average Response Time**: Average SWAPI API response time in milliseconds
3. **Most Popular Hour**: Hour of day with most searches (0-23)

The background job uses BullMQ and runs automatically when the server starts.

### Caching Strategy

- **SWAPI Responses**: 1 hour TTL in Redis
- **Statistics**: Cached in PostgreSQL, recomputed every 5 minutes
- **Cache Keys**: Namespaced by resource type (`swapi:search:`, `swapi:person:`, `swapi:movie:`)
