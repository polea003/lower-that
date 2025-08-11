# syntax=docker/dockerfile:1
FROM node:22-alpine AS base

WORKDIR /app

# Install dependencies (includes dev deps for Vite dev server)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

ENV NODE_ENV=development \
    VITE_API_PROXY_TARGET=http://server:3000

EXPOSE 5173

# Run Vite dev server, binding to all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

