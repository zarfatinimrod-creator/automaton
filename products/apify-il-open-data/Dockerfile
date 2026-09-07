# Apify base image with Node.js 22 (no browsers needed - JSON API only)
FROM apify/actor-node:22 AS builder

COPY package*.json ./
RUN npm install --include=dev --audit=false

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM apify/actor-node:22

COPY package*.json ./
RUN npm --quiet set progress=false \
    && npm install --omit=dev --omit=optional --audit=false \
    && echo "Installed NPM packages:" \
    && (npm list --omit=dev --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version

COPY --from=builder /usr/src/app/dist ./dist
COPY .actor ./.actor

CMD ["npm", "run", "start", "--silent"]
