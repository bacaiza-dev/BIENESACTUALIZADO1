-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: intbienes
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alertas`
--

DROP TABLE IF EXISTS `alertas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alertas` (
  `id_alerta` int NOT NULL AUTO_INCREMENT,
  `id_bien` int DEFAULT NULL,
  `tipo_alerta` varchar(50) DEFAULT NULL,
  `prioridad` enum('baja','media','alta','critica') DEFAULT 'media',
  `descripcion` text,
  `estado` enum('pendiente','en_proceso','resuelta','cerrada') DEFAULT 'pendiente',
  `fecha_alerta` date DEFAULT NULL,
  `fecha_resolucion` date DEFAULT NULL,
  PRIMARY KEY (`id_alerta`),
  KEY `id_bien` (`id_bien`),
  CONSTRAINT `alertas_ibfk_1` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas`
--

LOCK TABLES `alertas` WRITE;
/*!40000 ALTER TABLE `alertas` DISABLE KEYS */;
INSERT INTO `alertas` VALUES (1,1,'mantenimiento','alta','Mantenimiento preventivo requerido','pendiente','2026-01-16',NULL),(2,1,'depreciacion','media','Bien alcanzÃ³ depreciaciÃ³n del 50%','pendiente','2026-01-16',NULL),(3,1,'garantia','baja','GarantÃ­a prÃ³xima a vencer','en_proceso','2026-01-16',NULL);
/*!40000 ALTER TABLE `alertas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `tabla_afectada` enum('usuarios','bienes','ubicaciones','accesos','settings','reportes','categorias','mantenimientos') NOT NULL,
  `id_registro` int DEFAULT NULL,
  `accion` enum('CREATE','UPDATE','DELETE','LOGIN','LOGOUT','TRANSFER','VIEW') NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `datos_anteriores` json DEFAULT NULL,
  `datos_nuevos` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `exitoso` tinyint(1) DEFAULT '1',
  `descripcion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_auditoria_tabla` (`tabla_afectada`,`id_registro`),
  KEY `idx_auditoria_usuario` (`usuario_id`),
  KEY `idx_auditoria_fecha` (`created_at`),
  KEY `idx_auditoria_accion` (`accion`),
  CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `aulas_asignadas`
--

DROP TABLE IF EXISTS `aulas_asignadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `aulas_asignadas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ubicacion_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `periodo_id` int NOT NULL,
  `observaciones` text,
  `activo` tinyint DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_aula_periodo` (`ubicacion_id`,`periodo_id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `periodo_id` (`periodo_id`),
  CONSTRAINT `aulas_asignadas_ibfk_1` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id_ubicacion`),
  CONSTRAINT `aulas_asignadas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `aulas_asignadas_ibfk_3` FOREIGN KEY (`periodo_id`) REFERENCES `periodos_academicos` (`id_periodo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aulas_asignadas`
--

LOCK TABLES `aulas_asignadas` WRITE;
/*!40000 ALTER TABLE `aulas_asignadas` DISABLE KEYS */;
INSERT INTO `aulas_asignadas` VALUES (1,3,2,2,'n',1,'2026-01-16 07:32:25','2026-01-16 07:32:25');
/*!40000 ALTER TABLE `aulas_asignadas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bien_ubicacion`
--

DROP TABLE IF EXISTS `bien_ubicacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bien_ubicacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_bien` int NOT NULL,
  `id_ubicacion` int NOT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_retiro` timestamp NULL DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `observaciones` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bien_ubicacion_activo` (((case when (`activo` = 1) then `id_bien` else NULL end))),
  KEY `id_bien` (`id_bien`),
  KEY `id_ubicacion` (`id_ubicacion`),
  KEY `idx_bien_ubicacion_activo` (`id_bien`,`activo`),
  CONSTRAINT `bien_ubicacion_ibfk_1` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `bien_ubicacion_ibfk_2` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id_ubicacion`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bien_ubicacion`
--

LOCK TABLES `bien_ubicacion` WRITE;
/*!40000 ALTER TABLE `bien_ubicacion` DISABLE KEYS */;
INSERT INTO `bien_ubicacion` VALUES (1,1,1,'2025-07-04 22:36:08',NULL,1,'Asignacion inicial'),(2,2,2,'2026-01-16 02:01:15',NULL,1,NULL),(3,3,3,'2026-01-16 07:42:14',NULL,1,NULL);
/*!40000 ALTER TABLE `bien_ubicacion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bien_usuario`
--

DROP TABLE IF EXISTS `bien_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bien_usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_bien` int NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_devolucion` timestamp NULL DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `observaciones` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bien_usuario_activo` (((case when (`activo` = 1) then `id_bien` else NULL end))),
  KEY `id_bien` (`id_bien`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_bien_usuario_activo` (`id_bien`,`activo`),
  CONSTRAINT `bien_usuario_ibfk_1` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `bien_usuario_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bien_usuario`
--

LOCK TABLES `bien_usuario` WRITE;
/*!40000 ALTER TABLE `bien_usuario` DISABLE KEYS */;
INSERT INTO `bien_usuario` VALUES (1,1,1,'2025-07-04 22:36:08',NULL,1,'Asignacion inicial'),(2,2,2,'2026-01-16 02:01:15',NULL,1,NULL),(3,3,2,'2026-01-16 07:42:14',NULL,1,NULL);
/*!40000 ALTER TABLE `bien_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bienes`
--

DROP TABLE IF EXISTS `bienes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bienes` (
  `id_bien` int NOT NULL AUTO_INCREMENT,
  `codigo_institucional` varchar(50) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `marca` varchar(100) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `serie` varchar(100) DEFAULT NULL,
  `estado` enum('ACTIVO','INACTIVO','BAJA','MANTENIMIENTO','TRANSFERIDO') NOT NULL,
  `valor` decimal(12,2) DEFAULT NULL,
  `fecha_adquisicion` date DEFAULT NULL,
  `vida_util` int DEFAULT NULL,
  `valor_residual` decimal(12,2) DEFAULT NULL,
  `depreciacion_acumulada` decimal(12,2) DEFAULT NULL,
  `categoria_id` int DEFAULT NULL,
  `periodo_id` int DEFAULT NULL,
  `observaciones` text,
  `codigo_senescyt` varchar(50) DEFAULT NULL,
  `nro_acta_entrega_recepcion` varchar(50) DEFAULT NULL,
  `nro_acta_constatacion_fisica` varchar(50) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `material` varchar(50) DEFAULT NULL,
  `proveedor` varchar(150) DEFAULT NULL,
  `anio_fabricacion` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `clase_de_bien` varchar(150) DEFAULT NULL,
  `ubicacion_id` int DEFAULT NULL,
  `responsable_id` int DEFAULT NULL,
  PRIMARY KEY (`id_bien`),
  UNIQUE KEY `codigo_institucional` (`codigo_institucional`),
  KEY `periodo_id` (`periodo_id`),
  KEY `idx_bienes_estado` (`estado`),
  KEY `idx_bienes_codigo` (`codigo_institucional`),
  KEY `idx_bienes_categoria` (`categoria_id`),
  KEY `idx_bienes_nombre` (`nombre`(100)),
  KEY `idx_bienes_cat_estado` (`categoria_id`,`estado`),
  CONSTRAINT `bienes_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id_categoria`),
  CONSTRAINT `bienes_ibfk_4` FOREIGN KEY (`periodo_id`) REFERENCES `periodos_academicos` (`id_periodo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bienes`
--

LOCK TABLES `bienes` WRITE;
/*!40000 ALTER TABLE `bienes` DISABLE KEYS */;
INSERT INTO `bienes` VALUES (1,'INT-TEST-0001','Laptop de Prueba','Equipo port??til para pruebas','Dell','Inspiron 15','SN123456','ACTIVO',NULL,'2024-01-15',NULL,NULL,0.00,1,NULL,'Bien de prueba para desarrollo','SEN-0001','ACTA-001','CONST-001','Negro','Pl??stico',NULL,2024,'2025-07-04 22:36:08','2026-01-16 11:33:33',NULL,3,1),(2,'Prueba 20','HP Prueba 20','DSDFSF','Prueba HP','PRUEBA 2026','12345678900','ACTIVO',1000.00,'2021-01-15',5,NULL,NULL,2,1,'SDFDSF','1234567890','SDFSDFDSFS','KLJFAHFUEFJBFBUFJHK','SDFJLKJDSJF','FSKDFKJLKSD','ASDLDUUFJ',2026,'2026-01-16 02:01:15','2026-01-16 11:16:33','Computadores',2,2),(3,'123','123','12312','1313','3123123312','1323','MANTENIMIENTO',500.00,'2026-01-16',NULL,NULL,NULL,1,NULL,'wre','123',NULL,NULL,'rew','wer',NULL,NULL,'2026-01-16 07:42:14','2026-01-16 07:42:14',NULL,3,2),(4,'zdzs','dszz','zsdsz','zsdzsd','dszd','zsd','ACTIVO',NULL,'2026-01-16',NULL,NULL,NULL,1,NULL,'zsdzs','565656','zsdzsdz','dszd','zsd','zds',NULL,2025,'2026-01-16 11:00:14','2026-01-16 11:25:58',NULL,3,2);
/*!40000 ALTER TABLE `bienes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(100) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `descripcion` text,
  `observaciones` text,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre_categoria` (`nombre_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Computadores','CAT-001','tecnologia','Equipos de computo',NULL,1,'2025-07-04 22:36:08','2025-07-04 22:36:08'),(2,'Muebles','CAT-002','mobiliario','Mobiliario institucional',NULL,1,'2025-07-04 22:36:08','2025-07-04 22:36:08');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departamentos`
--

DROP TABLE IF EXISTS `departamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departamentos` (
  `id_departamento` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_departamento`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos`
--

LOCK TABLES `departamentos` WRITE;
/*!40000 ALTER TABLE `departamentos` DISABLE KEYS */;
INSERT INTO `departamentos` VALUES (1,'Administracion',NULL,1,'2025-07-04 22:36:08','2025-07-04 22:36:08'),(2,'Sistemas',NULL,1,'2025-07-04 22:36:08','2025-07-04 22:36:08');
/*!40000 ALTER TABLE `departamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_bien`
--

DROP TABLE IF EXISTS `documentos_bien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos_bien` (
  `id_documento` int NOT NULL AUTO_INCREMENT,
  `id_bien` int DEFAULT NULL,
  `subido_por` int DEFAULT NULL,
  `tipo_documento` varchar(50) DEFAULT NULL,
  `nombre_archivo` varchar(255) DEFAULT NULL,
  `url_archivo` varchar(500) DEFAULT NULL,
  `descripcion` text,
  `tamano` int DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_documento`),
  KEY `id_bien` (`id_bien`),
  KEY `subido_por` (`subido_por`),
  CONSTRAINT `documentos_bien_ibfk_1` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `documentos_bien_ibfk_2` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_bien`
--

LOCK TABLES `documentos_bien` WRITE;
/*!40000 ALTER TABLE `documentos_bien` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_bien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mantenimientos`
--

DROP TABLE IF EXISTS `mantenimientos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mantenimientos` (
  `id_mantenimiento` int NOT NULL AUTO_INCREMENT,
  `id_bien` int DEFAULT NULL,
  `tipo` enum('preventivo','correctivo','predictivo') DEFAULT 'preventivo',
  `descripcion` text,
  `fecha_programada` date DEFAULT NULL,
  `fecha_limite` date DEFAULT NULL,
  `fecha_realizada` date DEFAULT NULL,
  `estado` enum('programado','en_proceso','completado','cancelado') DEFAULT 'programado',
  `responsable_id` int DEFAULT NULL,
  `costo_estimado` decimal(12,2) DEFAULT NULL,
  `costo_real` decimal(12,2) DEFAULT NULL,
  `prioridad` enum('baja','media','alta','critica') DEFAULT 'media',
  `observaciones` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_mantenimiento`),
  KEY `id_bien` (`id_bien`),
  KEY `responsable_id` (`responsable_id`),
  CONSTRAINT `mantenimientos_ibfk_1` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `mantenimientos_ibfk_2` FOREIGN KEY (`responsable_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimientos`
--

LOCK TABLES `mantenimientos` WRITE;
/*!40000 ALTER TABLE `mantenimientos` DISABLE KEYS */;
INSERT INTO `mantenimientos` VALUES (1,2,'preventivo','Limpieza interna','2026-01-16','2026-01-22','2026-01-16','completado',1,50.00,NULL,'media','Nada','2026-01-16 05:43:20','2026-01-16 05:47:00');
/*!40000 ALTER TABLE `mantenimientos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `periodos_academicos`
--

DROP TABLE IF EXISTS `periodos_academicos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodos_academicos` (
  `id_periodo` int NOT NULL AUTO_INCREMENT,
  `nombre_periodo` varchar(100) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `anio` int DEFAULT NULL,
  `tipo` varchar(20) DEFAULT 'anual',
  `descripcion` text,
  `observaciones` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_periodo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos_academicos`
--

LOCK TABLES `periodos_academicos` WRITE;
/*!40000 ALTER TABLE `periodos_academicos` DISABLE KEYS */;
INSERT INTO `periodos_academicos` VALUES (1,'2024-2025','2024-09-01','2025-07-31',1,2024,'anual',NULL,NULL,'2025-07-04 22:36:08','2025-07-04 22:36:08'),(2,'2025-1','2025-01-01','2025-06-30',1,2025,'semestre','Primer semestre 2025',NULL,'2026-01-16 06:58:33','2026-01-16 06:58:33'),(3,'2025-2','2025-07-01','2025-12-31',1,2025,'semestre','Segundo semestre 2025',NULL,'2026-01-16 06:58:33','2026-01-16 06:58:33'),(4,'2026-1','2026-01-01','2026-06-30',1,2026,'semestre','Primer semestre 2026',NULL,'2026-01-16 06:58:33','2026-01-16 06:58:33');
/*!40000 ALTER TABLE `periodos_academicos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permisos`
--

DROP TABLE IF EXISTS `permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `permisos` (
  `id_permiso` int NOT NULL AUTO_INCREMENT,
  `nombre_permiso` varchar(100) NOT NULL,
  `descripcion` text,
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `nombre_permiso` (`nombre_permiso`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permisos`
--

LOCK TABLES `permisos` WRITE;
/*!40000 ALTER TABLE `permisos` DISABLE KEYS */;
INSERT INTO `permisos` VALUES (1,'ver_bienes','Puede ver bienes'),(2,'editar_bienes','Puede editar bienes'),(3,'eliminar_bienes','Puede eliminar bienes');
/*!40000 ALTER TABLE `permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportes`
--

DROP TABLE IF EXISTS `reportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportes` (
  `id_reporte` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `parametros` json DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `ruta_archivo` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_reporte`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes`
--

LOCK TABLES `reportes` WRITE;
/*!40000 ALTER TABLE `reportes` DISABLE KEYS */;
INSERT INTO `reportes` VALUES (1,'Reporte','general',NULL,2,NULL,'2026-01-16 05:56:51'),(2,'Reporte','general',NULL,2,NULL,'2026-01-16 06:48:59');
/*!40000 ALTER TABLE `reportes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rol_permiso`
--

DROP TABLE IF EXISTS `rol_permiso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol_permiso` (
  `id_rol` int NOT NULL,
  `id_permiso` int NOT NULL,
  PRIMARY KEY (`id_rol`,`id_permiso`),
  KEY `id_permiso` (`id_permiso`),
  CONSTRAINT `rol_permiso_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE,
  CONSTRAINT `rol_permiso_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id_permiso`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rol_permiso`
--

LOCK TABLES `rol_permiso` WRITE;
/*!40000 ALTER TABLE `rol_permiso` DISABLE KEYS */;
INSERT INTO `rol_permiso` VALUES (1,1),(1,2),(1,3);
/*!40000 ALTER TABLE `rol_permiso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador','Acceso total al sistema'),(2,'Usuario','Usuario est??ndar');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id_setting` int NOT NULL AUTO_INCREMENT,
  `config` json DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_setting`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `support_messages`
--

DROP TABLE IF EXISTS `support_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `support_messages` (
  `id_mensaje` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `asunto` varchar(150) DEFAULT NULL,
  `mensaje` text NOT NULL,
  `tipo` enum('consulta','soporte','sugerencia','queja') DEFAULT 'consulta',
  `estado` enum('pendiente','en_proceso','resuelto','cerrado') DEFAULT 'pendiente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_mensaje`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `support_messages_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `support_messages`
--

LOCK TABLES `support_messages` WRITE;
/*!40000 ALTER TABLE `support_messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `support_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicaciones`
--

DROP TABLE IF EXISTS `ubicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicaciones` (
  `id_ubicacion` int NOT NULL AUTO_INCREMENT,
  `area` varchar(100) NOT NULL,
  `numero_aula` varchar(20) DEFAULT NULL,
  `piso` varchar(20) DEFAULT NULL,
  `sede` varchar(100) DEFAULT NULL,
  `descripcion` text,
  `tipo` enum('oficina','laboratorio','aula','biblioteca','almacen','otro') DEFAULT 'oficina',
  `capacidad` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_ubicacion`),
  UNIQUE KEY `uk_area` (`area`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones`
--

LOCK TABLES `ubicaciones` WRITE;
/*!40000 ALTER TABLE `ubicaciones` DISABLE KEYS */;
INSERT INTO `ubicaciones` VALUES (1,'Laboratorio 1','A101','1','Sede Central','Laboratorio de computaci??n','laboratorio',30,1,'2025-07-04 22:36:08','2025-07-04 22:36:08'),(2,'Biblioteca','B201','2','Sede Central','Biblioteca principal','biblioteca',50,1,'2025-07-04 22:36:08','2025-07-04 22:36:08'),(3,'A','18','1','1','SIN NOVEDAD','aula',30,1,'2026-01-16 07:22:56','2026-01-16 07:22:56');
/*!40000 ALTER TABLE `ubicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) DEFAULT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol_id` int DEFAULT '2',
  `activo` tinyint(1) DEFAULT '1',
  `departamento_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `cedula` (`cedula`),
  UNIQUE KEY `email` (`email`),
  KEY `departamento_id` (`departamento_id`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id_departamento`) ON DELETE SET NULL,
  CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id_rol`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Jhonatan','Baño','1728163455','jhonatan.bano@intsuperior.edu.ec',NULL,'$2b$12$nMWLsKTVR2z0D5zvU.gCC.3C0XsFKGKvhosmFrKIQbMi2zMs6FFA.',2,1,2,'2025-07-04 22:36:08','2026-01-16 06:40:48'),(2,'Administrador','Sistema','1234567890','admin@intsuperior.edu.ec',NULL,'$2b$12$5AGjCq9lxaaD47rArFQRm.3fxWV/ysWApaxAnxSkg7Zx/tMQu6Dte',1,1,2,'2025-07-04 22:48:44','2025-07-06 21:56:32');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-16  8:09:05
