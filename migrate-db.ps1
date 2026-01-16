param(
  [string]$MysqlContainer = "intbienes_mysql",
  [string]$DbName = "intbienes",
  [string]$DbUser = "root",
  [string]$DbPassword = "admin"
)

$ErrorActionPreference = "Stop"

Write-Host "Migrando base de datos ($DbName) en el contenedor $MysqlContainer..." -ForegroundColor Cyan

try {
  docker info | Out-Null
} catch {
  Write-Host "No se puede conectar al Docker daemon. Abre Docker Desktop y vuelve a intentar." -ForegroundColor Red
  exit 1
}

$hasRol = docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -N -B -D $DbName -e `
  "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='$DbName' AND table_name='usuarios' AND column_name='rol';"

if ([int]$hasRol -eq 0) {
  Write-Host "Agregando columna usuarios.rol..." -ForegroundColor Yellow
  docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -D $DbName -e `
    "ALTER TABLE usuarios ADD COLUMN rol ENUM('Administrador','Usuario') NOT NULL DEFAULT 'Usuario' AFTER password_hash;"
} else {
  Write-Host "La columna usuarios.rol ya existe. (OK)" -ForegroundColor Green
}

Write-Host "Sincronizando valores de usuarios.rol segun usuario_rol/roles..." -ForegroundColor Yellow
$hasUsuarioRol = docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -N -B -D $DbName -e `
  "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DbName' AND table_name='usuario_rol';"

if ([int]$hasUsuarioRol -gt 0) {
  docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -D $DbName -e `
    "UPDATE usuarios u LEFT JOIN (SELECT ur.id_usuario, CASE WHEN SUM(LOWER(r.nombre_rol) = 'administrador') > 0 THEN 'Administrador' ELSE 'Usuario' END AS rol_calc FROM usuario_rol ur JOIN roles r ON r.id_rol = ur.id_rol GROUP BY ur.id_usuario) x ON x.id_usuario = u.id_usuario SET u.rol = COALESCE(x.rol_calc, 'Usuario');"

  Write-Host "Eliminando tabla usuario_rol (ya no es necesaria; rol vive en usuarios.rol)..." -ForegroundColor Yellow
  docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -D $DbName -e "DROP TABLE IF EXISTS usuario_rol;"
} else {
  Write-Host "Tabla usuario_rol no existe. (OK)" -ForegroundColor Green
}

Write-Host "Backfill de historial (bien_usuario / bien_ubicacion) desde bienes..." -ForegroundColor Yellow
$hasBienUbicacion = docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -N -B -D $DbName -e `
  "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='$DbName' AND table_name='bienes' AND column_name='ubicacion_id';"
$hasBienResponsable = docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -N -B -D $DbName -e `
  "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='$DbName' AND table_name='bienes' AND column_name='responsable_id';"

if ([int]$hasBienUbicacion -gt 0) {
  docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -D $DbName -e `
    "INSERT INTO bien_ubicacion (id_bien, id_ubicacion, fecha_asignacion, activo, observaciones) SELECT b.id_bien, b.ubicacion_id, COALESCE(b.created_at, NOW()), 1, 'Backfill inicial' FROM bienes b LEFT JOIN bien_ubicacion bu ON bu.id_bien = b.id_bien AND bu.activo = 1 WHERE b.ubicacion_id IS NOT NULL AND bu.id IS NULL;"
}

if ([int]$hasBienResponsable -gt 0) {
  docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -D $DbName -e `
    "INSERT INTO bien_usuario (id_bien, id_usuario, fecha_asignacion, activo, observaciones) SELECT b.id_bien, b.responsable_id, COALESCE(b.created_at, NOW()), 1, 'Backfill inicial' FROM bienes b LEFT JOIN bien_usuario bu ON bu.id_bien = b.id_bien AND bu.activo = 1 WHERE b.responsable_id IS NOT NULL AND bu.id IS NULL;"
}

