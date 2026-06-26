FROM node:22-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-slim AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]
