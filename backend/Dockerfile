# Multi-stage build for smaller production image
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# install deps (includes devDependencies for build)
COPY package*.json ./
RUN npm ci

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# copy sources and build
COPY . .
RUN npm run build

# production image
FROM node:20-slim AS runtime
WORKDIR /usr/src/app

# copy only what we need
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema and generate client for production
COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/swagger.json ./swagger.json

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/index.js"]
