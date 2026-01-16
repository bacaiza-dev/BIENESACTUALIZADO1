#!/bin/bash

echo "🧪 PRUEBA RÁPIDA DE CONFIGURACIÓN DOCKER"
echo "========================================"

echo "📋 Imágenes disponibles:"
docker images | grep bienesint

echo ""
echo "📊 Estado actual de contenedores:"
docker ps -a | grep intbienes

echo ""
echo "🔧 Intentando iniciar MySQL directamente..."
docker run -d \
  --name intbienes_mysql_test \
  --rm \
  -e MYSQL_ROOT_PASSWORD=admin \
  -e MYSQL_DATABASE=intbienes \
  -p 3307:3306 \
  -v "$(pwd)/shared/database/init/01-intbienes.sql:/docker-entrypoint-initdb.d/01-init.sql" \
  mysql:8.0

echo ""
echo "⏳ Esperando MySQL..."
sleep 15

echo ""
echo "🔧 Intentando iniciar backend..."
docker run -d \
  --name intbienes_backend_test \
  --rm \
  --link intbienes_mysql_test:mysql \
  -e DB_HOST=mysql \
  -e DB_PORT=3306 \
  -e DB_USER=root \
  -e DB_PASSWORD=admin \
  -e DB_NAME=intbienes \
  -e JWT_SECRET=test-secret \
  -e PORT=3000 \
  -p 3000:3000 \
  bienesint-backend:latest

echo ""
echo "⏳ Esperando backend..."
sleep 10

echo ""
echo "🧪 Probando endpoints:"
echo "📊 MySQL:"
docker exec intbienes_mysql_test mysqladmin ping -h localhost -u root -padmin

echo ""
echo "📊 Backend health:"
curl -f http://localhost:3000/health || echo "Backend no responde"

echo ""
echo "📊 Estado de contenedores:"
docker ps | grep intbienes

echo ""
echo "🛑 Para detener: docker stop intbienes_mysql_test intbienes_backend_test"
