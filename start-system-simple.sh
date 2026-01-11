#!/bin/bash

echo "🚀 INICIANDO SISTEMA DE BIENES INSTITUCIONALES"
echo "=============================================="

# Detener procesos anteriores si existen
echo "🛑 Deteniendo procesos anteriores..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "npm.*dev" 2>/dev/null || true

# Iniciar MySQL con Docker (más simple)
echo "🗄️  Iniciando base de datos MySQL..."
docker run -d \
  --name intbienes_mysql_simple \
  --rm \
  -e MYSQL_ROOT_PASSWORD=admin \
  -e MYSQL_DATABASE=intbienes \
  -p 3307:3306 \
  -v "$(pwd)/database/init/01-intbienes.sql:/docker-entrypoint-initdb.d/01-intbienes.sql" \
  mysql:8.0

# Esperar a que MySQL esté listo
echo "⏳ Esperando que MySQL esté listo..."
sleep 15

# Verificar que MySQL esté funcionando
echo "🔍 Verificando conexión a MySQL..."
timeout 10 docker exec intbienes_mysql_simple mysqladmin ping -h localhost -u root -padmin || {
  echo "❌ MySQL no está respondiendo"
  exit 1
}

echo "✅ MySQL funcionando correctamente"

# Configurar variables de entorno para backend
export NODE_ENV=development
export DB_HOST=127.0.0.1
export DB_PORT=3307
export DB_USER=root
export DB_PASSWORD=admin
export DB_NAME=intbienes
export JWT_SECRET=your-super-secret-jwt-key-change-in-production
export PORT=3000
export FRONTEND_URL=http://localhost:3001
export CORS_ORIGIN=http://localhost:3001

# Iniciar backend
echo "🖥️  Iniciando backend..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Esperar a que el backend esté listo
echo "⏳ Esperando que el backend esté listo..."
sleep 5

# Verificar que el backend esté funcionando
echo "🔍 Verificando backend..."
timeout 10 curl -f http://localhost:3000/health || {
  echo "❌ Backend no está respondiendo"
  kill $BACKEND_PID 2>/dev/null
  docker stop intbienes_mysql_simple 2>/dev/null
  exit 1
}

echo "✅ Backend funcionando correctamente"

# Configurar variables de entorno para frontend
export VITE_API_URL=http://localhost:3000/api

# Iniciar frontend
echo "🌐 Iniciando frontend..."
cd frontend
npm run dev -- --host 0.0.0.0 --port 3001 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ SISTEMA INICIADO CORRECTAMENTE"
echo "=================================="
echo "🌐 Frontend: http://localhost:3001"
echo "🖥️  Backend API: http://localhost:3000/api"
echo "🗄️  MySQL: localhost:3307"
echo ""
echo "🔑 Usuarios de prueba:"
echo "   - admin@intsuperior.edu.ec"
echo "   - jhonatan@intsuperior.edu.ec"
echo ""
echo "🛑 Para detener el sistema, presiona Ctrl+C"
echo ""

# Función para cleanup cuando se termine el script
cleanup() {
  echo ""
  echo "🛑 Deteniendo servicios..."
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  docker stop intbienes_mysql_simple 2>/dev/null
  echo "✅ Servicios detenidos"
  exit 0
}

# Capturar señales para cleanup
trap cleanup SIGINT SIGTERM

# Mantener el script corriendo
wait