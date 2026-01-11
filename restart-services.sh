#!/bin/bash

echo "🔄 Reiniciando servicios del sistema de bienes..."

# Detener contenedores existentes
echo "⏹️  Deteniendo contenedores..."
docker-compose down

# Limpiar contenedores problemáticos
echo "🧹 Limpiando contenedores..."
docker container prune -f

# Reconstruir y iniciar servicios
echo "🏗️  Reconstruyendo servicios..."
docker-compose build --no-cache

echo "🚀 Iniciando servicios..."
docker-compose up -d

echo "⏰ Esperando que los servicios estén listos..."
sleep 10

echo "📊 Estado de los servicios:"
docker-compose ps

echo "✅ ¡Servicios reiniciados!"
echo ""
echo "🌐 URLs disponibles:"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:3000/api"
echo "   Health Check: http://localhost:3000/health"
echo ""
echo "🔑 Usuarios de prueba disponibles:"
echo "   admin@intsuperior.edu.ec"
echo "   jhonatan@intsuperior.edu.ec"