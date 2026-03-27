-- Crear tabla de historial de responsables
CREATE TABLE IF NOT EXISTS historial_responsables (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_bien INT NOT NULL,
    id_usuario_anterior INT DEFAULT NULL,
    id_usuario_nuevo INT DEFAULT NULL,
    responsable_anterior VARCHAR(255) DEFAULT NULL,
    responsable_nuevo VARCHAR(255) DEFAULT NULL,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(500) DEFAULT NULL,
    usuario_que_cambio INT DEFAULT NULL,
    FOREIGN KEY (id_bien) REFERENCES bienes(id_bien) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario_anterior) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (id_usuario_nuevo) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    FOREIGN KEY (usuario_que_cambio) REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    INDEX idx_id_bien (id_bien),
    INDEX idx_fecha_cambio (fecha_cambio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
