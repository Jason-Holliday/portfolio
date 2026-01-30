# ========================================
# Build Stage - Kompiliert die React App
# ========================================
FROM node:20-alpine AS builder

# Arbeitsverzeichnis
WORKDIR /app

# Kopiere package.json und package-lock.json aus dem Frontend
COPY frontend/package*.json ./

# Installiere Dependencies sauber
RUN npm ci

# Kopiere den Frontend-Sourcecode
COPY frontend/ ./

# Build für Production
RUN npm run build

# ========================================
# Production Stage - Nginx Server
# ========================================
FROM nginx:alpine

# Kopiere die gebaute App vom Builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Kopiere deine Nginx-Konfiguration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Exponiere Port 80
EXPOSE 80

# Starte Nginx (Production)
CMD ["nginx", "-g", "daemon off;"]
