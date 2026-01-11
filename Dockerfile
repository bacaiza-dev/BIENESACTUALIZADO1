# =============================================
# DOCKERFILE COMPLETO - SISTEMA UNIFICADO
# Frontend + Backend + MySQL + Nginx
# =============================================

FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Instalar dependencias básicas
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Instalar Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get update && apt-get install -y nodejs

# Instalar servicios
RUN apt-get update && apt-get install -y \
    nginx \
    mysql-server \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Crear directorios
RUN mkdir -p \
    /var/www/html \
    /var/log/supervisor \
    /app/frontend \
    /app/backend \
    /run/mysqld

# ==================== FRONTEND ====================
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build && cp -r dist/* /var/www/html/

# ==================== BACKEND ====================
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/ ./

# ==================== MYSQL ====================
RUN usermod -d /var/lib/mysql/ mysql && \
    mkdir -p /var/lib/mysql /run/mysqld && \
    chown -R mysql:mysql /var/lib/mysql /run/mysqld

COPY database/init/01-intbienes.sql /tmp/intbienes.sql

RUN service mysql start && \
    sleep 10 && \
    mysql -u root -e "CREATE DATABASE intbienes;" && \
    mysql -u root intbienes < /tmp/intbienes.sql && \
    service mysql stop && \
    rm /tmp/intbienes.sql

# ==================== NGINX ====================
COPY nginx.conf /etc/nginx/sites-available/default

# ==================== SUPERVISOR ====================
# Crear configuración de supervisor
COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid
loglevel=info

[program:mysql]
command=/usr/bin/mysqld_safe --user=mysql
autostart=true
autorestart=true
stdout_logfile=/var/log/mysql.log
stderr_logfile=/var/log/mysql.log
priority=1
user=mysql

[program:backend]
command=/usr/bin/node server.js
directory=/app/backend
autostart=true
autorestart=true
stdout_logfile=/var/log/backend.log
stderr_logfile=/var/log/backend.log
environment=NODE_ENV=production,DB_HOST=localhost,DB_PORT=3306,DB_USER=root,DB_PASSWORD="",DB_NAME=intbienes,JWT_SECRET=your-super-secret-jwt-key-change-in-production,PORT=3001,FRONTEND_URL=http://localhost:3001,CORS_ORIGIN=http://localhost:3001
priority=2
user=www-data

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
autostart=true
autorestart=true
stdout_logfile=/var/log/nginx.log
stderr_logfile=/var/log/nginx.log
priority=3
user=root
EOF

# Permisos
RUN chown -R www-data:www-data /var/www/html && \
    chown -R mysql:mysql /var/lib/mysql

# Variables de entorno
ENV NODE_ENV=production
ENV DB_HOST=localhost
ENV DB_PORT=3306
ENV DB_USER=root
ENV DB_PASSWORD=""
ENV DB_NAME=intbienes
ENV JWT_SECRET=your-super-secret-jwt-key-change-in-production
ENV PORT=3000

WORKDIR /app
EXPOSE 80 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Comando de inicio
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]