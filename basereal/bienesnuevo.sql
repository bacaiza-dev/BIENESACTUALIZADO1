-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: intbienes
-- ------------------------------------------------------
-- Server version	8.0.45

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
  `tipo_alerta` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prioridad` enum('baja','media','alta','critica') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `estado` enum('pendiente','en_proceso','resuelta','cerrada') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `fecha_alerta` date DEFAULT NULL,
  `fecha_resolucion` date DEFAULT NULL,
  PRIMARY KEY (`id_alerta`),
  KEY `fk_alertas_bien` (`id_bien`),
  CONSTRAINT `fk_alertas_bien` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas`
--

LOCK TABLES `alertas` WRITE;
/*!40000 ALTER TABLE `alertas` DISABLE KEYS */;
/*!40000 ALTER TABLE `alertas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `areas`
--

DROP TABLE IF EXISTS `areas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `areas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `areas`
--

LOCK TABLES `areas` WRITE;
/*!40000 ALTER TABLE `areas` DISABLE KEYS */;
INSERT INTO `areas` VALUES (1,'Desarrollo de software',NULL,'2026-02-05 01:34:53'),(2,'Administración',NULL,'2026-02-05 01:34:53'),(3,'Diseño gráfico',NULL,'2026-02-05 01:34:53'),(4,'Área administrativa int',NULL,'2026-02-05 01:34:53'),(5,'Área rectorado',NULL,'2026-02-05 01:34:53'),(6,'Área aseo',NULL,'2026-02-05 01:34:53'),(8,'rer','sds','2026-02-05 02:11:33');
/*!40000 ALTER TABLE `areas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asignaciones_bien`
--

DROP TABLE IF EXISTS `asignaciones_bien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignaciones_bien` (
  `id_asignacion` int NOT NULL AUTO_INCREMENT,
  `id_bien` int NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_devolucion` timestamp NULL DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_asignacion`),
  UNIQUE KEY `uk_bien_activo` (((case when (`activo` = 1) then `id_bien` else NULL end))),
  KEY `fk_asigbien_bien` (`id_bien`),
  KEY `fk_asigbien_usuario` (`id_usuario`),
  CONSTRAINT `fk_asigbien_bien` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `fk_asigbien_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asignaciones_bien`
--

LOCK TABLES `asignaciones_bien` WRITE;
/*!40000 ALTER TABLE `asignaciones_bien` DISABLE KEYS */;
INSERT INTO `asignaciones_bien` VALUES (88,80,8,'2026-02-10 00:36:02',NULL,1,'Asignación inicial'),(89,81,8,'2026-02-10 00:38:12',NULL,1,'Asignación inicial'),(90,82,8,'2026-02-10 00:42:27',NULL,1,'Asignación inicial'),(91,83,8,'2026-02-10 00:45:35',NULL,1,'Asignación inicial'),(92,84,8,'2026-02-10 00:51:10',NULL,1,'Asignación inicial'),(93,85,8,'2026-02-10 00:54:03',NULL,1,'Asignación inicial'),(94,86,8,'2026-02-10 00:57:43',NULL,1,'Asignación inicial'),(95,87,8,'2026-02-10 00:59:19',NULL,1,'Asignación inicial'),(96,88,8,'2026-02-10 01:04:05',NULL,1,'Asignación inicial'),(97,89,8,'2026-02-10 01:08:57',NULL,1,'Asignación inicial'),(98,90,8,'2026-02-10 01:15:54',NULL,1,'Asignación inicial'),(99,91,8,'2026-02-10 01:19:26',NULL,1,'Asignación inicial'),(100,92,8,'2026-02-10 01:22:57',NULL,1,'Asignación inicial'),(101,93,8,'2026-02-10 01:24:58',NULL,1,'Asignación inicial'),(102,94,8,'2026-02-10 01:27:33',NULL,1,'Asignación inicial'),(103,95,8,'2026-02-10 01:30:17',NULL,1,'Asignación inicial'),(104,96,8,'2026-02-10 01:32:43',NULL,1,'Asignación inicial'),(105,97,8,'2026-02-10 01:35:05',NULL,1,'Asignación inicial'),(106,98,8,'2026-02-10 01:37:20',NULL,1,'Asignación inicial'),(107,99,8,'2026-02-10 01:42:26',NULL,1,'Asignación inicial'),(108,100,8,'2026-02-10 01:43:34',NULL,1,'Asignación inicial'),(109,101,8,'2026-02-10 01:45:24',NULL,1,'Asignación inicial'),(110,102,8,'2026-02-10 01:48:30',NULL,1,'Asignación inicial'),(111,103,8,'2026-02-10 01:54:40',NULL,1,'Asignación inicial'),(112,104,8,'2026-02-10 01:59:32',NULL,1,'Asignación inicial');
/*!40000 ALTER TABLE `asignaciones_bien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_responsables`
--

DROP TABLE IF EXISTS `historial_responsables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_responsables` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_bien` int NOT NULL,
  `id_usuario_anterior` int DEFAULT NULL,
  `id_usuario_nuevo` int DEFAULT NULL,
  `responsable_anterior` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `responsable_nuevo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_cambio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `motivo` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_que_cambio` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_id_bien` (`id_bien`),
  KEY `idx_fecha_cambio` (`fecha_cambio`),
  KEY `fk_historial_bien` (`id_bien`),
  KEY `fk_historial_anterior` (`id_usuario_anterior`),
  KEY `fk_historial_nuevo` (`id_usuario_nuevo`),
  KEY `fk_historial_usuario_cambio` (`usuario_que_cambio`),
  CONSTRAINT `fk_historial_bien` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `fk_historial_anterior` FOREIGN KEY (`id_usuario_anterior`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  CONSTRAINT `fk_historial_nuevo` FOREIGN KEY (`id_usuario_nuevo`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL,
  CONSTRAINT `fk_historial_usuario_cambio` FOREIGN KEY (`usuario_que_cambio`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_responsables`
--

LOCK TABLES `historial_responsables` WRITE;
/*!40000 ALTER TABLE `historial_responsables` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_responsables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id_auditoria` int NOT NULL AUTO_INCREMENT,
  `tabla_afectada` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_registro` int DEFAULT NULL,
  `accion` enum('CREATE','UPDATE','DELETE','LOGIN','LOGOUT','TRANSFER','VIEW') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `datos_anteriores` json DEFAULT NULL,
  `datos_nuevos` json DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `exitoso` tinyint(1) DEFAULT '1',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_auditoria`),
  KEY `fk_audit_usuario` (`usuario_id`),
  KEY `idx_audit_tabla` (`tabla_afectada`,`id_registro`),
  KEY `idx_audit_fecha` (`created_at`),
  CONSTRAINT `fk_audit_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria_selecciones`
--

DROP TABLE IF EXISTS `auditoria_selecciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria_selecciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_bien` int NOT NULL,
  `fecha_seleccion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('seleccionado','en_auditoria','completado') DEFAULT 'seleccionado',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_usuario_bien` (`id_usuario`,`id_bien`),
  KEY `id_bien` (`id_bien`),
  CONSTRAINT `auditoria_selecciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `auditoria_selecciones_ibfk_2` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria_selecciones`
--

LOCK TABLES `auditoria_selecciones` WRITE;
/*!40000 ALTER TABLE `auditoria_selecciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria_selecciones` ENABLE KEYS */;
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
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_aula_periodo` (`ubicacion_id`,`periodo_id`),
  KEY `fk_aulas_usuario` (`usuario_id`),
  KEY `fk_aulas_periodo` (`periodo_id`),
  CONSTRAINT `fk_aulas_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos_academicos` (`id_periodo`) ON DELETE CASCADE,
  CONSTRAINT `fk_aulas_ubicacion` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id_ubicacion`) ON DELETE CASCADE,
  CONSTRAINT `fk_aulas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `aulas_asignadas`
--

LOCK TABLES `aulas_asignadas` WRITE;
/*!40000 ALTER TABLE `aulas_asignadas` DISABLE KEYS */;
INSERT INTO `aulas_asignadas` VALUES (2,5,4,3,'Se entrega sin novedad',1,'2026-01-19 00:33:04','2026-01-19 00:33:04');
/*!40000 ALTER TABLE `aulas_asignadas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_asignaciones_bien`
--

DROP TABLE IF EXISTS `backup_asignaciones_bien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backup_asignaciones_bien` (
  `id_asignacion` int NOT NULL DEFAULT '0',
  `id_bien` int NOT NULL,
  `id_usuario` int NOT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_devolucion` timestamp NULL DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_asignaciones_bien`
--

LOCK TABLES `backup_asignaciones_bien` WRITE;
/*!40000 ALTER TABLE `backup_asignaciones_bien` DISABLE KEYS */;
INSERT INTO `backup_asignaciones_bien` VALUES (82,77,4,'2026-02-03 00:50:30','2026-02-05 01:57:18',0,'Asignación inicial'),(86,77,8,'2026-02-05 02:38:59',NULL,1,NULL),(87,79,8,'2026-02-05 02:41:14',NULL,1,'Asignación inicial');
/*!40000 ALTER TABLE `backup_asignaciones_bien` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bien_ubicacion`
--

