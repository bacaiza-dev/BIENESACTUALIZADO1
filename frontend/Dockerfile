# ===========================================
# DOCKERFILE OPTIMIZADO PARA FRONTEND VUE.JS
# Sistema de Gestión de Bienes INT
# ===========================================

# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias de sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de manera reproducible
RUN npm ci && npm cache clean --force

# Copiar código fuente
COPY . .

# Construir aplicación para producción
RUN npm run build

# Etapa de producción con nginx
FROM nginx:alpine AS production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar archivos construidos
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear usuario no-root
RUN addgroup -g 1001 -S nginx_user \
    && adduser -S nginx_user -u 1001 -G nginx_user

# Permisos para nginx
RUN chown -R nginx_user:nginx_user /var/cache/nginx \
    && chown -R nginx_user:nginx_user /var/log/nginx \
    && chown -R nginx_user:nginx_user /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx_user:nginx_user /var/run/nginx.pid

# Cambiar a usuario no-root
USER nginx_user

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
