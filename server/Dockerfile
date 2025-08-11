# syntax=docker/dockerfile:1
FROM node:22-alpine AS base

WORKDIR /app

# Install dependencies separately to leverage cache
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY src ./src

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000

CMD ["npm", "start"]

