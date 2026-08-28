# Catalog stdio stub for Glama introspection and local smoke tests.
# Glama builds from its admin UI; this image mirrors that CMD for verification.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

ENTRYPOINT ["node", "dist/main.js"]
