$ErrorActionPreference = "Stop"

Write-Host "Verificando Docker..." -ForegroundColor Cyan

try {
  docker --version
} catch {
  Write-Host "Docker no está instalado o no está en PATH." -ForegroundColor Red
  exit 1
}

try {
  docker compose version
} catch {
  Write-Host "Docker Compose no está disponible (usa Docker Desktop actualizado)." -ForegroundColor Red
  exit 1
}

try {
  docker info | Out-Null
  Write-Host "Docker daemon conectado." -ForegroundColor Green
} catch {
  Write-Host "No se puede conectar al Docker daemon. Abre Docker Desktop." -ForegroundColor Red
  exit 1
}

Write-Host "OK." -ForegroundColor Green
