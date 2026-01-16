-- ============================================
-- BASE DE DATOS: intbienes
-- Sistema de Gestión de Bienes Institucionales
-- Esquema FINAL SIN BUCLES - 2026-01-09
-- 11 Tablas sin redundancias ni bucles circulares
-- ============================================

CREATE DATABASE IF NOT EXISTS `intbienes` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `intbienes`;
-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: intbienes
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
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
  `descripcion` text,
  `estado` varchar(20) DEFAULT 'pendiente',
  `fecha_alerta` date DEFAULT NULL,
  `fecha_resolucion` date DEFAULT NULL,
  PRIMARY KEY (`id_alerta`),
  KEY `id_bien` (`id_bien`),
  CONSTRAINT `alertas_ibfk_1` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alertas`
--

LOCK TABLES `alertas` WRITE;
/*!40000 ALTER TABLE `alertas` DISABLE KEYS */;
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
  `tipo_entidad` enum('BIEN','USUARIO','UBICACION','ACCESO') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_entidad` int DEFAULT NULL,
  `accion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `usuario_id` int DEFAULT NULL,
  `datos_anteriores` json DEFAULT NULL,
  `datos_nuevos` json DEFAULT NULL,
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `exitoso` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_auditoria`),
  KEY `idx_tipo_entidad` (`tipo_entidad`),
  KEY `idx_created_at` (`created_at`)
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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_bien`),
  UNIQUE KEY `codigo_institucional` (`codigo_institucional`),
  KEY `periodo_id` (`periodo_id`),
  KEY `idx_bienes_estado` (`estado`),
  KEY `idx_bienes_codigo` (`codigo_institucional`),
  KEY `idx_bienes_categoria` (`categoria_id`),
  CONSTRAINT `bienes_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id_categoria`),
  CONSTRAINT `bienes_ibfk_4` FOREIGN KEY (`periodo_id`) REFERENCES `periodos_academicos` (`id_periodo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bienes`
--

LOCK TABLES `bienes` WRITE;
/*!40000 ALTER TABLE `bienes` DISABLE KEYS */;
INSERT INTO `bienes` VALUES (1,'INT-TEST-0001','Laptop de Prueba','Equipo portÔö£├ÂÔö£├éÔö¼├║├ö├Â┬úÔö¼├¡til para pruebas','Dell','Inspiron 15','SN123456','ACTIVO',1200.00,'2024-01-15',5,200.00,0.00,1,1,'Bien de prueba para desarrollo','SEN-0001','ACTA-001','CONST-001','Negro','PlÔö£├ÂÔö£├éÔö¼├║├ö├Â┬úÔö¼├¡stico','2025-07-04 22:36:08','2025-07-04 22:36:08');
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
  `descripcion` text,
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
INSERT INTO `categorias` VALUES (1,'Computadores','Equipos de computo',1,'2025-07-04 22:36:08','2025-07-04 22:36:08'),(2,'Muebles','Mobiliario institucional',1,'2025-07-04 22:36:08','2025-07-04 22:36:08');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
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
  `tipo_documento` varchar(50) DEFAULT NULL,
  `nombre_archivo` varchar(255) DEFAULT NULL,
  `url_archivo` varchar(500) DEFAULT NULL,
  `descripcion` text,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_documento`),
  KEY `id_bien` (`id_bien`),
  CONSTRAINT `documentos_bien_ibfk_1` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE
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
-- Table structure for table `historial_custodia_bien`
--

DROP TABLE IF EXISTS `historial_custodia_bien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_custodia_bien` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_bien` int DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_devolucion` timestamp NULL DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `observaciones` text,
  PRIMARY KEY (`id`),
  KEY `id_bien` (`id_bien`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `historial_custodia_bien_ibfk_1` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `historial_custodia_bien_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_custodia_bien`
--

LOCK TABLES `historial_custodia_bien` WRITE;
/*!40000 ALTER TABLE `historial_custodia_bien` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_custodia_bien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_ubicacion_bien`
--

DROP TABLE IF EXISTS `historial_ubicacion_bien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_ubicacion_bien` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_bien` int DEFAULT NULL,
  `id_ubicacion` int DEFAULT NULL,
  `fecha_asignacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_retiro` timestamp NULL DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `observaciones` text,
  PRIMARY KEY (`id`),
  KEY `id_bien` (`id_bien`),
  KEY `id_ubicacion` (`id_ubicacion`),
  CONSTRAINT `historial_ubicacion_bien_ibfk_1` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE,
  CONSTRAINT `historial_ubicacion_bien_ibfk_2` FOREIGN KEY (`id_ubicacion`) REFERENCES `ubicaciones` (`id_ubicacion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_ubicacion_bien`
--

LOCK TABLES `historial_ubicacion_bien` WRITE;
/*!40000 ALTER TABLE `historial_ubicacion_bien` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_ubicacion_bien` ENABLE KEYS */;
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
  `descripcion` text,
  `fecha_programada` date DEFAULT NULL,
  `fecha_realizada` date DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'pendiente',
  `responsable_nombre` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id_mantenimiento`),
  KEY `id_bien` (`id_bien`),
  CONSTRAINT `mantenimientos_ibfk_1` FOREIGN KEY (`id_bien`) REFERENCES `bienes` (`id_bien`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `nombre_periodo` varchar(100) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_periodo`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `periodos_academicos`
--

LOCK TABLES `periodos_academicos` WRITE;
/*!40000 ALTER TABLE `periodos_academicos` DISABLE KEYS */;
INSERT INTO `periodos_academicos` VALUES (1,'2024-2025','2024-09-01','2025-07-31',1,'2025-07-04 22:36:08','2025-07-04 22:36:08');
/*!40000 ALTER TABLE `periodos_academicos` ENABLE KEYS */;
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
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_ubicacion`),
  UNIQUE KEY `uk_area` (`area`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones`
--

LOCK TABLES `ubicaciones` WRITE;
/*!40000 ALTER TABLE `ubicaciones` DISABLE KEYS */;
INSERT INTO `ubicaciones` VALUES (1,'Laboratorio 1','A101','1','Sede Central','Laboratorio de computaciÔö£├ÂÔö£├éÔö¼├║Ôö£├ÂÔö£├éÔö£┬«n',1,'2025-07-04 22:36:08','2025-07-04 22:36:08'),(2,'Biblioteca','B201','2','Sede Central','Biblioteca principal',1,'2025-07-04 22:36:08','2025-07-04 22:36:08');
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
  `password_hash` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `rol` enum('ADMINISTRADOR','USUARIO') NOT NULL DEFAULT 'USUARIO',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `cedula` (`cedula`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Jhonatan','Prueba','1728163484','jhonatan.bano@intsuperior.edu.ec','$2b$10$wH6Qw1Qw1Qw1Qw1Qw1Qw1uQw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1Qw1',1,'ADMINISTRADOR','2025-07-04 22:36:08','2026-01-10 04:15:37'),(2,'Administrador','Sistema','1234567890','admin@intsuperior.edu.ec','$2b$12$5AGjCq9lxaaD47rArFQRm.3fxWV/ysWApaxAnxSkg7Zx/tMQu6Dte',1,'USUARIO','2025-07-04 22:48:44','2025-07-06 21:56:32');
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

-- Dump completed on 2026-01-10  4:29:47

