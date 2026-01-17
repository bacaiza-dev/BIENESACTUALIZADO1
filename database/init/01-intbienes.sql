-- =====================================================
-- SCHEMA NORMALIZADO - Sistema de Gestión de Bienes INT
-- Versión: 2.0 - Sin redundancias ni bucles circulares
-- =====================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `intbienes` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE `intbienes`;

-- Deshabilitar verificaciones FK temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. TABLAS BASE (Sin dependencias)
-- =====================================================

-- Departamentos
DROP TABLE IF EXISTS `departamentos`;
CREATE TABLE `departamentos` (
  `id_departamento` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT,
  `activo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id_rol` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_rol` VARCHAR(50) NOT NULL UNIQUE,
  `descripcion` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Permisos
DROP TABLE IF EXISTS `permisos`;
CREATE TABLE `permisos` (
  `id_permiso` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_permiso` VARCHAR(100) NOT NULL UNIQUE,
  `descripcion` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categorías
DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `id_categoria` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_categoria` VARCHAR(100) NOT NULL UNIQUE,
  `codigo` VARCHAR(50),
  `tipo` VARCHAR(50),
  `descripcion` TEXT,
  `observaciones` TEXT,
  `activo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ubicaciones
DROP TABLE IF EXISTS `ubicaciones`;
CREATE TABLE `ubicaciones` (
  `id_ubicacion` INT AUTO_INCREMENT PRIMARY KEY,
  `area` VARCHAR(100) NOT NULL UNIQUE,
  `numero_aula` VARCHAR(20),
  `piso` VARCHAR(20),
  `sede` VARCHAR(100),
  `descripcion` TEXT,
  `tipo` ENUM('oficina','laboratorio','aula','biblioteca','almacen','otro') DEFAULT 'oficina',
  `capacidad` INT DEFAULT 0,
  `activo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Períodos Académicos
DROP TABLE IF EXISTS `periodos_academicos`;
CREATE TABLE `periodos_academicos` (
  `id_periodo` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_periodo` VARCHAR(100) NOT NULL,
  `fecha_inicio` DATE,
  `fecha_fin` DATE,
  `activo` TINYINT(1) DEFAULT 1,
  `anio` INT,
  `tipo` VARCHAR(20) DEFAULT 'anual',
  `descripcion` TEXT,
  `observaciones` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. TABLA DE USUARIOS (Depende de: departamentos, roles)
-- =====================================================

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE `usuarios` (
  `id_usuario` INT AUTO_INCREMENT PRIMARY KEY,
  `nombres` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(100),
  `cedula` VARCHAR(20) UNIQUE,
  `email` VARCHAR(100) UNIQUE,
  `telefono` VARCHAR(20),
  `password_hash` VARCHAR(255) NOT NULL,
  `rol_id` INT DEFAULT 2,
  `activo` TINYINT(1) DEFAULT 1,
  `departamento_id` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  CONSTRAINT `fk_usuarios_departamento` FOREIGN KEY (`departamento_id`) 
    REFERENCES `departamentos`(`id_departamento`) ON DELETE SET NULL,
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) 
    REFERENCES `roles`(`id_rol`) ON DELETE SET NULL,
  
  -- Índices
  INDEX `idx_usuarios_email` (`email`),
  INDEX `idx_usuarios_cedula` (`cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. TABLA DE BIENES (Depende de: categorias, periodos, ubicaciones, usuarios)
-- =====================================================

DROP TABLE IF EXISTS `bienes`;
CREATE TABLE `bienes` (
  `id_bien` INT AUTO_INCREMENT PRIMARY KEY,
  `codigo_institucional` VARCHAR(50) NOT NULL UNIQUE,
  `nombre` VARCHAR(255) NOT NULL,
  `descripcion` TEXT,
  `marca` VARCHAR(100),
  `modelo` VARCHAR(100),
  `serie` VARCHAR(100),
  `estado` ENUM('ACTIVO','INACTIVO','BAJA','MANTENIMIENTO','TRANSFERIDO') NOT NULL DEFAULT 'ACTIVO',
  `valor` DECIMAL(12,2) DEFAULT 0.00,
  `fecha_adquisicion` DATE,
  `vida_util` INT,
  `valor_residual` DECIMAL(12,2),
  `depreciacion_acumulada` DECIMAL(12,2) DEFAULT 0.00,
  `observaciones` TEXT,
  `codigo_senescyt` VARCHAR(50),
  `nro_acta_entrega_recepcion` VARCHAR(50),
  `nro_acta_constatacion_fisica` VARCHAR(50),
  `color` VARCHAR(50),
  `material` VARCHAR(50),
  `proveedor` VARCHAR(150),
  `anio_fabricacion` INT,
  `clase_de_bien` VARCHAR(150),
  
  -- FK: Relaciones directas (SIN REDUNDANCIA)
  `categoria_id` INT,
  `ubicacion_id` INT,
  `responsable_id` INT,
  `periodo_id` INT,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign Keys (AHORA SÍ DEFINIDOS)
  CONSTRAINT `fk_bienes_categoria` FOREIGN KEY (`categoria_id`) 
    REFERENCES `categorias`(`id_categoria`) ON DELETE SET NULL,
  CONSTRAINT `fk_bienes_ubicacion` FOREIGN KEY (`ubicacion_id`) 
    REFERENCES `ubicaciones`(`id_ubicacion`) ON DELETE SET NULL,
  CONSTRAINT `fk_bienes_responsable` FOREIGN KEY (`responsable_id`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL,
  CONSTRAINT `fk_bienes_periodo` FOREIGN KEY (`periodo_id`) 
    REFERENCES `periodos_academicos`(`id_periodo`) ON DELETE SET NULL,
  
  -- Índices
  INDEX `idx_bienes_codigo` (`codigo_institucional`),
  INDEX `idx_bienes_estado` (`estado`),
  INDEX `idx_bienes_categoria` (`categoria_id`),
  INDEX `idx_bienes_ubicacion` (`ubicacion_id`),
  INDEX `idx_bienes_responsable` (`responsable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TABLAS DEPENDIENTES DE BIENES
-- =====================================================

-- Alertas
DROP TABLE IF EXISTS `alertas`;
CREATE TABLE `alertas` (
  `id_alerta` INT AUTO_INCREMENT PRIMARY KEY,
  `id_bien` INT,
  `tipo_alerta` VARCHAR(50),
  `prioridad` ENUM('baja','media','alta','critica') DEFAULT 'media',
  `descripcion` TEXT,
  `estado` ENUM('pendiente','en_proceso','resuelta','cerrada') DEFAULT 'pendiente',
  `fecha_alerta` DATE,
  `fecha_resolucion` DATE,
  
  CONSTRAINT `fk_alertas_bien` FOREIGN KEY (`id_bien`) 
    REFERENCES `bienes`(`id_bien`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mantenimientos
DROP TABLE IF EXISTS `mantenimientos`;
CREATE TABLE `mantenimientos` (
  `id_mantenimiento` INT AUTO_INCREMENT PRIMARY KEY,
  `id_bien` INT,
  `tipo` ENUM('preventivo','correctivo','predictivo') DEFAULT 'preventivo',
  `descripcion` TEXT,
  `fecha_programada` DATE,
  `fecha_limite` DATE,
  `fecha_realizada` DATE,
  `estado` ENUM('programado','en_proceso','completado','cancelado') DEFAULT 'programado',
  `responsable_id` INT,
  `costo_estimado` DECIMAL(12,2),
  `costo_real` DECIMAL(12,2),
  `prioridad` ENUM('baja','media','alta','critica') DEFAULT 'media',
  `observaciones` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_mantenimientos_bien` FOREIGN KEY (`id_bien`) 
    REFERENCES `bienes`(`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `fk_mantenimientos_responsable` FOREIGN KEY (`responsable_id`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documentos de bienes
DROP TABLE IF EXISTS `documentos_bien`;
CREATE TABLE `documentos_bien` (
  `id_documento` INT AUTO_INCREMENT PRIMARY KEY,
  `id_bien` INT,
  `subido_por` INT,
  `tipo_documento` VARCHAR(50),
  `nombre_archivo` VARCHAR(255),
  `url_archivo` VARCHAR(500),
  `descripcion` TEXT,
  `tamano` INT,
  `mime_type` VARCHAR(100),
  `uploaded_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_documentos_bien` FOREIGN KEY (`id_bien`) 
    REFERENCES `bienes`(`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `fk_documentos_usuario` FOREIGN KEY (`subido_por`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. TABLAS DE ASIGNACIONES (Aulas)
-- =====================================================

DROP TABLE IF EXISTS `aulas_asignadas`;
CREATE TABLE `aulas_asignadas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ubicacion_id` INT NOT NULL,
  `usuario_id` INT NOT NULL,
  `periodo_id` INT NOT NULL,
  `observaciones` TEXT,
  `activo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY `unique_aula_periodo` (`ubicacion_id`,`periodo_id`),
  
  CONSTRAINT `fk_aulas_ubicacion` FOREIGN KEY (`ubicacion_id`) 
    REFERENCES `ubicaciones`(`id_ubicacion`) ON DELETE CASCADE,
  CONSTRAINT `fk_aulas_usuario` FOREIGN KEY (`usuario_id`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `fk_aulas_periodo` FOREIGN KEY (`periodo_id`) 
    REFERENCES `periodos_academicos`(`id_periodo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TABLAS DE ROLES Y PERMISOS
-- =====================================================

DROP TABLE IF EXISTS `rol_permiso`;
CREATE TABLE `rol_permiso` (
  `id_rol` INT NOT NULL,
  `id_permiso` INT NOT NULL,
  PRIMARY KEY (`id_rol`, `id_permiso`),
  
  CONSTRAINT `fk_rolpermiso_rol` FOREIGN KEY (`id_rol`) 
    REFERENCES `roles`(`id_rol`) ON DELETE CASCADE,
  CONSTRAINT `fk_rolpermiso_permiso` FOREIGN KEY (`id_permiso`) 
    REFERENCES `permisos`(`id_permiso`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. TABLAS DE AUDITORÍA Y SISTEMA
-- =====================================================

DROP TABLE IF EXISTS `auditoria`;
CREATE TABLE `auditoria` (
  `id_auditoria` INT AUTO_INCREMENT PRIMARY KEY,
  `tabla_afectada` ENUM('usuarios','bienes','ubicaciones','categorias','mantenimientos','alertas') NOT NULL,
  `id_registro` INT,
  `accion` ENUM('CREATE','UPDATE','DELETE','LOGIN','LOGOUT','TRANSFER','VIEW') NOT NULL,
  `usuario_id` INT,
  `datos_anteriores` JSON,
  `datos_nuevos` JSON,
  `ip_address` VARCHAR(45),
  `user_agent` TEXT,
  `exitoso` TINYINT(1) DEFAULT 1,
  `descripcion` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`usuario_id`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL,
  
  INDEX `idx_auditoria_tabla` (`tabla_afectada`,`id_registro`),
  INDEX `idx_auditoria_usuario` (`usuario_id`),
  INDEX `idx_auditoria_fecha` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `reportes`;
CREATE TABLE `reportes` (
  `id_reporte` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `tipo` VARCHAR(50) NOT NULL,
  `parametros` JSON,
  `usuario_id` INT,
  `ruta_archivo` VARCHAR(500),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_reportes_usuario` FOREIGN KEY (`usuario_id`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id_setting` INT AUTO_INCREMENT PRIMARY KEY,
  `config` JSON,
  `updated_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_settings_usuario` FOREIGN KEY (`updated_by`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `support_messages`;
CREATE TABLE `support_messages` (
  `id_mensaje` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT,
  `nombre` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `asunto` VARCHAR(150),
  `mensaje` TEXT NOT NULL,
  `tipo` ENUM('consulta','soporte','sugerencia','queja') DEFAULT 'consulta',
  `estado` ENUM('pendiente','en_proceso','resuelto','cerrado') DEFAULT 'pendiente',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_support_usuario` FOREIGN KEY (`usuario_id`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. DATOS INICIALES
-- =====================================================

-- Departamentos
INSERT INTO `departamentos` (`id_departamento`, `nombre`, `descripcion`) VALUES
(1, 'Administración', 'Departamento administrativo'),
(2, 'Sistemas', 'Departamento de tecnología');

-- Roles
INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`) VALUES
(1, 'Administrador', 'Acceso total al sistema'),
(2, 'Usuario', 'Usuario estándar');

-- Permisos
INSERT INTO `permisos` (`id_permiso`, `nombre_permiso`, `descripcion`) VALUES
(1, 'ver_bienes', 'Puede ver bienes'),
(2, 'editar_bienes', 'Puede editar bienes'),
(3, 'eliminar_bienes', 'Puede eliminar bienes');

-- Rol-Permiso
INSERT INTO `rol_permiso` (`id_rol`, `id_permiso`) VALUES
(1, 1), (1, 2), (1, 3);

-- Categorías
INSERT INTO `categorias` (`id_categoria`, `nombre_categoria`, `codigo`, `tipo`, `descripcion`) VALUES
(1, 'Computadores', 'CAT-001', 'tecnologia', 'Equipos de cómputo'),
(2, 'Muebles', 'CAT-002', 'mobiliario', 'Mobiliario institucional');

-- Ubicaciones
INSERT INTO `ubicaciones` (`id_ubicacion`, `area`, `numero_aula`, `piso`, `sede`, `descripcion`, `tipo`, `capacidad`) VALUES
(1, 'Laboratorio 1', 'A101', '1', 'Sede Central', 'Laboratorio de computación', 'laboratorio', 30),
(2, 'Biblioteca', 'B201', '2', 'Sede Central', 'Biblioteca principal', 'biblioteca', 50);

-- Períodos
INSERT INTO `periodos_academicos` (`id_periodo`, `nombre_periodo`, `fecha_inicio`, `fecha_fin`, `anio`, `tipo`) VALUES
(1, '2024-2025', '2024-09-01', '2025-07-31', 2024, 'anual'),
(2, '2025-1', '2025-01-01', '2025-06-30', 2025, 'semestre'),
(3, '2025-2', '2025-07-01', '2025-12-31', 2025, 'semestre');

-- Usuario Admin
INSERT INTO `usuarios` (`id_usuario`, `nombres`, `apellidos`, `cedula`, `email`, `telefono`, `password_hash`, `rol_id`, `departamento_id`) VALUES
(1, 'Administrador', 'Sistema', '1234567890', 'admin@intsuperior.edu.ec', '0987654321', '$2b$12$5AGjCq9lxaaD47rArFQRm.3fxWV/ysWApaxAnxSkg7Zx/tMQu6Dte', 1, 2);

-- Bien de ejemplo
INSERT INTO `bienes` (`id_bien`, `codigo_institucional`, `nombre`, `descripcion`, `marca`, `modelo`, `serie`, `estado`, `valor`, `categoria_id`, `ubicacion_id`, `responsable_id`) VALUES
(1, 'INT-TEST-0001', 'Laptop de Prueba', 'Equipo portátil para pruebas', 'Dell', 'Inspiron 15', 'SN123456', 'ACTIVO', 1000.00, 1, 1, 1);

-- Habilitar verificaciones FK
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- NOTA: Las tablas `bien_ubicacion` y `bien_usuario` 
-- fueron ELIMINADAS porque eran redundantes
-- =====================================================
