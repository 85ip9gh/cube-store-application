FROM node:20-alpine

# The base image lags Alpine's own package repository. node:20-alpine currently
# ships openssl 3.5.6-r0, which carries CVE-2026-45447 in libcrypto3 and
# libssl3, and Alpine has already published 3.5.7-r0. Pull the patched packages
# rather than waiting for the node image to rebuild. Targeted rather than a
# blanket `apk upgrade`, so the drift from the base image stays small and
# readable, and it is a no-op once the base image catches up.
RUN apk upgrade --no-cache libcrypto3 libssl3

ENV NODE_ENV=production \
    NODE_OPTIONS=--max-old-space-size=192 \
    PORT=4242

WORKDIR /app

COPY server/package.json server/package-lock.json ./
# npm and yarn are build-time tools. The container runs `node index.js` and the
# healthcheck runs `node -e`, so neither is needed at runtime. They are removed
# in the same layer that used them, which is what actually keeps them out of the
# image rather than just out of the final filesystem. Their own bundled
# dependencies accounted for 18 of the 20 findings the image scan reported,
# including its only CRITICAL. See docs/security-gates-baseline.md.
RUN npm ci --omit=dev --no-audit --no-fund \
    && npm cache clean --force \
    && rm -rf /usr/local/lib/node_modules/npm \
        /usr/local/bin/npm /usr/local/bin/npx \
        /opt/yarn-* /usr/local/bin/yarn /usr/local/bin/yarnpkg

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

# Declared here as well as in compose.yaml so the image is self-describing
# wherever it runs, and so a scanner reading only the Dockerfile can see it.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:4242/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "index.js"]
