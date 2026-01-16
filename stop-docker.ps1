param(
  [string]$ComposeFile = "docker-compose.yml",
  [switch]$RemoveVolumes = $false
)

$ErrorActionPreference = "Stop"

Write-Host "Deteniendo sistema Docker..." -ForegroundColor Cyan

$args = @("compose", "-f", $ComposeFile, "down")
if ($RemoveVolumes) { $args += "-v" }

docker @args

Write-Host "Listo." -ForegroundColor Green
