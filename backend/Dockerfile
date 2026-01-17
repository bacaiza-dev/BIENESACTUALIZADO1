# ===========================================
# DOCKERFILE OPTIMIZADO PARA BACKEND NODE.JS
# Sistema de Gestión de Bienes INT
# ===========================================

# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias de sistema para compilación
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --omit=dev && npm cache clean --force

# Etapa de producción
FROM node:20-alpine AS production

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar node_modules desde builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código fuente
COPY --chown=nodejs:nodejs . .

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["node", "server.js"]