FROM node:20-alpine

ENV NODE_ENV=production \
    NODE_OPTIONS=--max-old-space-size=192 \
    PORT=4242

WORKDIR /app

COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund \
    && npm cache clean --force

COPY server/index.js ./
COPY server/controllers ./controllers
COPY server/middleware ./middleware
COPY server/Models ./Models
COPY server/routes ./routes
COPY frontend ./frontend

RUN mkdir -p /app/cubes \
    && chmod -R a+rX /app

USER node
EXPOSE 4242

CMD ["node", "index.js"]