LOCK TABLES `bien_ubicacion` WRITE;
/*!40000 ALTER TABLE `bien_ubicacion` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bien_usuario`
--

LOCK TABLES `bien_usuario` WRITE;
/*!40000 ALTER TABLE `bien_usuario` DISABLE KEYS */;
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
  `codigo_institucional` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `marca` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modelo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `serie` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `valor` decimal(12,2) DEFAULT '0.00',
  `fecha_adquisicion` date DEFAULT NULL,
  `vida_util` int DEFAULT NULL,
  `valor_residual` decimal(12,2) DEFAULT NULL,
  `depreciacion_acumulada` decimal(12,2) DEFAULT '0.00',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `codigo_senescyt` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nro_acta_entrega_recepcion` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nro_acta_constatacion_fisica` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `color` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `material` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proveedor` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `anio_fabricacion` int DEFAULT NULL,
  `clase_de_bien` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoria_id` int DEFAULT NULL,
  `ubicacion_id` int DEFAULT NULL,
  `periodo_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_bien`),
  UNIQUE KEY `codigo_institucional` (`codigo_institucional`),
  KEY `fk_bienes_periodo` (`periodo_id`),
  KEY `idx_bienes_codigo` (`codigo_institucional`),
  KEY `idx_bienes_estado` (`estado`),
  KEY `idx_bienes_categoria` (`categoria_id`),
  KEY `idx_bienes_ubicacion` (`ubicacion_id`),
  CONSTRAINT `fk_bienes_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id_categoria`) ON DELETE SET NULL,
  CONSTRAINT `fk_bienes_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos_academicos` (`id_periodo`) ON DELETE SET NULL,
  CONSTRAINT `fk_bienes_ubicacion` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicaciones` (`id_ubicacion`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bienes`
