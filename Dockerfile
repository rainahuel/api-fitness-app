# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/server.js"]