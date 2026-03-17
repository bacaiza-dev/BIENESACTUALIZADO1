-- Migración: Agregar campos faltantes a la tabla bienes
-- Fecha: 2026-01-26
-- Descripción: Agregar los campos clase_de_bien, proveedor y anio_fabricacion que están siendo usados por el frontend

ALTER TABLE bienes ADD COLUMN `clase_de_bien` varchar(100) DEFAULT NULL AFTER `descripcion`;
ALTER TABLE bienes ADD COLUMN `proveedor` varchar(100) DEFAULT NULL AFTER `valor_residual`;
ALTER TABLE bienes ADD COLUMN `anio_fabricacion` INT DEFAULT NULL AFTER `fecha_adquisicion`;

-- Verificar que la migración fue exitosa
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'bienes' AND COLUMN_NAME IN ('clase_de_bien', 'proveedor', 'anio_fabricacion');
