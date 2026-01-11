#!/bin/bash

echo "🔍 VERIFICANDO CONFIGURACIÓN DE DOCKER"
echo "====================================="

echo "📊 Verificando Docker..."
if command -v docker &> /dev/null; then
    echo "✅ Docker comando disponible"
    docker --version
else
    echo "❌ Docker comando no encontrado"
    exit 1
fi

echo ""
echo "📊 Verificando Docker Compose..."
if command -v docker-compose &> /dev/null; then
    echo "✅ docker-compose disponible"
    docker-compose --version
else
    echo "⚠️  docker-compose no encontrado, probando 'docker compose'..."
    if docker compose version &> /dev/null; then
        echo "✅ docker compose disponible"
        docker compose version
    else
        echo "❌ Ni docker-compose ni 'docker compose' funcionan"
        exit 1
    fi
fi

echo ""
echo "📊 Verificando conexión con Docker daemon..."
if docker info &> /dev/null; then
    echo "✅ Docker daemon conectado"
else
    echo "❌ No se puede conectar al Docker daemon"
    echo "   Asegúrate de que Docker Desktop esté corriendo"
    exit 1
fi

echo ""
echo "📊 Verificando imágenes existentes..."
echo "Imágenes del proyecto:"
docker images | grep bienesint || echo "No hay imágenes del proyecto"

echo ""
echo "✅ DOCKER CONFIGURADO CORRECTAMENTE"
echo "Ahora puedes ejecutar: ./deploy.sh"