-- Migration: Añadir índice único en campus.nombre (seguridad contra duplicados)
-- Fecha: 2026-02-03
-- Nota: Primero elimina duplicados exactos (comparación case-insensitive, trim),
--       luego crea el índice único. Revisar los registros eliminados antes de aplicar
--       en producción si no se desea pérdida automática.

SET @deleted := 0;

-- 1) Eliminar duplicados conservando el registro con menor id_campus
DELETE t1 FROM campus t1
INNER JOIN campus t2
  ON LOWER(TRIM(t1.nombre)) = LOWER(TRIM(t2.nombre))
  AND t1.id_campus > t2.id_campus;

-- 2) Crear índice único en nombre (longitud 191 para compatibilidad utf8mb4)
ALTER TABLE campus
  ADD UNIQUE INDEX uk_campus_nombre (nombre(191));

-- Rollback (si es necesario):
-- ALTER TABLE campus DROP INDEX uk_campus_nombre;