Write-Host "Asegurando integridad: solo 1 asignacion activa por bien..." -ForegroundColor Yellow
docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -D $DbName -e `
  "UPDATE bien_usuario bu JOIN (SELECT id, ROW_NUMBER() OVER (PARTITION BY id_bien ORDER BY fecha_asignacion DESC, id DESC) AS rn FROM bien_usuario WHERE activo = 1) x ON x.id = bu.id SET bu.activo = 0, bu.fecha_devolucion = COALESCE(bu.fecha_devolucion, NOW()) WHERE x.rn > 1;"
docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -D $DbName -e `
  "UPDATE bien_ubicacion bu JOIN (SELECT id, ROW_NUMBER() OVER (PARTITION BY id_bien ORDER BY fecha_asignacion DESC, id DESC) AS rn FROM bien_ubicacion WHERE activo = 1) x ON x.id = bu.id SET bu.activo = 0, bu.fecha_retiro = COALESCE(bu.fecha_retiro, NOW()) WHERE x.rn > 1;"

$hasBienUsuarioActiveCol = docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -N -B -D $DbName -e `
  "SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema='$DbName' AND table_name='bien_usuario' AND index_name='uk_bien_usuario_activo';"
if ([int]$hasBienUsuarioActiveCol -eq 0) {
  Write-Host "Creando indice unico (bien_usuario: 1 activo por bien)..." -ForegroundColor Yellow
  docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -D $DbName -e `
    "CREATE UNIQUE INDEX uk_bien_usuario_activo ON bien_usuario ((CASE WHEN activo = 1 THEN id_bien ELSE NULL END));"
}

$hasBienUbicacionActiveCol = docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -N -B -D $DbName -e `
  "SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema='$DbName' AND table_name='bien_ubicacion' AND index_name='uk_bien_ubicacion_activo';"
if ([int]$hasBienUbicacionActiveCol -eq 0) {
  Write-Host "Creando indice unico (bien_ubicacion: 1 activo por bien)..." -ForegroundColor Yellow
  docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -D $DbName -e `
    "CREATE UNIQUE INDEX uk_bien_ubicacion_activo ON bien_ubicacion ((CASE WHEN activo = 1 THEN id_bien ELSE NULL END));"
}

if ([int]$hasBienUbicacion -gt 0) {
  Write-Host "Eliminando columnas redundantes bienes.ubicacion_id / bienes.responsable_id..." -ForegroundColor Yellow

  $fkUbic = docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -N -B -D $DbName -e `
    "SELECT DISTINCT CONSTRAINT_NAME FROM information_schema.key_column_usage WHERE table_schema='$DbName' AND table_name='bienes' AND column_name='ubicacion_id' AND referenced_table_name IS NOT NULL;"
  if ($fkUbic) {
    foreach ($name in ($fkUbic -split "`n")) {
      if ($name) { docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -D $DbName -e "ALTER TABLE bienes DROP FOREIGN KEY $name;" }
    }
  }

  docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -D $DbName -e "ALTER TABLE bienes DROP COLUMN ubicacion_id;"
}

if ([int]$hasBienResponsable -gt 0) {
  $fkResp = docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -N -B -D $DbName -e `
    "SELECT DISTINCT CONSTRAINT_NAME FROM information_schema.key_column_usage WHERE table_schema='$DbName' AND table_name='bienes' AND column_name='responsable_id' AND referenced_table_name IS NOT NULL;"
  if ($fkResp) {
    foreach ($name in ($fkResp -split "`n")) {
      if ($name) { docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -D $DbName -e "ALTER TABLE bienes DROP FOREIGN KEY $name;" }
    }
  }

  docker exec $MysqlContainer mysql "-u$DbUser" "-p$DbPassword" -D $DbName -e "ALTER TABLE bienes DROP COLUMN responsable_id;"
}

Write-Host "Listo. (OK)" -ForegroundColor Green
