FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY tsconfig.json vitest.config.ts ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package*.json ./
EXPOSE 5174
CMD ["node", "dist/index.js"]
