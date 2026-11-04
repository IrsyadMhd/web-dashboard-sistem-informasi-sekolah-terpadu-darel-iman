# ============================================================
# Multi-stage Dockerfile: React + Vite -> Nginx
# Multi-arch (linux/amd64 & linux/arm64) - siap untuk Easypanel ARM64
# ============================================================

# ── Stage 1: Build ───────────────────────────────────────────
# Debian (glibc) dipakai agar native binding *-linux-arm64-gnu
# (rolldown, lightningcss, tailwind oxide) cocok dengan lockfile.
FROM node:22-slim AS build

WORKDIR /app

# Variabel VITE_* ditanam saat build. Isi lewat Easypanel > Build Args
# (atau --build-arg). Env di shell mengalahkan file .env.
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_WS_URL=$VITE_WS_URL \
    NODE_OPTIONS="--max-old-space-size=4096"

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ────────────────────────────────
FROM nginx:stable-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
