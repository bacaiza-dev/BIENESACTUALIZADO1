-- Script de Migración y Normalización de Datos
-- Fecha: 25 de junio de 2025
-- Propósito: Limpiar estructura y normalizar completamente la base de datos

USE `intbienes`;

-- =============================================
-- PASO 1: BACKUP DE SEGURIDAD
-- =============================================
-- Limpiar tablas de respaldo previas y crear nuevas
DROP TABLE IF EXISTS bienes_backup;
DROP TABLE IF EXISTS usuarios_backup;
DROP TABLE IF EXISTS ubicaciones_backup;

-- Crear tablas de respaldo con estructura actual
CREATE TABLE bienes_backup LIKE bienes;
INSERT INTO bienes_backup SELECT * FROM bienes;

CREATE TABLE usuarios_backup LIKE usuarios;
INSERT INTO usuarios_backup SELECT * FROM usuarios;

CREATE TABLE ubicaciones_backup LIKE ubicaciones;
INSERT INTO ubicaciones_backup SELECT * FROM ubicaciones;

-- =============================================
-- PASO 2: AGREGAR CAMPOS DE RELACIÓN A BIENES
-- =============================================
-- Agregar campos de FK - ignorar errores si ya existen
ALTER TABLE bienes ADD COLUMN ubicacion_id INT NULL;
ALTER TABLE bienes ADD COLUMN responsable_id INT NULL;
ALTER TABLE bienes ADD COLUMN categoria_id INT NULL;

-- =============================================
-- PASO 3: CREAR TABLA CATEGORIAS SI NO EXISTE
-- =============================================
CREATE TABLE IF NOT EXISTS categorias (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  nombre_categoria VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_categoria),
  UNIQUE KEY uk_nombre_categoria (nombre_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =============================================
-- PASO 4: POBLAR TABLA CATEGORIAS CON DATOS ÚNICOS
-- =============================================
INSERT IGNORE INTO categorias (nombre_categoria, descripcion)
SELECT DISTINCT 
  clase_de_bien as nombre_categoria,
  CONCAT('Categoría: ', clase_de_bien) as descripcion
FROM bienes 
WHERE clase_de_bien IS NOT NULL AND clase_de_bien != '';

-- =============================================
-- PASO 5: MIGRAR DATOS DE UBICACIONES
-- =============================================
-- Actualizar bienes con ubicacion_id basado en el campo ubicacion (texto)
UPDATE bienes b 
INNER JOIN ubicaciones u ON TRIM(u.area) = TRIM(b.ubicacion)
SET b.ubicacion_id = u.id_ubicacion
WHERE b.ubicacion IS NOT NULL AND b.ubicacion != '';

-- Para casos donde no hay coincidencia exacta, crear ubicaciones faltantes
INSERT IGNORE INTO ubicaciones (area, sede, descripcion, activo)
SELECT DISTINCT 
  TRIM(b.ubicacion) as area,
  'Sede Principal' as sede,
  CONCAT('Ubicación migrada: ', TRIM(b.ubicacion)) as descripcion,
  1 as activo
FROM bienes b
LEFT JOIN ubicaciones u ON TRIM(u.area) = TRIM(b.ubicacion)
WHERE b.ubicacion IS NOT NULL 
  AND b.ubicacion != ''
  AND u.id_ubicacion IS NULL;

-- Segundo intento de actualización después de crear ubicaciones faltantes
UPDATE bienes b 
INNER JOIN ubicaciones u ON TRIM(u.area) = TRIM(b.ubicacion)
SET b.ubicacion_id = u.id_ubicacion
WHERE b.ubicacion_id IS NULL 
  AND b.ubicacion IS NOT NULL 
  AND b.ubicacion != '';

-- =============================================
-- PASO 6: MIGRAR DATOS DE RESPONSABLES
-- =============================================
-- Normalizar nombres de responsables (eliminar prefijos como ING., ECON., etc.)
UPDATE bienes 
SET responsable_institucional = TRIM(
  REGEXP_REPLACE(
    REGEXP_REPLACE(responsable_institucional, '^(ING\\.?\\s*|ECON\\.?\\s*|ABG\\.?\\s*|TGLA\\.?\\s*)', ''),
    '\\s+', ' '
  )
)
WHERE responsable_institucional IS NOT NULL;

-- Actualizar bienes con responsable_id
UPDATE bienes b 
INNER JOIN usuarios u ON (
  TRIM(UPPER(CONCAT(u.nombres, ' ', u.apellidos))) = TRIM(UPPER(b.responsable_institucional))
  OR TRIM(UPPER(u.nombres)) = TRIM(UPPER(b.responsable_institucional))
)
SET b.responsable_id = u.id_usuario
WHERE b.responsable_institucional IS NOT NULL AND b.responsable_institucional != '';

-- =============================================
-- PASO 7: MIGRAR DATOS DE CATEGORÍAS
-- =============================================
-- Actualizar bienes con categoria_id
UPDATE bienes b 
INNER JOIN categorias c ON TRIM(c.nombre_categoria) = TRIM(b.clase_de_bien)
SET b.categoria_id = c.id_categoria
WHERE b.clase_de_bien IS NOT NULL AND b.clase_de_bien != '';

-- =============================================
-- PASO 8: LIMPIAR CAMPOS REDUNDANTES
-- =============================================
-- Solo después de verificar que la migración fue exitosa
-- IMPORTANTE: Ejecutar solo después de verificar los datos

-- Verificar integridad antes de eliminar campos
SELECT 
  COUNT(*) as total_bienes,
  COUNT(ubicacion_id) as con_ubicacion_id,
  COUNT(responsable_id) as con_responsable_id,
  COUNT(categoria_id) as con_categoria_id,
  COUNT(*) - COUNT(ubicacion_id) as sin_ubicacion,
  COUNT(*) - COUNT(responsable_id) as sin_responsable,
  COUNT(*) - COUNT(categoria_id) as sin_categoria
FROM bienes;

-- =============================================
-- PASO 9: CREAR FOREIGN KEYS
-- =============================================
-- Agregar constraints de foreign key
ALTER TABLE bienes 
ADD CONSTRAINT IF NOT EXISTS fk_bienes_ubicacion 
  FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id_ubicacion),
