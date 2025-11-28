# Multi-stage build for smaller production image
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# install deps
COPY package*.json ./
RUN npm ci

# copy sources and build
COPY . .
RUN npm run build

# production image
FROM node:20-alpine AS runtime
WORKDIR /usr/src/app

# copy only what we need
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/index.js"]
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

RUN npm run build

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "dist/index.js"]
