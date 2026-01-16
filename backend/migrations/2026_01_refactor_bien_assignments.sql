-- 2026-01: Introduce unified bridging table for Bien assignments
CREATE TABLE IF NOT EXISTS bien_assignments (
  id INT NOT NULL AUTO_INCREMENT,
  bien_id INT NOT NULL,
  ubicacion_id INT NULL,
  usuario_id INT NULL,
  periodo_id INT NULL,
  fecha_asignacion DATETIME NULL,
  fecha_retiro DATETIME NULL,
  observaciones TEXT,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (bien_id) REFERENCES bienes(id_bien) ON DELETE CASCADE,
  FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones(id_ubicacion) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
  FOREIGN KEY (periodo_id) REFERENCES periodos_academicos(id_periodo) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Migrate data from bien_ubicacion to bien_assignments
INSERT INTO bien_assignments (bien_id, ubicacion_id, periodo_id, fecha_asignacion, fecha_retiro, activo)
SELECT id_bien, id_ubicacion, NULL, fecha_asignacion, fecha_retiro, activo
FROM bien_ubicacion;

-- Migrate data from bien_usuario to bien_assignments
INSERT INTO bien_assignments (bien_id, usuario_id, periodo_id, fecha_asignacion, fecha_retiro, activo)
SELECT id_bien, usuario_id, NULL, fecha_asignacion, fecha_devolucion, activo
FROM bien_usuario;

-- Optional: drop old tables (commented out to allow rollback)
-- DROP TABLE IF EXISTS bien_ubicacion;
-- DROP TABLE IF EXISTS bien_usuario;
