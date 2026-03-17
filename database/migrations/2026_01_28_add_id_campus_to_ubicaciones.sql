-- Migración: Agregar columna id_campus a la tabla ubicaciones
-- Fecha: 2026-01-28

-- Agregar la columna id_campus
ALTER TABLE ubicaciones 
ADD COLUMN id_campus INT DEFAULT NULL AFTER sede;

-- Agregar restricción de clave foránea
ALTER TABLE ubicaciones 
ADD CONSTRAINT ubicaciones_ibfk_campus FOREIGN KEY (id_campus) REFERENCES campus (id_campus) ON DELETE SET NULL;

-- Crear índice para mejorar rendimiento
CREATE INDEX idx_ubicaciones_campus ON ubicaciones(id_campus);
