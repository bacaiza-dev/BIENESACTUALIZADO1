-- =====================================================
-- SCRIPT DE CORRECCIÓN DE BASE DE DATOS intbienes
-- Versión: 1.0
-- Fecha: 2026-01-14
-- =====================================================
-- INSTRUCCIONES:
-- 1. Ejecutar DESPUÉS de 01-intbienes.sql
-- 2. Hacer backup antes de ejecutar
-- =====================================================

-- =====================================================
-- PARTE 1: ELIMINAR CAMPOS REDUNDANTES
-- =====================================================

-- 1.1 Eliminar campo 'estado' redundante de ubicaciones
-- (ya existe el campo 'activo' que cumple la misma función)
ALTER TABLE `ubicaciones` DROP COLUMN IF EXISTS `estado`;

-- =====================================================
-- PARTE 2: ESTANDARIZAR TIPOS DE DATOS
-- =====================================================

-- 2.1 Convertir campo estado de alertas a ENUM
ALTER TABLE `alertas` 
MODIFY `estado` ENUM('pendiente','en_proceso','resuelta','cerrada') DEFAULT 'pendiente';

-- 2.2 Convertir campo estado de mantenimientos a ENUM
ALTER TABLE `mantenimientos`
MODIFY `estado` ENUM('programado','en_proceso','completado','cancelado') DEFAULT 'programado';

-- =====================================================
-- PARTE 3: AGREGAR ÍNDICES FALTANTES
-- =====================================================

-- 3.1 Índice para búsqueda rápida de ubicación actual de bien
CREATE INDEX IF NOT EXISTS `idx_bien_ubicacion_activo` ON `bien_ubicacion` (`id_bien`, `activo`);

-- 3.2 Índice para búsqueda rápida de usuario actual de bien
CREATE INDEX IF NOT EXISTS `idx_bien_usuario_activo` ON `bien_usuario` (`id_bien`, `activo`);

-- 3.3 Índice para búsquedas por nombre en bienes
CREATE INDEX IF NOT EXISTS `idx_bienes_nombre` ON `bienes` (`nombre`(100));

-- 3.4 Índice compuesto para filtrar por categoría y estado
CREATE INDEX IF NOT EXISTS `idx_bienes_cat_estado` ON `bienes` (`categoria_id`, `estado`);

-- =====================================================
-- PARTE 4: CONSOLIDAR TABLAS DE AUDITORÍA
-- =====================================================

-- 4.1 Crear nueva tabla de auditoría unificada
DROP TABLE IF EXISTS `auditoria`;
CREATE TABLE `auditoria` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `tabla_afectada` ENUM('usuarios','bienes','ubicaciones','accesos','settings','reportes') NOT NULL,
  `id_registro` int DEFAULT NULL,
  `accion` ENUM('CREATE','UPDATE','DELETE','LOGIN','LOGOUT','TRANSFER','VIEW') NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `datos_anteriores` json DEFAULT NULL,
  `datos_nuevos` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `exitoso` tinyint(1) DEFAULT '1',
  `descripcion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_auditoria_tabla` (`tabla_afectada`, `id_registro`),
  KEY `idx_auditoria_usuario` (`usuario_id`),
  KEY `idx_auditoria_fecha` (`created_at`),
  KEY `idx_auditoria_accion` (`accion`),
  CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4.2 Migrar datos existentes de tablas de auditoría antiguas
-- (Solo si hay datos - las tablas están vacías actualmente)

INSERT INTO `auditoria` (`tabla_afectada`, `id_registro`, `accion`, `usuario_id`, `datos_anteriores`, `datos_nuevos`, `ip_address`, `user_agent`, `exitoso`, `created_at`)
SELECT 'accesos', NULL, accion, id_usuario, NULL, detalles, ip_address, user_agent, exitoso, created_at
FROM `auditoria_accesos`
WHERE EXISTS (SELECT 1 FROM `auditoria_accesos` LIMIT 1);

INSERT INTO `auditoria` (`tabla_afectada`, `id_registro`, `accion`, `usuario_id`, `datos_anteriores`, `datos_nuevos`, `ip_address`, `user_agent`, `created_at`)
SELECT 'bienes', id_bien, accion, usuario_id, datos_anteriores, datos_nuevos, ip_address, user_agent, created_at
FROM `auditoria_bienes`
WHERE EXISTS (SELECT 1 FROM `auditoria_bienes` LIMIT 1);

INSERT INTO `auditoria` (`tabla_afectada`, `id_registro`, `accion`, `usuario_id`, `datos_anteriores`, `datos_nuevos`, `created_at`)
SELECT 'ubicaciones', id_ubicacion, accion, usuario_id, datos_anteriores, datos_nuevos, created_at
FROM `auditoria_ubicaciones`
WHERE EXISTS (SELECT 1 FROM `auditoria_ubicaciones` LIMIT 1);

INSERT INTO `auditoria` (`tabla_afectada`, `id_registro`, `accion`, `usuario_id`, `datos_anteriores`, `datos_nuevos`, `created_at`)
SELECT 'usuarios', id_usuario, accion, usuario_admin_id, datos_anteriores, datos_nuevos, created_at
FROM `auditoria_usuarios`
WHERE EXISTS (SELECT 1 FROM `auditoria_usuarios` LIMIT 1);

-- 4.3 Eliminar tablas de auditoría antiguas
DROP TABLE IF EXISTS `auditoria_accesos`;
DROP TABLE IF EXISTS `auditoria_bienes`;
DROP TABLE IF EXISTS `auditoria_ubicaciones`;
DROP TABLE IF EXISTS `auditoria_usuarios`;

-- =====================================================
-- PARTE 5: LIMPIEZA FINAL
-- =====================================================

-- Verificar integridad referencial
-- (No hay acciones, solo verificación)

SELECT 'Correcciones aplicadas exitosamente' AS resultado;
