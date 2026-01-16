param(
  [string]$ComposeFile = "docker-compose.yml",
  [switch]$Build = $true
)

$ErrorActionPreference = "Stop"

Write-Host "Iniciando sistema con Docker Compose..." -ForegroundColor Cyan

try {
  docker info | Out-Null
} catch {
  Write-Host "No se puede conectar al Docker daemon. Abre Docker Desktop y vuelve a intentar." -ForegroundColor Red
  exit 1
}

$args = @("compose", "-f", $ComposeFile, "up", "-d")
if ($Build) { $args += "--build" }

docker @args

Write-Host ""
Write-Host "Listo." -ForegroundColor Green
Write-Host "- Frontend + API (Nginx): http://localhost" -ForegroundColor Green
Write-Host "- Health API: http://localhost/api/health" -ForegroundColor Green
Write-Host "- Backend directo: http://localhost:3000/health" -ForegroundColor Green
