# ========================================
# Build Stage - Kompiliert die React App
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiere package files und installiere Dependencies
COPY frontend/package*.json ./
RUN npm ci

# Kopiere den Frontend Source Code
COPY frontend/ ./

# Build die Production Version
RUN npm run build

# ========================================
# Production Stage - Nginx Server
# ========================================
FROM nginx:alpine

# Kopiere die gebaute App vom Builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Kopiere Nginx Konfiguration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Exponiere Port 80
EXPOSE 80

# Starte Nginx
CMD ["bash", "-c", "npm run start"]
