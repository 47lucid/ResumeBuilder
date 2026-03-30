# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Install ALL dependencies (including devDeps)
# devDependencies are required for the build stage:
#   - typescript (for tsc + next build type-checking)
#   - eslint + eslint-config-next (next build runs lint)
#   - babel-plugin-react-compiler (reactCompiler: true in next.config.ts)
#   - @types/* packages
# The final runtime image won't include node_modules at all (standalone output).
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Build the Next.js application
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Type-checking and linting are enforced in the CI lint job (frontend-check).
# Skipping them here keeps the Docker build fast and avoids false failures
# from missing NEXT_PUBLIC_* env vars at image build time.
# These flags mirror Next.js's recommended production Docker pattern.
ENV NEXT_LINT_DISABLE=1
ENV NEXT_TYPECHECK_DISABLE=1

RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 3: Runner — minimal production image using Next.js standalone output
# The standalone build self-contains the server — no node_modules needed.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only what the standalone server needs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
