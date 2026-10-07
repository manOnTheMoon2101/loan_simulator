# ─── Build Stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

# Enable pnpm via corepack (ships with Node 22)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy manifests first so dependency install is cached separately from source
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install all deps (devDeps needed for the build step)
RUN pnpm install --frozen-lockfile

# Copy source and compile
COPY . .
RUN pnpm build

# ─── Runtime Stage ────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Run as a non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 sveltekit

# adapter-node produces a self-contained server in build/ — no node_modules needed
COPY --from=builder --chown=sveltekit:nodejs /app/build ./build

USER sveltekit

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# `node build` is the adapter-node entry point
CMD ["node", "build"]
