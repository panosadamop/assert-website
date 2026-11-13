# ---------- ASSERT CMS (NestJS) ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
ENV NODE_ENV=production PORT=4000 DATA_DIR=/app/storage/data UPLOADS_DIR=/app/storage/uploads
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json app.js ./
COPY admin ./admin
COPY seed ./seed
RUN mkdir -p /app/storage && chown -R node:node /app/storage
USER node
VOLUME ["/app/storage"]
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1
CMD ["node", "app.js"]
