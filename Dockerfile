# ============================================================
# Multi-stage Dockerfile for React + Vite 8
# Target: ARM64 (Easypanel)
# ============================================================

# ── Stage 1: Build ───────────────────────────────────────────
FROM node:22-slim AS build

WORKDIR /app

# Build argument — pass via Easypanel or docker build --build-arg
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Increase Node memory for large builds
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Copy only package.json (NOT package-lock.json)
# so npm resolves correct ARM64 native bindings fresh
COPY package.json ./

# Install dependencies — fresh resolve for linux/arm64
RUN npm install

# Copy source code & build
COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ────────────────────────────────
FROM nginx:stable-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
