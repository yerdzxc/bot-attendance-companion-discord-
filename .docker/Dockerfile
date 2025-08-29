FROM oven/bun:alpine AS base
# Set workdir
WORKDIR /app
RUN ln -s /usr/local/bin/bunx /usr/local/bin/npx && ln -s /usr/local/bin/bun /usr/local/bin/npm

# ============================
# 1. Build stage
# ============================
FROM base AS builder

# Copy everything
COPY . ./

# Install dependencies
RUN bun install

RUN bun prisma generate

# ============================
# 2. Build production
# ============================
FROM base AS production-module

COPY --from=builder /app/package.json /app/bun.lock	./

# Optimize node_modules
RUN apk add --no-cache bash && bun install -p && \
    bunx clean-modules -y && \
    bunx node-prune

# ============================
# 3. Production stage
# ============================
FROM base AS final

# Copy built app from builder
COPY --chown=bun:bun --from=builder		/app/dist				./dist
COPY --chown=bun:bun --from=production-module	/app/node_modules			./node_modules
COPY --chown=bun:bun				./.scripts/post-deploy.sh	./

# Set environment variables (can also be passed during `docker run`)
ENV NODE_ENV=production
USER bun

# You may customize this depending on your app's entrypoint
# CMD ["bun", "start"] or similar
CMD ["sh", "./post-deploy.sh"]