ADD CONSTRAINT IF NOT EXISTS fk_bienes_responsable 
  FOREIGN KEY (responsable_id) REFERENCES usuarios(id_usuario),
ADD CONSTRAINT IF NOT EXISTS fk_bienes_categoria 
  FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria);

-- =============================================
-- PASO 10: OPTIMIZAR TABLAS DE RELACIÓN EXISTENTES
-- =============================================
-- Las tablas bien_usuario y bien_ubicacion ya existen
-- Verificar consistencia
SELECT COUNT(*) as registros_bien_usuario FROM bien_usuario;
SELECT COUNT(*) as registros_bien_ubicacion FROM bien_ubicacion;

-- =============================================
-- PASO 11: CREAR ÍNDICES PARA OPTIMIZACIÓN
-- =============================================
-- Crear índices, ignorar si ya existen
CREATE INDEX idx_bienes_ubicacion ON bienes(ubicacion_id);
CREATE INDEX idx_bienes_responsable ON bienes(responsable_id);
CREATE INDEX idx_bienes_categoria ON bienes(categoria_id);
CREATE INDEX idx_bienes_estado ON bienes(estado);
CREATE INDEX idx_bienes_codigo ON bienes(codigo_institucional);

-- =============================================
-- QUERIES DE VERIFICACIÓN
-- =============================================
-- Verificar la migración
SELECT 'Resumen de Migración' as reporte;

SELECT 
  'Bienes con ubicación normalizada' as tipo,
  COUNT(*) as cantidad
FROM bienes 
WHERE ubicacion_id IS NOT NULL
UNION ALL
SELECT 
  'Bienes con responsable normalizado' as tipo,
  COUNT(*) as cantidad
FROM bienes 
WHERE responsable_id IS NOT NULL
UNION ALL
SELECT 
  'Bienes con categoría normalizada' as tipo,
  COUNT(*) as cantidad
FROM bienes 
WHERE categoria_id IS NOT NULL;

-- Ejemplo de consulta con JOIN para verificar
SELECT 
  b.id_bien,
  b.codigo_institucional,
  b.bien,
  c.nombre_categoria,
  u.area as ubicacion_nombre,
  CONCAT(resp.nombres, ' ', resp.apellidos) as responsable_completo,
  b.valor,
  b.estado
FROM bienes b
LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
LEFT JOIN usuarios resp ON b.responsable_id = resp.id_usuario
LIMIT 10;

-- =============================================
-- PASO 12: SCRIPT DE LIMPIEZA FINAL (OPCIONAL)
-- =============================================
-- EJECUTAR SOLO DESPUÉS DE VERIFICAR QUE TODO FUNCIONA CORRECTAMENTE
/*
-- Eliminar campos redundantes
ALTER TABLE bienes 
DROP COLUMN IF EXISTS ubicacion,
DROP COLUMN IF EXISTS responsable_institucional;
*/

-- Mensaje final
SELECT 'Migración completada. Verificar resultados antes de eliminar campos redundantes.' as mensaje;
