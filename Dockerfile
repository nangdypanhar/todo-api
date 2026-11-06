# syntax=docker/dockerfile:1

# ---- Stage 1: build ----------------------------------------------------------
# Installs every dependency (including dev tools) and compiles TypeScript to dist/.
FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Keep only production dependencies for the final image.
RUN npm prune --omit=dev

# ---- Stage 2: run ------------------------------------------------------------
# Only the compiled app and production node_modules; no source, no dev tools, no secrets.
FROM node:24-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist

USER node
EXPOSE 3000

# Apply pending migrations, then start the API.
CMD ["sh", "-c", "npm run migration:run:prod && node dist/main"]
