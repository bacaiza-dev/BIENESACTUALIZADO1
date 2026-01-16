#!/bin/bash

# ===========================================
# SCRIPT DE DESPLIEGUE DOCKER
# Sistema de Gestión de Bienes INT
# ===========================================

set -e

echo "🚀 INICIANDO DESPLIEGUE DEL SISTEMA DE BIENES INT"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que Docker esté corriendo
if ! docker info > /dev/null 2>&1; then
    error "Docker no está corriendo. Por favor inicia Docker Desktop."
    exit 1
fi

# Verificar que docker-compose esté disponible
if ! command -v docker-compose &> /dev/null; then
    error "docker-compose no está instalado."
    exit 1
fi

log "Verificando prerrequisitos..."
success "Docker y docker-compose están disponibles"

# Detener contenedores existentes
log "Deteniendo contenedores existentes..."
docker-compose down --remove-orphans || true

# Limpiar imágenes huérfanas
log "Limpiando imágenes huérfanas..."
docker system prune -f || true

# Construir imágenes
log "Construyendo imágenes..."
docker-compose build --no-cache

# Iniciar servicios
log "Iniciando servicios..."
docker-compose up -d

# Esperar a que los servicios estén listos
log "Esperando que los servicios estén listos..."

# Esperar MySQL
log "Verificando MySQL..."
timeout 60 bash -c 'until docker-compose exec -T mysql mysqladmin ping -h localhost -u root -padmin 2>/dev/null; do sleep 2; done'
success "MySQL está listo"

# Esperar Backend
log "Verificando Backend..."
timeout 60 bash -c 'until curl -f http://localhost:3000/health 2>/dev/null; do sleep 2; done'
success "Backend está listo"

# Esperar Frontend
log "Verificando Frontend..."
timeout 60 bash -c 'until curl -f http://localhost:3001/health 2>/dev/null; do sleep 2; done'
success "Frontend está listo"

# Mostrar estado
log "Estado de los servicios:"
docker-compose ps

echo ""
success "🎉 DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "======================================"
echo ""
echo "📱 Accede a la aplicación:"
echo "   🌐 Frontend: http://localhost:3001"
echo "   🔧 API Backend: http://localhost:3000/api"
echo "   🗄️  MySQL: localhost:3307"
echo "   🌍 Nginx Proxy: http://localhost:80"
echo ""
echo "🔑 Usuarios de prueba:"
echo "   📧 admin@intsuperior.edu.ec"
echo "   📧 jhonatan.bano@intsuperior.edu.ec"
echo ""
echo "📊 Comandos útiles:"
echo "   📋 Ver logs: docker-compose logs -f [service]"
echo "   🔄 Reiniciar: docker-compose restart [service]"
echo "   🛑 Detener: docker-compose down"
echo ""

# Función cleanup para manejar Ctrl+C
cleanup() {
    echo ""
    warning "Deteniendo servicios..."
    docker-compose down
    exit 0
}

# Preguntar si mantener corriendo o detener
read -p "¿Mantener los servicios corriendo? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    cleanup
else
    echo ""
    success "Servicios manteniéndose en ejecución"
    echo "Para detener: docker-compose down"
fi
