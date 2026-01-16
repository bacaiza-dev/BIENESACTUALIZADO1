-- =====================================================
-- SCRIPT DE MIGRACIÓN: usuarios.rol (ENUM) → usuarios.rol_id (FK)
-- Ejecutar en la base de datos EXISTENTE
-- =====================================================

-- 1. Agregar columna rol_id si no existe
ALTER TABLE `usuarios` ADD COLUMN IF NOT EXISTS `rol_id` int DEFAULT 2;

-- 2. Agregar índice y FK (ignorar errores si ya existe)
-- Primero agregar el índice
ALTER TABLE `usuarios` ADD INDEX IF NOT EXISTS `rol_id` (`rol_id`);

-- 3. Migrar datos de rol (ENUM) a rol_id (FK)
-- Usuario con rol 'Administrador' -> rol_id = 1
UPDATE `usuarios` SET `rol_id` = 1 WHERE `rol` = 'Administrador';
-- Usuario con rol 'Usuario' -> rol_id = 2
UPDATE `usuarios` SET `rol_id` = 2 WHERE `rol` = 'Usuario' OR `rol` IS NULL;

-- 4. Agregar FK (si no existe)
-- Nota: MySQL no soporta IF NOT EXISTS para CONSTRAINT, así que ignoramos error
ALTER TABLE `usuarios` 
ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id_rol`) ON DELETE SET NULL;

-- 5. (OPCIONAL) Eliminar la columna rol antigua después de verificar que todo funciona
-- ALTER TABLE `usuarios` DROP COLUMN `rol`;

SELECT 'Migración completada. La columna rol_id ahora tiene los valores correctos.' AS resultado;
SELECT u.id_usuario, u.nombres, u.rol_id, r.nombre_rol 
FROM usuarios u 
LEFT JOIN roles r ON u.rol_id = r.id_rol;