--

LOCK TABLES `bienes` WRITE;
/*!40000 ALTER TABLE `bienes` DISABLE KEYS */;
INSERT INTO `bienes` VALUES (80,'INT-LAB1-M0011.01','MONITOR','DONACIÓN GRADUADOS SISTEMAS NOV 2024\n','LG','N/A','603ntbk2w629','BUENO',680.00,'2024-02-02',5,0.00,275.17,'DONACIÓN GRADUADOS SISTEMAS NOV 2024\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 00:36:02','2026-02-10 00:36:02'),(81,'INT-LAB-EC-M027.1','MONITOR','DONACIÓN GADIP REGISTRADO EN SENESCYT\n','ARI','COMARIZEN717001190077','KALLPA-AM370R1700','BUENO',250.00,'2024-02-02',5,0.00,101.17,'DONACIÓN GADIP REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,2,'2026-02-10 00:38:12','2026-02-10 00:38:12'),(82,'INT-LAB-EC-M028.1','MONITOR','DONACIÓN GADIP REGISTRADO EN SENESCYT\n','ARI','COMARIZEN7170001190073','KALLPA-AM370R1700','BUENO',250.00,'2025-02-02',5,0.00,51.06,'DONACIÓN GADIP REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,2,'2026-02-10 00:42:27','2026-02-10 00:42:27'),(83,'INT-LAB-EC-M029.1','MONITOR','DONACIÓN GADIP REGISTRADO EN SENESCYT\n','ARI','COMARIZEN7170001190073','KALLPA-AM370R1700','BUENO',250.00,'2025-02-02',5,0.00,51.07,'DONACIÓN GADIP REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,2,'2026-02-10 00:45:35','2026-02-10 00:45:35'),(84,'INT-LAB-EC-M030.1','MONITOR','DONACIÓN GADIP REGISTRADO EN SENESCYT\n','ARI','COMARIZEN7170001190071','KALLPA-AM370R1700','BUENO',700.00,'2025-02-25',5,0.00,134.17,'DONACIÓN GADIP REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,2,'2026-02-10 00:51:10','2026-02-10 00:51:10'),(85,'INT-LAB-EC-M031.1','MONITOR','DONACIÓN GADIP REGISTRADO EN SENESCYT\n','ARI','COMARIZEN7170001190075','KALLPA-AM370R1700','BUENO',250.00,'2025-03-03',5,0.00,47.10,'DONACIÓN GADIP REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,2,'2026-02-10 00:54:03','2026-02-10 00:54:03'),(86,'INT-LAB-EC-M032.1','MONITOR','DONACIÓN GADIP REGISTRADO EN SENESCYT\n','ARI','COMARIZEN7170001190074','KALLPA-AM370R1700','BUENO',250.00,'2025-04-04',5,0.00,42.72,'DONACIÓN GADIP REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,2,'2026-02-10 00:57:43','2026-02-10 00:57:43'),(87,'MONITOR','INT-LAB-EC-M033.1','DONACIÓN GADIP REGISTRADO EN SENESCYT\n','ARI','COMARIZEN7170001190076','KALLPA-AM370R1700','BUENO',250.00,'2025-04-04',5,0.00,42.72,'DONACIÓN GADIP REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,3,'2026-02-10 00:59:19','2026-02-10 00:59:19'),(88,'INT-LAB-EC-M035.1','MONITOR','DONACIÓN GADIP REGISTRADO EN SENESCYT\n','ARI','COMARIZEN71700011968','KALLPA-AM370R1700','BUENO',250.00,'2025-02-23',5,0.00,48.19,'DONACIÓN GADIP REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,3,'2026-02-10 01:04:05','2026-02-10 01:04:05'),(89,'INT-LAB-EC-M036.1','MONITOR','DONACIÓN GADIP REGISTRADO EN SENESCYT\n','ARI','COMARIZEN7170001190069','KALLPA-AM370R1700','BUENO',250.00,'2025-02-05',5,0.00,50.66,'DONACIÓN GADIP REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,3,'2026-02-10 01:08:57','2026-02-10 01:08:57'),(90,'INT-LAB-EC-M039.1','MONITOR','DONADO POR ESTUDIANTES GRADUADOS EN MARZO 2020 REGISTRADO EN SENESCYT\n','LG 19\"5','20MK400H-B','N/A','BUENO',1.00,'2020-02-02',5,0.00,1.00,'DONADO POR ESTUDIANTES GRADUADOS EN MARZO 2020 REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:15:54','2026-02-10 01:15:54'),(91,'INT-LAB-EM-EC-M052.1','MONITOR','DONADO POR ESTUDIANTES GRADUADOS EN MARZO 2020 REGISTRADO EN SENESCYT\n','LG 19\"5','20MK400H-B','910NTDV47314','BUENO',1.00,'2020-02-02',5,0.00,1.00,'DONADO POR ESTUDIANTES GRADUADOS EN MARZO 2020 REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:19:26','2026-02-10 01:19:26'),(92,'INT-LAB-EC-M054.1','MONITOR','DONADO POR ESTUDIANTES GRADUADOS EN MARZO 2020 REGISTRADO EN SENESCYT\n','LG 19\"5','N/A','20MK400H-B','BUENO',1.00,'2020-02-02',5,0.00,1.00,'DONADO POR ESTUDIANTES GRADUADOS EN MARZO 2020 REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:22:57','2026-02-10 01:22:57'),(93,'INT-LAB-EC-M055.1','MONITOR','DONADO POR ESTUDIANTES GRADUADOS EN MARZO 2020 REGISTRADO EN SENESCYT\n','LG 19\"5','N/A','20MK400H-B','BUENO',1.00,'2020-02-02',5,0.00,1.00,'DONADO POR ESTUDIANTES GRADUADOS EN MARZO 2020 REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:24:58','2026-02-10 01:24:58'),(94,'INT-LAB-EC-M056.1','MONITOR','DONADO POR ESTUDIANTES GRADUADOS EN MARZO 2020 REGISTRADO EN SENESCYT\n','LG 19\"5','20MK400H-B','N/A','BUENO',1.00,'2020-02-02',5,0.00,1.00,'DONADO POR ESTUDIANTES GRADUADOS EN MARZO 2020 REGISTRADO EN SENESCYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:27:33','2026-02-10 01:27:33'),(95,'INT-SG-EC-M0732.04','MONITOR','DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n','LG','N/A','N/A','BUENO',1.00,'2022-02-02',5,0.00,0.80,'DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:30:17','2026-02-10 01:30:17'),(96,'INT-SG-EC-M0736.04','MONITOR','DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n','LG','N/A','N/A','BUENO',1.00,'2022-02-02',5,0.00,0.80,'DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:32:43','2026-02-10 01:32:43'),(97,'INT-SG-EC-M0740.04','MONITOR','DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n','LG','N/A','N/A','BUENO',1.00,'2022-02-02',5,0.00,0.80,'DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:35:05','2026-02-10 01:35:05'),(98,'INT-SG-EC-M0744.04','MONITOR','DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n','LG','N/A','N/A','BUENO',1.00,'2022-05-02',5,0.00,0.76,'DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:37:20','2026-02-10 01:37:20'),(99,'INT-AE-EC-M0752.04','MONITOR','DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT \n','LG','N/A','N/A','BUENO',1.00,'2022-04-04',5,0.00,0.77,'DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT \n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:42:26','2026-02-10 01:42:26'),(100,'INT-AS-EC-M0756-04','MONITOR','DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n','LG','N/A','N/A','BUENO',1.00,'2022-03-03',5,0.00,0.79,'DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:43:34','2026-02-10 01:43:34'),(101,'INT-AD-EC-M0760-04','MONITOR','DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n','LG','N/A','N/A','BUENO',1.00,'2022-02-02',5,0.00,0.80,'DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:45:24','2026-02-10 01:45:24'),(102,'INT-SD2-EC-M0764-04','MONITOR','DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n','LG','n/a','n/a','BUENO',1.00,'2022-02-02',5,0.00,0.80,'DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:48:30','2026-02-10 01:48:30'),(103,'INT-SD1-EC-M0776-04','MONITOR','DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n','LG','N/A','N/A','BUENO',1.00,'2022-02-02',5,0.00,0.80,'DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n',NULL,'INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,4,11,'2026-02-10 01:54:40','2026-02-10 01:54:40'),(104,'INT-SD1-EC-M0780-04','MONITOR','DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n','LG','N/A','N/A','BUENO',1.00,'2022-02-02',5,0.00,0.82,'DONACION CONSEJO ESTUDIANTIL 2022 SE REGISTRA EN SENECYT\n','12345','INT-ACT-INV-UB-2024-050-I','INT-CFB-UB-2025-050-I','NEGRO','PLASTICO',NULL,NULL,NULL,18,27,11,'2026-02-10 01:59:32','2026-03-19 03:10:01');
/*!40000 ALTER TABLE `bienes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campus`
--

DROP TABLE IF EXISTS `campus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campus` (
  `id_campus` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_campus`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campus`
--

LOCK TABLES `campus` WRITE;
/*!40000 ALTER TABLE `campus` DISABLE KEYS */;
INSERT INTO `campus` VALUES (1,'Matriz','Campus principal de la institución','2026-01-28 19:20:27','2026-01-28 19:20:27'),(2,'Municipal','Campus ubicado en el área municipal','2026-01-28 19:20:27','2026-02-04 04:34:42'),(3,'Florida','Campus Florida','2026-01-28 19:20:27','2026-01-28 19:20:27');
/*!40000 ALTER TABLE `campus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nombre_categoria` (`nombre_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Computadores','Comput-001','tecnologia','Equipos de computo',NULL,1,'2026-01-18 02:53:40','2026-02-04 04:57:29'),(2,'Muebles','CAT-002','mobiliario','Mobiliario institucional',NULL,1,'2026-01-18 02:53:40','2026-01-18 02:53:40'),(4,'Extintores',NULL,NULL,'v',NULL,1,'2026-01-18 05:07:47','2026-01-27 07:35:25'),(6,'Pupitres',NULL,NULL,'nuevos',NULL,0,'2026-01-19 00:40:05','2026-02-04 02:18:01'),(9,'prueba',NULL,NULL,'prueba7',NULL,1,'2026-01-27 07:27:20','2026-02-04 02:17:52'),(10,'prueba1',NULL,NULL,'prueba1',NULL,1,'2026-01-27 07:49:28','2026-01-29 07:16:23'),(14,'PRUEBA4',NULL,NULL,'PRUEBA',NULL,1,'2026-02-04 02:00:13','2026-02-04 02:17:51'),(17,'Computadores1','Comput-002','tecnologia','Computadores\n',NULL,1,'2026-02-04 04:42:51','2026-02-04 04:57:40'),(18,'EQUIPO DE COMPUTO','n/a','tecnologia','EQUIPO DE COMPUTO\n','EQUIPO DE COMPUTO\n',1,'2026-02-10 00:01:40','2026-02-10 00:01:40');
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
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_departamento`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departamentos`
--

LOCK TABLES `departamentos` WRITE;
/*!40000 ALTER TABLE `departamentos` DISABLE KEYS */;
INSERT INTO `departamentos` VALUES (7,'Matriz','Departamento Matriz',1,'2026-01-27 02:58:39','2026-01-27 04:51:06'),(8,'Municipal','Departamento Municipal',1,'2026-01-27 02:58:39','2026-01-27 02:58:39'),(9,'Florida','Departamento Florida',1,'2026-01-27 02:58:39','2026-01-27 02:58:39'),(12,'prueba6','prueba5',0,'2026-01-27 04:39:54','2026-01-27 04:51:50'),(13,'Laboratorio 1',NULL,1,'2026-01-27 07:41:34','2026-01-27 07:41:34'),(14,'PRUEBA10',NULL,1,'2026-01-27 07:46:38','2026-01-27 07:46:38'),(15,'Biblioteca',NULL,1,'2026-01-29 00:46:49','2026-01-29 00:46:49'),(16,'prueb23',NULL,1,'2026-01-29 00:59:10','2026-01-29 00:59:10');
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
  `tipo_documento` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_archivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `url_archivo` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tamano` int DEFAULT NULL,
  `mime_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_documento`),
  KEY `fk_doc_bien` (`id_bien`),
  KEY `fk_doc_usuario` (`subido_por`),
  CONSTRAINT `fk_doc_bien` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `fk_doc_usuario` FOREIGN KEY (`subido_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_bien`
--

LOCK TABLES `documentos_bien` WRITE;
/*!40000 ALTER TABLE `documentos_bien` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_bien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs_sistema`
--

DROP TABLE IF EXISTS `logs_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs_sistema` (
  `id_log` int NOT NULL AUTO_INCREMENT,
  `nivel` enum('info','warning','error','debug') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `modulo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `detalles` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `usuario_id` int DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  KEY `fk_log_usuario` (`usuario_id`),
  KEY `idx_logs_nivel` (`nivel`),
  KEY `idx_logs_modulo` (`modulo`),
  KEY `idx_logs_fecha` (`created_at`),
  CONSTRAINT `fk_log_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs_sistema`
--

LOCK TABLES `logs_sistema` WRITE;
/*!40000 ALTER TABLE `logs_sistema` DISABLE KEYS */;
INSERT INTO `logs_sistema` VALUES (1,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.18.0.4','2026-01-18 02:54:02'),(2,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.18.0.4','2026-01-18 03:23:06'),(3,'info','auth','Login exitoso','Usuario: bryan.anderson@intsuperior.edu.ec, Rol: Usuario',5,'172.18.0.4','2026-01-19 00:50:41'),(4,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.18.0.4','2026-01-19 00:51:16'),(5,'warning','auth','Intento de login fallido: contraseña incorrecta','Usuario: nancy.gaon@intsuperior.edu.ec',6,'172.20.0.4','2026-01-28 18:48:57'),(6,'info','auth','Login exitoso','Usuario: nancy.gaon@intsuperior.edu.ec, Rol: Usuario',6,'172.20.0.4','2026-01-28 18:49:01'),(7,'info','auth','Login exitoso','Usuario: nancy.gaon@intsuperior.edu.ec, Rol: Usuario',6,'172.20.0.4','2026-01-28 18:49:45'),(8,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.20.0.4','2026-01-28 18:50:04'),(9,'info','auth','Login exitoso','Usuario: nancy.gaon@intsuperior.edu.ec, Rol: Usuario',6,'172.20.0.4','2026-01-28 19:52:00'),(10,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.20.0.4','2026-01-28 19:52:10'),(11,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.20.0.2','2026-01-31 05:23:02'),(12,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.20.0.2','2026-02-02 22:58:03'),(13,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.20.0.4','2026-02-04 01:49:27'),(14,'warning','auth','Intento de login fallido: contraseña incorrecta','Usuario: nancy.gaon@intsuperior.edu.ec',6,'172.20.0.4','2026-02-04 02:19:07'),(15,'info','auth','Login exitoso','Usuario: nancy.gaon@intsuperior.edu.ec, Rol: Usuario',6,'172.20.0.4','2026-02-04 02:19:13'),(16,'info','auth','Login exitoso','Usuario: nancy.gaon@intsuperior.edu.ec, Rol: Usuario',6,'172.20.0.4','2026-02-04 02:22:34'),(17,'warning','auth','Intento de login fallido: contraseña incorrecta','Usuario: nancy.gaon@intsuperior.edu.ec',6,'172.20.0.4','2026-02-04 02:22:43'),(18,'info','auth','Login exitoso','Usuario: nancy.gaon@intsuperior.edu.ec, Rol: Usuario',6,'172.20.0.4','2026-02-04 02:22:58'),(19,'warning','auth','Intento de login fallido: usuario no encontrado','Email: vaca@intsuperior.edu.ec',NULL,'172.20.0.4','2026-02-04 02:32:25'),(20,'warning','auth','Intento de login fallido: usuario no encontrado','Email: vacaasdasd@intsuperior.edu.ec',NULL,'172.20.0.4','2026-02-04 02:32:39'),(21,'info','auth','Login exitoso','Usuario: nancy.gaon@intsuperior.edu.ec, Rol: Usuario',6,'172.20.0.4','2026-02-04 02:33:02'),(22,'warning','auth','Intento de login fallido: usuario no encontrado','Email: admin@intsuperior.edu.ec',NULL,'172.20.0.4','2026-02-04 02:52:12'),(23,'warning','auth','Intento de login fallido: usuario no encontrado','Email: admin@intsuperior.edu.ec',NULL,'172.20.0.4','2026-02-04 02:52:18'),(24,'warning','auth','Intento de login fallido: usuario no encontrado','Email: admin@intsuperior.edu.ec',NULL,'172.20.0.4','2026-02-04 02:52:19'),(25,'warning','auth','Intento de login fallido: usuario no encontrado','Email: admin@intsuperior.edu.ec',NULL,'172.20.0.4','2026-02-04 02:52:19'),(26,'warning','auth','Intento de login fallido: usuario no encontrado','Email: admin@intsuperior.edu.ec',NULL,'172.20.0.4','2026-02-04 02:52:19'),(27,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.20.0.4','2026-02-04 02:53:38'),(28,'warning','auth','Intento de login fallido: contraseña incorrecta','Usuario: admin@intsuperior.edu.ec',1,'172.20.0.4','2026-02-04 08:00:34'),(29,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.20.0.4','2026-02-04 08:00:41'),(30,'warning','auth','Intento de login fallido: contraseña incorrecta','Usuario: admin@intsuperior.edu.ec',1,'172.18.0.4','2026-02-09 01:59:41'),(31,'warning','auth','Intento de login fallido: contraseña incorrecta','Usuario: admin@intsuperior.edu.ec',1,'172.18.0.4','2026-02-09 01:59:45'),(32,'warning','auth','Intento de login fallido: contraseña incorrecta','Usuario: admin@intsuperior.edu.ec',1,'172.18.0.4','2026-02-09 01:59:52'),(33,'warning','auth','Intento de login fallido: contraseña incorrecta','Usuario: admin@intsuperior.edu.ec',1,'172.18.0.4','2026-02-09 02:00:13'),(34,'warning','auth','Intento de login fallido: contraseña incorrecta','Usuario: admin@intsuperior.edu.ec',1,'172.18.0.4','2026-02-09 02:00:13'),(35,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.18.0.4','2026-02-09 02:01:40'),(36,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.18.0.4','2026-02-09 02:03:02'),(37,'warning','auth','Intento de login fallido: contraseña incorrecta','Usuario: admin@intsuperior.edu.ec',1,'172.18.0.2','2026-02-11 22:07:53'),(38,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.18.0.2','2026-02-11 22:08:00'),(39,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.18.0.2','2026-02-13 00:21:08'),(40,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.18.0.2','2026-02-24 03:11:41'),(41,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.18.0.2','2026-03-03 00:26:04'),(42,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.18.0.4','2026-03-05 00:59:02'),(43,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.18.0.2','2026-03-17 01:56:57'),(44,'info','auth','Login exitoso','Usuario: admin@intsuperior.edu.ec, Rol: Administrador',1,'172.18.0.2','2026-03-19 02:13:42');
/*!40000 ALTER TABLE `logs_sistema` ENABLE KEYS */;
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
  `tipo` enum('preventivo','correctivo','predictivo') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'preventivo',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `fecha_programada` date DEFAULT NULL,
  `fecha_limite` date DEFAULT NULL,
  `fecha_realizada` date DEFAULT NULL,
  `estado` enum('programado','en_proceso','completado','cancelado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'programado',
  `tecnico_id` int DEFAULT NULL,
  `costo_estimado` decimal(12,2) DEFAULT NULL,
  `costo_real` decimal(12,2) DEFAULT NULL,
  `prioridad` enum('baja','media','alta','critica') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'media',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_mantenimiento`),
  KEY `fk_mant_bien` (`id_bien`),
  KEY `fk_mant_tecnico` (`tecnico_id`),
  CONSTRAINT `fk_mant_bien` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `fk_mant_tecnico` FOREIGN KEY (`tecnico_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mantenimientos`
--

LOCK TABLES `mantenimientos` WRITE;
/*!40000 ALTER TABLE `mantenimientos` DISABLE KEYS */;
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
  `nombre_periodo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `anio` int DEFAULT NULL,
  `tipo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'anual',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_periodo`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos_academicos`
--

LOCK TABLES `periodos_academicos` WRITE;
/*!40000 ALTER TABLE `periodos_academicos` DISABLE KEYS */;
INSERT INTO `periodos_academicos` VALUES (2,'2025-1','2025-01-01','2025-06-30',1,2025,'semestre','',NULL,'2026-01-18 02:53:40','2026-02-04 06:52:54'),(3,'2025-2','2025-07-01','2025-12-31',1,2025,'semestre',NULL,NULL,'2026-01-18 02:53:40','2026-01-18 02:53:40'),(6,'prueba-2','2025-01-01','2025-06-30',0,2025,'semestre','prueba',NULL,'2026-01-27 06:34:46','2026-02-05 05:17:52'),(7,'2026-1','2026-01-01','2026-12-31',1,2026,'anual','prueba',NULL,'2026-01-27 07:51:03','2026-02-05 05:17:38'),(10,'pre','2026-01-04','2026-07-03',1,2025,'semestre',NULL,NULL,'2026-02-04 07:04:22','2026-02-04 07:04:27'),(11,'2024-1','2023-02-02','2024-02-02',1,2024,'semestre','2024',NULL,'2026-02-10 00:33:11','2026-02-10 00:33:11');
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
  `nombre_permiso` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `nombre_permiso` (`nombre_permiso`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `nombre` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `parametros` json DEFAULT NULL,
  `usuario_id` int DEFAULT NULL,
  `ruta_archivo` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_reporte`),
  KEY `fk_rep_usuario` (`usuario_id`),
  CONSTRAINT `fk_rep_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes`
--

LOCK TABLES `reportes` WRITE;
/*!40000 ALTER TABLE `reportes` DISABLE KEYS */;
INSERT INTO `reportes` VALUES (1,'Inventario de Bienes','inventario','{\"categoria\": \"\", \"fechaDesde\": \"\", \"fechaHasta\": \"\"}',1,NULL,'2026-01-19 00:43:19'),(2,'Inventario de Bienes','inventario','{\"categoria\": \"\", \"fechaDesde\": \"\", \"fechaHasta\": \"\"}',1,NULL,'2026-02-05 05:25:20');
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
  KEY `fk_rp_permiso` (`id_permiso`),
  CONSTRAINT `fk_rp_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id_permiso`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_rol` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `nombre_rol` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador','Acceso total al sistema'),(2,'Usuario','Usuario estÃ¡ndar');
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
  KEY `fk_set_usuario` (`updated_by`),
  CONSTRAINT `fk_set_usuario` FOREIGN KEY (`updated_by`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `nombre` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `asunto` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mensaje` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo` enum('consulta','soporte','sugerencia','queja') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'consulta',
  `estado` enum('pendiente','en_proceso','resuelto','cerrado') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_mensaje`),
  KEY `fk_sup_usuario` (`usuario_id`),
  CONSTRAINT `fk_sup_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  `area` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_aula` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `piso` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sede` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `capacidad` int DEFAULT '0',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_campus` int NOT NULL,
  PRIMARY KEY (`id_ubicacion`),
  UNIQUE KEY `area` (`area`),
  KEY `fk_ubicaciones_campus` (`id_campus`),
  CONSTRAINT `fk_ubicaciones_campus` FOREIGN KEY (`id_campus`) REFERENCES `campus` (`id_campus`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones`
--

LOCK TABLES `ubicaciones` WRITE;
/*!40000 ALTER TABLE `ubicaciones` DISABLE KEYS */;
INSERT INTO `ubicaciones` VALUES (1,'Laboratorio 1','12','1',NULL,'Laboratorio 1',12,1,'2026-01-18 02:53:40','2026-02-04 05:29:24',1),(2,'Biblioteca','11','2',NULL,'Biblioteca',30,1,'2026-01-18 02:53:40','2026-02-04 05:34:38',2),(4,'LABORATORIO ESCUELA MUNICIPAL','1','1',NULL,'M',1,1,'2026-01-18 06:52:06','2026-02-04 05:33:59',2),(5,'Aula 19',NULL,'1',NULL,'Aula 19',1,1,'2026-01-19 00:32:18','2026-03-19 03:09:23',3),(11,'prueba101','32','2',NULL,'prueba101',20,0,'2026-01-29 00:29:33','2026-02-04 08:15:46',1),(24,'PRUEBA5','12','12',NULL,'PRUEBA5',12,0,'2026-02-04 02:09:22','2026-02-04 08:15:44',1),(26,'Laboratorio 12','12','2',NULL,'Laboratorio 1',1,0,'2026-02-04 05:33:00','2026-02-04 08:15:42',1),(27,'LABORATORIO 2 ESCUELA MUNICIPAL','01','1',NULL,'LABORATORIO 2 ESCUELA MUNICIPAL',30,1,'2026-02-05 02:42:31','2026-02-05 02:42:31',2),(28,'LABORATORIO 2 MATRIZ','02','1',NULL,'LABORATORIO 2 MATRIZ',30,1,'2026-02-05 02:43:34','2026-02-05 02:43:34',1),(29,'LABORATORIO 1 MATRIZ','03','1',NULL,'LABORATORIO 1 MATRIZ',30,1,'2026-02-05 02:44:02','2026-02-05 02:44:02',1),(30,'EDIFICIO ADM INT COORDINACION SOFTWARE','01','1',NULL,'EDIFICIO ADM INT COORDINACION SOFTWARE',30,1,'2026-02-05 02:44:36','2026-02-05 02:44:36',1),(31,'EDIFICIO ADMINISTRATIVO INT COORDINACION ADMINISTRACION','01','1',NULL,'EDIFICIO ADMINISTRATIVO INT COORDINACION ADMINISTRACION',30,1,'2026-02-05 02:45:23','2026-02-05 02:45:23',1);
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
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cedula` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_id` int DEFAULT '2',
  `activo` tinyint(1) DEFAULT '1',
  `departamento_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `area_id` int DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `cedula` (`cedula`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_usuarios_departamento` (`departamento_id`),
  KEY `fk_usuarios_rol` (`rol_id`),
  KEY `idx_usuarios_email` (`email`),
  KEY `idx_usuarios_cedula` (`cedula`),
  KEY `fk_usuario_area` (`area_id`),
  CONSTRAINT `fk_usuario_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`),
  CONSTRAINT `fk_usuarios_departamento` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos` (`id_departamento`) ON DELETE SET NULL,
  CONSTRAINT `fk_usuarios_rol` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id_rol`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Xavier','Gavilanez','1234567890','admin@intsuperior.edu.ec',NULL,'$2b$10$tDdQWtlhbNonBduN2o7aXO.l4ugUNWs/EAdnUHsGDmjjaF/Nx9sTO',1,1,NULL,'2026-01-18 02:53:40','2026-02-09 02:02:50',1),(3,'Anderson','Altamirano','1712205218','anonimo.simon@intsuperior.edu.ec','0999999545','$2b$10$YO/OxK9NyT3Vsp2kfXmb0OivT/h2Zvgfib5pNRe8jL1.kMmTSCkyC',2,1,NULL,'2026-01-18 23:37:18','2026-03-17 02:40:43',8),(4,'Ingeniero','Chimarro','4656794512','ingeniero.chimarro@intsuperior.edu.ec','0988545454','$2b$10$QcfqvigsyCXqoTD1BsjlcOMtjoAK55V9yu.zfYTbeIzENPm7E1/Nu',2,1,NULL,'2026-01-19 00:25:52','2026-02-05 01:37:32',1),(5,'Bryan','Anderson','1324656874','bryan.anderson@intsuperior.edu.ec','0985454542','$2b$10$8O3aKwMJ79pz/1dT/8.uAuWe/qLB7qADmndxUw0LdsUKe/aU3LXm6',2,1,NULL,'2026-01-19 00:50:32','2026-02-05 01:37:32',1),(6,'Nancy','Gaon','1010101010','nancy.gaon@intsuperior.edu.ec','0985389640','$2b$10$pSXujyspsNubHbYfG1qgU.aoLJ7szVSpaJEPnWwnz5EFRgB8YED1S',2,1,NULL,'2026-01-27 02:28:38','2026-02-05 04:57:51',2),(7,'Lennin','Vaca','1728515568d','al.vaca@intsuperior.edu.ec','0995181113','$2b$10$BH9G6gTUXyXhk5S7ozKH9.z2ZDS3PBQJJT3YnqWQYVy4lVteo4G8W',2,1,NULL,'2026-01-27 07:41:34','2026-02-05 02:04:39',1),(8,'Vanesa','Cajo','1719371062','vanesa.cajo@intsuperior.edu.ec',NULL,'$2b$10$3agAhcu60KiyF2rztSzUnOFHKlA0mhwuqHi/9JBIwRtEkExlYvco2',2,1,NULL,'2026-02-05 02:36:47','2026-03-17 02:41:52',3);
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

-- Dump completed on 2026-03-19 20:55:31
