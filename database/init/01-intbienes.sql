-- =====================================================
-- SCHEMA NORMALIZADO V3 - SIN CICLOS CIRCULARES
-- Sistema de Gestión de Bienes INT
-- =====================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `intbienes` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `intbienes`;

SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- NIVEL 0: TABLAS INDEPENDIENTES (Sin FK a otras)
-- =====================================================

DROP TABLE IF EXISTS `departamentos`;
CREATE TABLE `departamentos` (
  `id_departamento` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT,
  `activo` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id_rol` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_rol` VARCHAR(50) NOT NULL UNIQUE,
  `descripcion` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `permisos`;
CREATE TABLE `permisos` (
  `id_permiso` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre_permiso` VARCHAR(100) NOT NULL UNIQUE,
  `descripcion` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- NIVEL 1: USUARIOS (Depende solo de NIVEL 0)
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
  
  CONSTRAINT `fk_usuarios_departamento` FOREIGN KEY (`departamento_id`) 
    REFERENCES `departamentos`(`id_departamento`) ON DELETE SET NULL,
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) 
    REFERENCES `roles`(`id_rol`) ON DELETE SET NULL,
  
  INDEX `idx_usuarios_email` (`email`),
  INDEX `idx_usuarios_cedula` (`cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- NIVEL 2: BIENES (Depende de NIVEL 0 y NIVEL 1)
-- SIN FK a usuarios para evitar ciclos
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
  
  -- FK solo a tablas de NIVEL 0 (sin ciclos)
  `categoria_id` INT,
  `ubicacion_id` INT,
  `periodo_id` INT,
  
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_bienes_categoria` FOREIGN KEY (`categoria_id`) 
    REFERENCES `categorias`(`id_categoria`) ON DELETE SET NULL,
  CONSTRAINT `fk_bienes_ubicacion` FOREIGN KEY (`ubicacion_id`) 
    REFERENCES `ubicaciones`(`id_ubicacion`) ON DELETE SET NULL,
  CONSTRAINT `fk_bienes_periodo` FOREIGN KEY (`periodo_id`) 
    REFERENCES `periodos_academicos`(`id_periodo`) ON DELETE SET NULL,
  
  INDEX `idx_bienes_codigo` (`codigo_institucional`),
  INDEX `idx_bienes_estado` (`estado`),
  INDEX `idx_bienes_categoria` (`categoria_id`),
  INDEX `idx_bienes_ubicacion` (`ubicacion_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- NIVEL 3: TABLAS DE RELACIÓN (Dependen de NIVEL 1 y 2)
-- Estas NO crean ciclos porque son hojas del árbol
-- =====================================================

-- Asignación de responsable a bien (reemplaza bienes.responsable_id)
DROP TABLE IF EXISTS `asignaciones_bien`;
CREATE TABLE `asignaciones_bien` (
  `id_asignacion` INT AUTO_INCREMENT PRIMARY KEY,
  `id_bien` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  `fecha_asignacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_devolucion` TIMESTAMP NULL,
  `activo` TINYINT(1) DEFAULT 1,
  `observaciones` TEXT,
  
  CONSTRAINT `fk_asigbien_bien` FOREIGN KEY (`id_bien`) 
    REFERENCES `bienes`(`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `fk_asigbien_usuario` FOREIGN KEY (`id_usuario`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE CASCADE,
  
  UNIQUE KEY `uk_bien_activo` ((CASE WHEN `activo` = 1 THEN `id_bien` ELSE NULL END))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alertas (hoja - solo depende de bienes)
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

-- Mantenimientos (hoja - depende de bienes y usuarios sin crear ciclo)
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
  `tecnico_id` INT,
  `costo_estimado` DECIMAL(12,2),
  `costo_real` DECIMAL(12,2),
  `prioridad` ENUM('baja','media','alta','critica') DEFAULT 'media',
  `observaciones` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_mant_bien` FOREIGN KEY (`id_bien`) 
    REFERENCES `bienes`(`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `fk_mant_tecnico` FOREIGN KEY (`tecnico_id`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Documentos (hoja)
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
  
  CONSTRAINT `fk_doc_bien` FOREIGN KEY (`id_bien`) 
    REFERENCES `bienes`(`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `fk_doc_usuario` FOREIGN KEY (`subido_por`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Aulas asignadas (hoja)
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
-- NIVEL 4: TABLAS DE SISTEMA (Solo dependen de usuarios)
-- =====================================================

DROP TABLE IF EXISTS `rol_permiso`;
CREATE TABLE `rol_permiso` (
  `id_rol` INT NOT NULL,
  `id_permiso` INT NOT NULL,
  PRIMARY KEY (`id_rol`, `id_permiso`),
  
  CONSTRAINT `fk_rp_rol` FOREIGN KEY (`id_rol`) 
    REFERENCES `roles`(`id_rol`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_permiso` FOREIGN KEY (`id_permiso`) 
    REFERENCES `permisos`(`id_permiso`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `auditoria`;
CREATE TABLE `auditoria` (
  `id_auditoria` INT AUTO_INCREMENT PRIMARY KEY,
  `tabla_afectada` VARCHAR(50) NOT NULL,
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
  
  CONSTRAINT `fk_audit_usuario` FOREIGN KEY (`usuario_id`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL,
  
  INDEX `idx_audit_tabla` (`tabla_afectada`,`id_registro`),
  INDEX `idx_audit_fecha` (`created_at`)
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
  
  CONSTRAINT `fk_rep_usuario` FOREIGN KEY (`usuario_id`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id_setting` INT AUTO_INCREMENT PRIMARY KEY,
  `config` JSON,
  `updated_by` INT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_set_usuario` FOREIGN KEY (`updated_by`) 
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
  
  CONSTRAINT `fk_sup_usuario` FOREIGN KEY (`usuario_id`) 
    REFERENCES `usuarios`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

INSERT INTO `departamentos` (`id_departamento`, `nombre`, `descripcion`) VALUES
(1, 'Administración', 'Departamento administrativo'),
(2, 'Sistemas', 'Departamento de tecnología');

INSERT INTO `roles` (`id_rol`, `nombre_rol`, `descripcion`) VALUES
(1, 'Administrador', 'Acceso total al sistema'),
(2, 'Usuario', 'Usuario estándar');

INSERT INTO `permisos` (`id_permiso`, `nombre_permiso`, `descripcion`) VALUES
(1, 'ver_bienes', 'Puede ver bienes'),
(2, 'editar_bienes', 'Puede editar bienes'),
(3, 'eliminar_bienes', 'Puede eliminar bienes');

INSERT INTO `rol_permiso` (`id_rol`, `id_permiso`) VALUES
(1, 1), (1, 2), (1, 3);

INSERT INTO `categorias` (`id_categoria`, `nombre_categoria`, `codigo`, `tipo`, `descripcion`) VALUES
(1, 'Computadores', 'CAT-001', 'tecnologia', 'Equipos de cómputo'),
(2, 'Muebles', 'CAT-002', 'mobiliario', 'Mobiliario institucional');

INSERT INTO `ubicaciones` (`id_ubicacion`, `area`, `numero_aula`, `piso`, `sede`, `descripcion`, `tipo`, `capacidad`) VALUES
(1, 'Laboratorio 1', 'A101', '1', 'Sede Central', 'Laboratorio de computación', 'laboratorio', 30),
(2, 'Biblioteca', 'B201', '2', 'Sede Central', 'Biblioteca principal', 'biblioteca', 50);

INSERT INTO `periodos_academicos` (`id_periodo`, `nombre_periodo`, `fecha_inicio`, `fecha_fin`, `anio`, `tipo`) VALUES
(1, '2024-2025', '2024-09-01', '2025-07-31', 2024, 'anual'),
(2, '2025-1', '2025-01-01', '2025-06-30', 2025, 'semestre'),
(3, '2025-2', '2025-07-01', '2025-12-31', 2025, 'semestre');

INSERT INTO `usuarios` (`id_usuario`, `nombres`, `apellidos`, `cedula`, `email`, `telefono`, `password_hash`, `rol_id`, `departamento_id`) VALUES
(1, 'Administrador', 'Sistema', '1234567890', 'admin@intsuperior.edu.ec', '0987654321', '$2b$12$5AGjCq9lxaaD47rArFQRm.3fxWV/ysWApaxAnxSkg7Zx/tMQu6Dte', 1, 2);

INSERT INTO `bienes` (`id_bien`, `codigo_institucional`, `nombre`, `descripcion`, `marca`, `modelo`, `serie`, `estado`, `valor`, `categoria_id`, `ubicacion_id`) VALUES
(1, 'INT-TEST-0001', 'Laptop de Prueba', 'Equipo portátil para pruebas', 'Dell', 'Inspiron 15', 'SN123456', 'ACTIVO', 1000.00, 1, 1);

-- Asignar responsable al bien (usando la nueva tabla)
INSERT INTO `asignaciones_bien` (`id_bien`, `id_usuario`, `observaciones`) VALUES
(1, 1, 'Asignación inicial');

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- ESTRUCTURA JERÁRQUICA SIN CICLOS:
--
-- NIVEL 0: departamentos, roles, permisos, categorias, 
--          ubicaciones, periodos_academicos
--          (Sin dependencias)
--
-- NIVEL 1: usuarios
--          (Depende de: departamentos, roles)
--
-- NIVEL 2: bienes
--          (Depende de: categorias, ubicaciones, periodos)
--          [NO depende de usuarios - evita ciclo]
--
-- NIVEL 3: asignaciones_bien, alertas, mantenimientos,
--          documentos_bien, aulas_asignadas
--          (Hojas del árbol - no generan ciclos)
--
-- NIVEL 4: auditoria, reportes, settings, support_messages
--          (Solo dependen de usuarios)
--
-- =====================================================
