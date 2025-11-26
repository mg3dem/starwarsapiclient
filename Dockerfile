# syntax=docker/dockerfile:1

# Base stage - Install pnpm
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Dependencies stage - Install dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod=false

# Builder stage - Build the application
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod=false
COPY . .
RUN pnpm run build

# Production dependencies stage - Install only prod dependencies
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

# Runtime stage - Create production image
FROM base AS runtime
ENV NODE_ENV=production

# Copy ALL node_modules (including dev deps needed for migrations)
COPY --from=deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/build ./build

# Copy necessary files for migrations and runtime
COPY --from=builder /app/app ./app
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts
COPY --from=builder /app/package.json ./package.json

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --home /home/nodejs --uid 1001 --gid 1001 nodejs && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 4280

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4280/healthz', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the application
CMD ["node", "./build/server/index.js"]
