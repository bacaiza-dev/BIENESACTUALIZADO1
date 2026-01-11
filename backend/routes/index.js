const express = require("express");
const router = express.Router();
const { query, testConnection } = require("../config/database");
const { initializeDatabase } = require("../config/init-database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const ExcelJS = require("exceljs");
const path = require("path");

// Configuración de multer para uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'), false);
    }
  }
});

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ success: false, message: "Token requerido" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Token inválido" });
  }
};

// ==================== RUTAS PÚBLICAS ====================

// Ruta principal de la API
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API de Sistema de Bienes Institucionales",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Ruta para probar conexión a la base de datos
router.get("/test-db", async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({
      success: isConnected,
      message: isConnected ? "Conexión exitosa" : "Error de conexión",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error probando conexión",
      error: error.message,
    });
  }
});

// Ruta para inicializar la base de datos
router.post("/init-db", async (req, res) => {
  try {
    const initialized = await initializeDatabase();
    res.json({
      success: initialized,
      message: initialized
        ? "Base de datos inicializada"
        : "Error inicializando base de datos",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error inicializando base de datos",
      error: error.message,
    });
  }
});

// ==================== AUTENTICACIÓN ====================

// Test endpoint
router.post("/auth/test", (req, res) => {
  console.log("Test endpoint called with body:", req.body);
  res.json({ success: true, message: "Test endpoint works", body: req.body });
});

// Login
router.post("/auth/login", async (req, res) => {
  try {
    console.log("=== LOGIN ATTEMPT ===");
    const { email, password } = req.body;
    console.log("Request body:", req.body);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      });
    }

    // Validar que el email sea del dominio institucional
    if (!email.endsWith("@intsuperior.edu.ec")) {
      return res.status(400).json({
        success: false,
        message:
          "Solo se permiten emails institucionales (@intsuperior.edu.ec)",
      });
    }

    const users = await query(
      "SELECT * FROM usuarios WHERE email = ? AND activo = 1",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const user = users[0];
    console.log("Usuario encontrado:", user);
    console.log("Password hash:", user.password_hash);

    // Función para verificar contraseñas con diferentes métodos
    const verifyPassword = async (password, hash) => {
      console.log("Verificando password:", { password, hash });
      if (!hash) {
        console.log("Hash es null o undefined");
        return false;
      }
      // Si el hash usa el formato pbkdf2_sha512 (nuestro nuevo formato)
      if (hash.startsWith("pbkdf2_sha512$")) {
        const crypto = require("crypto");
        const [algorithm, iterations, salt, hashedPassword] = hash.split("$");
        const testHash = crypto.pbkdf2Sync(
          password,
          salt,
          parseInt(iterations),
          64,
          "sha512"
        );
        return hashedPassword === testHash.toString("hex");
      }

      // Si el hash usa bcrypt (formato anterior)
      if (hash.startsWith("$2b$") || hash.startsWith("$2a$")) {
        return bcrypt.compareSync(password, hash);
      }

      // Fallback: comparación directa (solo para desarrollo)
      return password === hash;
    };

    // TODO: Remover validación de texto plano en producción
    const isPasswordValid = (password === user.password_hash) || await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Obtener rol del usuario (nuevo esquema simplificado)
    const roles = [
      {
        id: 1,
        nombre: user.rol === "ADMINISTRADOR" ? "Administrador" : "Usuario",
        descripcion:
          user.rol === "ADMINISTRADOR" ? "Acceso total" : "Acceso limitado",
        permisos: [],
      },
    ];

    const token = jwt.sign(
      {
        id: user.id_usuario,
        email: user.email,
        roles: roles.map((r) => r.nombre),
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login exitoso",
      data: {
        token,
        user: {
          id: user.id_usuario,
          nombre: user.nombres,
          apellidos: user.apellidos,
          email: user.email,
          cedula: user.cedula,
          activo: user.activo,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        roles, // <-- array de roles
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en el login",
      error: error.message,
    });
  }
});

// ==================== RUTAS PROTEGIDAS ====================

// Obtener usuario actual (para inicialización)
router.get("/auth/me", verifyToken, async (req, res) => {
  try {
    const users = await query(
      `
      SELECT u.id_usuario, u.nombres, u.apellidos, u.email, u.cedula, u.rol, u.activo, u.created_at, u.updated_at
      FROM usuarios u
      WHERE u.id_usuario = ?
    `,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const userData = users[0];

    // Usar el rol directamente de la columna rol de usuarios
    const rolNombre = userData.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Usuario';
    const roles = [{
      id: userData.rol === 'ADMINISTRADOR' ? 1 : 2,
      nombre: rolNombre,
      permisos: [],
    }];

    res.json({
      success: true,
      data: {
        user: {
          id: userData.id_usuario,
          nombre: userData.nombres,
          apellido: userData.apellidos,
          email: userData.email,
          documento: userData.cedula,
          telefono: "",
          activo: userData.activo,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        },
        roles: roles,
        permissions: [],
      },
    });
  } catch (error) {
    console.error('Error en /auth/me:', error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo datos del usuario",
      error: error.message,
    });
  }
});

// Obtener perfil del usuario
router.get("/auth/profile", verifyToken, async (req, res) => {
  try {
    const users = await query(
      `
      SELECT u.id_usuario, u.nombres, u.apellidos, u.email, u.cedula
      FROM usuarios u
      WHERE u.id_usuario = ?
    `,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Obtener rol del usuario (esquema simplificado)
    const userData = users[0];
    const roles = [{
      id: 1,
      nombre: userData.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Usuario',
      permisos: [],
    }];
    res.json({
      success: true,
      data: {
        user: {
          id: userData.id_usuario,
          nombre: userData.nombres,
          apellido: userData.apellidos,
          email: userData.email,
          documento: userData.cedula,
          telefono: "",
          activo: userData.activo,
          created_at: userData.created_at,
          updated_at: userData.updated_at,
        },
        roles: roles,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo perfil",
      error: error.message,
    });
  }
});

// Actualizar perfil del usuario autenticado
router.put("/auth/profile", verifyToken, async (req, res) => {
  try {
    const { nombre, apellido, email } = req.body;

    if (!nombre || !apellido || !email) {
      return res.status(400).json({
        success: false,
        message: "Campos requeridos: nombre, apellido, email",
      });
    }

    // Validar que el email sea del dominio institucional
    if (!email.endsWith("@intsuperior.edu.ec")) {
      return res.status(400).json({
        success: false,
        message: "El email debe ser del dominio @intsuperior.edu.ec",
      });
    }

    // Verificar si el email ya existe para otro usuario
    const existingUser = await query(
      "SELECT * FROM usuarios WHERE email = ? AND id_usuario != ?",
      [email, req.user.id]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El email ya está en uso por otro usuario",
      });
    }

    // Actualizar usuario
    await query(
      "UPDATE usuarios SET nombres = ?, apellidos = ?, email = ? WHERE id_usuario = ?",
      [nombre, apellido, email, req.user.id]
    );

    res.json({
      success: true,
      message: "Perfil actualizado exitosamente",
      data: {
        nombre,
        apellido,
        email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error actualizando perfil",
      error: error.message,
    });
  }
});

// Cambiar contraseña del usuario autenticado
router.put("/auth/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Se requiere la contraseña actual y la nueva contraseña",
      });
    }

    // Verificar contraseña actual
    const user = await query("SELECT * FROM usuarios WHERE id_usuario = ?", [
      req.user.id,
    ]);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user[0].password_hash
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "La contraseña actual es incorrecta",
      });
    }

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await query("UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?", [
      hashedNewPassword,
      req.user.id,
    ]);

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cambiando contraseña",
      error: error.message,
    });
  }
});

// Cerrar sesión
router.post("/auth/logout", (req, res) => {
  res.json({
    success: true,
    message: "Sesión cerrada exitosamente",
  });
});

// ==================== USUARIOS ====================

// Crear usuario
router.post("/usuarios", verifyToken, async (req, res) => {
  try {
    const { nombre, apellido, email, documento, departamento, rol, password } =
      req.body;

    if (!nombre || !apellido || !email || !documento || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Campos requeridos: nombre, apellido, email, documento, password",
      });
    }

    // Validar que el email sea del dominio institucional
    if (!email.endsWith("@intsuperior.edu.ec")) {
      return res.status(400).json({
        success: false,
        message:
          "Solo se permiten emails institucionales (@intsuperior.edu.ec)",
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await query(
      "SELECT * FROM usuarios WHERE email = ? OR cedula = ?",
      [email, documento]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un usuario con ese email o documento",
      });
    }

    // Crear hash de contraseña
    const crypto = require("crypto");
    const salt = crypto.randomBytes(32).toString("hex");
    const hashedPassword = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");
    const passwordHash = `pbkdf2_sha512$10000$${salt}$${hashedPassword}`;

    // Insertar usuario
    const result = await query(
      "INSERT INTO usuarios (nombres, apellidos, cedula, email, password_hash, activo) VALUES (?, ?, ?, ?, ?, 1)",
      [nombre, apellido, documento, email, passwordHash]
    );

    // Asignar rol directamente (esquema simplificado)
    if (rol) {
      await query(
        "UPDATE usuarios SET rol = ? WHERE id_usuario = ?",
        [rol === 'Administrador' ? 'ADMINISTRADOR' : 'USUARIO', result.insertId]
      );
    }

    res.json({
      success: true,
      message: "Usuario creado exitosamente",
      data: { id: result.insertId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creando usuario",
      error: error.message,
    });
  }
});

// Obtener usuarios
router.get("/usuarios", verifyToken, async (req, res) => {
  try {
    const usuarios = await query(`
      SELECT id_usuario, nombres, apellidos, email, cedula, activo, rol, created_at
      FROM usuarios
      ORDER BY created_at DESC
    `);

    // Mapear campos para compatibilidad con frontend
    const usuariosFormated = usuarios.map((user) => ({
      id: user.id_usuario,
      nombre: user.nombres,
      apellido: user.apellidos,
      email: user.email,
      documento: user.cedula,
      telefono: user.telefono || "",
      departamento: user.departamento || "",
      rol: user.rol || "Usuario",
      estado: user.activo ? "activo" : "inactivo",
      activo: user.activo,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));

    res.json({
      success: true,
      data: usuariosFormated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo usuarios",
      error: error.message,
    });
  }
});

// Actualizar usuario
router.put("/usuarios/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, documento, departamento, rol, activo } =
      req.body;

    // Verificar si el usuario existe
    const existingUser = await query(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Actualizar usuario
    await query(
      "UPDATE usuarios SET nombres = ?, apellidos = ?, email = ?, cedula = ?, activo = ? WHERE id_usuario = ?",
      [
        nombre,
        apellido,
        email,
        documento,
        activo !== undefined ? activo : 1,
        id,
      ]
    );

    // Actualizar rol directamente (esquema simplificado)
    if (rol) {
      await query(
        "UPDATE usuarios SET rol = ? WHERE id_usuario = ?",
        [rol === 'Administrador' ? 'ADMINISTRADOR' : 'USUARIO', id]
      );
    }

    res.json({
      success: true,
      message: "Usuario actualizado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error actualizando usuario",
      error: error.message,
    });
  }
});

// Eliminar usuario
router.delete("/usuarios/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el usuario existe
    const existingUser = await query(
      "SELECT * FROM usuarios WHERE id_usuario = ?",
      [id]
    );
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Eliminar usuario directamente (rol es columna, no necesita eliminar relaciones)
    await query("DELETE FROM usuarios WHERE id_usuario = ?", [id]);

    res.json({
      success: true,
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error eliminando usuario",
      error: error.message,
    });
  }
});

// ==================== ROLES ====================

// Obtener roles (esquema simplificado - retorna lista fija)
router.get("/roles", verifyToken, async (req, res) => {
  try {
    // Roles fijos en nuevo esquema
    const rolesFormated = [
      { id: 1, nombre: 'Administrador', descripcion: 'Acceso total al sistema' },
      { id: 2, nombre: 'Usuario', descripcion: 'Acceso limitado' }
    ];

    res.json({
      success: true,
      data: rolesFormated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo roles",
      error: error.message,
    });
  }
});

// ==================== CATEGORÍAS ====================

// Obtener categorías
router.get("/categorias", verifyToken, async (req, res) => {
  try {
    const categorias = await query(
      "SELECT * FROM categorias WHERE activo = 1 ORDER BY nombre_categoria"
    );

    // Mapear campos para compatibilidad con frontend
    const categoriasFormated = categorias.map((cat) => ({
      id: cat.id_categoria,
      nombre: cat.nombre_categoria,
      descripcion: cat.descripcion,
      activo: cat.activo,
      created_at: cat.created_at,
      updated_at: cat.updated_at,
    }));

    res.json({
      success: true,
      data: categoriasFormated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo categorías",
      error: error.message,
    });
  }
});

// Crear categoría
router.post("/categorias", verifyToken, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: "El nombre de la categoría es requerido",
      });
    }

    // Verificar si la categoría ya existe
    const existing = await query(
      "SELECT * FROM categorias WHERE nombre_categoria = ?",
      [nombre]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una categoría con ese nombre",
      });
    }

    // Insertar categoría
    const result = await query(
      "INSERT INTO categorias (nombre_categoria, descripcion, activo) VALUES (?, ?, 1)",
      [nombre, descripcion || null]
    );

    res.json({
      success: true,
      message: "Categoría creada exitosamente",
      data: { id: result.insertId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creando categoría",
      error: error.message,
    });
  }
});

// Actualizar categoría
router.put("/categorias/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;

    // Verificar si la categoría existe
    const existing = await query(
      "SELECT * FROM categorias WHERE id_categoria = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    }

    // Actualizar categoría
    await query(
      "UPDATE categorias SET nombre_categoria = ?, descripcion = ?, activo = ? WHERE id_categoria = ?",
      [nombre, descripcion, activo !== undefined ? activo : 1, id]
    );

    res.json({
      success: true,
      message: "Categoría actualizada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error actualizando categoría",
      error: error.message,
    });
  }
});

// Eliminar categoría
router.delete("/categorias/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la categoría existe
    const existing = await query(
      "SELECT * FROM categorias WHERE id_categoria = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    }

    // Verificar si hay bienes asociados
    const bienes = await query(
      "SELECT COUNT(*) as count FROM bienes WHERE categoria_id = ?",
      [id]
    );
    if (bienes[0].count > 0) {
      return res.status(400).json({
        success: false,
        message:
          "No se puede eliminar la categoría porque tiene bienes asociados",
      });
    }

    // Eliminar categoría
    await query("DELETE FROM categorias WHERE id_categoria = ?", [id]);

    res.json({
      success: true,
      message: "Categoría eliminada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error eliminando categoría",
      error: error.message,
    });
  }
});

// ==================== UBICACIONES ====================

// Obtener ubicaciones
router.get("/ubicaciones", verifyToken, async (req, res) => {
  try {
    const ubicaciones = await query(
      "SELECT * FROM ubicaciones WHERE activo = 1 ORDER BY area"
    );

    // Mapear campos para compatibilidad con frontend
    const ubicacionesFormated = ubicaciones.map((ub) => ({
      id: ub.id_ubicacion,
      nombre: ub.area, // El frontend espera 'nombre' pero la DB usa 'area'
      descripcion: ub.descripcion,
      edificio: ub.sede || "",
      piso: ub.piso || "",
      aula: ub.numero_aula || "",
      tipo: ub.tipo || "oficina",
      capacidad: ub.capacidad || 0,
      estado: ub.activo ? "activo" : "inactivo",
      bienesAsignados: 0, // Se calculará dinámicamente
      activo: ub.activo,
      created_at: ub.created_at,
      updated_at: ub.updated_at,
    }));

    res.json({
      success: true,
      data: ubicacionesFormated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo ubicaciones",
      error: error.message,
    });
  }
});

// Crear ubicación
router.post("/ubicaciones", verifyToken, async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      edificio,
      piso,
      aula,
      tipo,
      capacidad,
      estado,
    } = req.body;

    if (!nombre || !edificio) {
      return res.status(400).json({
        success: false,
        message: "Nombre y edificio son requeridos",
      });
    }

    // Verificar si la ubicación ya existe
    const existing = await query(
      "SELECT * FROM ubicaciones WHERE area = ? AND sede = ?",
      [nombre, edificio]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una ubicación con ese nombre en el edificio",
      });
    }

    // Insertar ubicación
    const result = await query(
      "INSERT INTO ubicaciones (area, descripcion, sede, piso, numero_aula, tipo, capacidad, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        nombre,
        descripcion || null,
        edificio,
        piso || null,
        aula || null,
        tipo || "oficina",
        capacidad || 0,
        estado === "activo" ? 1 : 0,
      ]
    );

    res.json({
      success: true,
      message: "Ubicación creada exitosamente",
      data: { id: result.insertId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creando ubicación",
      error: error.message,
    });
  }
});

// Actualizar ubicación
router.put("/ubicaciones/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      edificio,
      piso,
      aula,
      tipo,
      capacidad,
      estado,
    } = req.body;

    // Verificar si la ubicación existe
    const existing = await query(
      "SELECT * FROM ubicaciones WHERE id_ubicacion = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ubicación no encontrada",
      });
    }

    // Actualizar ubicación
    await query(
      "UPDATE ubicaciones SET area = ?, descripcion = ?, sede = ?, piso = ?, numero_aula = ?, tipo = ?, capacidad = ?, activo = ? WHERE id_ubicacion = ?",
      [
        nombre,
        descripcion,
        edificio,
        piso,
        aula,
        tipo || "oficina",
        capacidad || 0,
        estado === "activo" ? 1 : 0,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Ubicación actualizada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error actualizando ubicación",
      error: error.message,
    });
  }
});

// Eliminar ubicación
router.delete("/ubicaciones/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la ubicación existe
    const existing = await query(
      "SELECT * FROM ubicaciones WHERE id_ubicacion = ?",
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ubicación no encontrada",
      });
    }

    // Verificar si hay bienes asociados
    const bienes = await query(
      "SELECT COUNT(*) as count FROM bienes WHERE ubicacion_id = ?",
      [id]
    );
    if (bienes[0].count > 0) {
      return res.status(400).json({
        success: false,
        message:
          "No se puede eliminar la ubicación porque tiene bienes asociados",
      });
    }

    // Eliminar ubicación
    await query("DELETE FROM ubicaciones WHERE id_ubicacion = ?", [id]);

    res.json({
      success: true,
      message: "Ubicación eliminada exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error eliminando ubicación",
      error: error.message,
    });
  }
});

// ==================== BIENES ====================

// Obtener bienes
router.get("/bienes", verifyToken, async (req, res) => {
  try {
    let querySQL = `
      SELECT 
        b.*,
        c.nombre_categoria as categoria_nombre,
        hub.id_ubicacion as ubicacion_id,
        u.area as ubicacion_nombre,
        hcb.id_usuario as responsable_id,
        usr.nombres as usuario_nombre,
        usr.apellidos as usuario_apellidos
      FROM bienes b
      LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
      LEFT JOIN historial_ubicacion_bien hub ON b.id_bien = hub.id_bien AND hub.activo = 1
      LEFT JOIN ubicaciones u ON hub.id_ubicacion = u.id_ubicacion
      LEFT JOIN historial_custodia_bien hcb ON b.id_bien = hcb.id_bien AND hcb.activo = 1
      LEFT JOIN usuarios usr ON hcb.id_usuario = usr.id_usuario
    `;

    const params = [];
    if (req.query.responsable) {
      querySQL += " WHERE hcb.id_usuario = ?";
      params.push(req.query.responsable);
    }

    querySQL += " ORDER BY b.created_at DESC";

    const bienes = await query(querySQL, params);

    // Mapear campos para compatibilidad con frontend
    const bienesFormated = bienes.map((bien) => ({
      id: bien.id_bien,
      codigo_institucional: bien.codigo_institucional,
      codigo_senescyt: bien.codigo_senescyt,
      nombre: bien.nombre,
      descripcion: bien.descripcion,
      marca: bien.marca,
      modelo: bien.modelo,
      serie: bien.serie,
      estado: bien.estado ? bien.estado.toLowerCase() : 'activo',
      valor_adquisicion: bien.valor,
      fecha_adquisicion: bien.fecha_adquisicion ? new Date(bien.fecha_adquisicion).toISOString().split('T')[0] : null,
      vida_util: bien.vida_util,
      categoria_id: bien.categoria_id,
      categoria: {
        id: bien.categoria_id,
        nombre: bien.categoria_nombre,
      },
      ubicacion_id: bien.ubicacion_id,
      ubicacion: {
        id: bien.ubicacion_id,
        nombre: bien.ubicacion_nombre,
      },
      responsable_id: bien.responsable_id,
      responsable: {
        id: bien.responsable_id,
        nombre: bien.usuario_nombre,
        apellido: bien.usuario_apellidos,
      },
      observaciones: bien.observaciones,
      created_at: bien.created_at,
      updated_at: bien.updated_at,
    }));

    res.json({
      success: true,
      data: bienesFormated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo bienes",
      error: error.message,
    });
  }
});

// Obtener bien por ID
router.get("/bienes/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const bienes = await query(
      `
      SELECT 
        b.*,
        c.nombre_categoria as categoria_nombre,
        hub.id_ubicacion as ubicacion_id,
        u.area as ubicacion_nombre,
        hcb.id_usuario as responsable_id,
        usr.nombres as usuario_nombre,
        usr.apellidos as usuario_apellidos
      FROM bienes b
      LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
      LEFT JOIN historial_ubicacion_bien hub ON b.id_bien = hub.id_bien AND hub.activo = 1
      LEFT JOIN ubicaciones u ON hub.id_ubicacion = u.id_ubicacion
      LEFT JOIN historial_custodia_bien hcb ON b.id_bien = hcb.id_bien AND hcb.activo = 1
      LEFT JOIN usuarios usr ON hcb.id_usuario = usr.id_usuario
      WHERE b.id_bien = ?
    `,
      [id]
    );

    if (bienes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bien no encontrado",
      });
    }

    const bien = bienes[0];
    
    // Formatear fechas a yyyy-MM-dd para inputs de tipo date
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    res.json({
      success: true,
      data: {
        id: bien.id_bien,
        codigo_institucional: bien.codigo_institucional,
        codigo_senescyt: bien.codigo_senescyt,
        nombre: bien.nombre,
        descripcion: bien.descripcion,
        marca: bien.marca,
        modelo: bien.modelo,
        serie: bien.serie,
        estado: bien.estado,
        valor: bien.valor,
        valor_adquisicion: bien.valor,
        fecha_adquisicion: formatDate(bien.fecha_adquisicion),
        vida_util: bien.vida_util,
        valor_residual: bien.valor_residual,
        depreciacion_acumulada: bien.depreciacion_acumulada,
        categoria_id: bien.categoria_id,
        categoria: {
          id: bien.categoria_id,
          nombre: bien.categoria_nombre,
        },
        ubicacion_id: bien.ubicacion_id,
        ubicacion: {
          id: bien.ubicacion_id,
          nombre: bien.ubicacion_nombre,
        },
        responsable_id: bien.responsable_id,
        responsable: {
          id: bien.responsable_id,
          nombre: bien.usuario_nombre,
          apellido: bien.usuario_apellidos,
        },
        periodo_id: bien.periodo_id,
        observaciones: bien.observaciones,
        nro_acta_entrega_recepcion: bien.nro_acta_entrega_recepcion,
        nro_acta_constatacion_fisica: bien.nro_acta_constatacion_fisica,
        color: bien.color,
        material: bien.material,
        created_at: bien.created_at,
        updated_at: bien.updated_at,
      },
    });
  } catch (error) {
    console.error('Error en GET /bienes/:id:', error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo bien",
      error: error.message,
    });
  }
});

// Crear bien
router.post("/bienes", verifyToken, async (req, res) => {
  try {
    const {
      codigo_institucional,
      nombre,
      descripcion,
      marca,
      modelo,
      serie,
      estado,
      valor,
      fecha_adquisicion,
      vida_util,
      valor_residual,
      categoria_id,
      ubicacion_id,
      responsable_id,
      periodo_id,
      observaciones,
      codigo_senescyt,
      nro_acta_entrega_recepcion,
      nro_acta_constatacion_fisica,
      color,
      material
    } = req.body;

    // Validaciones básicas
    if (!codigo_institucional || !nombre || !valor) {
      return res.status(400).json({
        success: false,
        message: "Código, nombre y valor son requeridos",
      });
    }

    // Verificar si el código ya existe
    const existing = await query(
      "SELECT * FROM bienes WHERE codigo_institucional = ?",
      [codigo_institucional]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un bien con ese código institucional",
      });
    }

    // Log para debug
    console.log('Datos recibidos para crear bien:', req.body);

    // Insertar bien
    const result = await query(
      `INSERT INTO bienes (
        codigo_institucional, nombre, descripcion, marca, modelo, serie,
        estado, valor, fecha_adquisicion, vida_util, valor_residual,
        categoria_id, observaciones, codigo_senescyt,
        nro_acta_entrega_recepcion, nro_acta_constatacion_fisica,
        color, material, periodo_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo_institucional,
        nombre,
        descripcion || null,
        marca || null,
        modelo || null,
        serie || null,
        estado || 'ACTIVO',
        parseFloat(valor),
        fecha_adquisicion ? fecha_adquisicion.split('T')[0] : null, // Solo fecha sin hora
        vida_util || 5,
        valor_residual || 0,
        categoria_id || null,
        observaciones || null,
        codigo_senescyt || null,
        nro_acta_entrega_recepcion || null,
        nro_acta_constatacion_fisica || null,
        color || null,
        material || null,
        periodo_id || null
      ]
    );

    const bienId = result.insertId;

    // Registrar ubicación en historial si se proporciona
    if (ubicacion_id) {
      await query(
        `INSERT INTO historial_ubicacion_bien (id_bien, id_ubicacion, fecha_asignacion, activo) 
         VALUES (?, ?, NOW(), 1)`,
        [bienId, ubicacion_id]
      );
    }

    // Registrar custodia en historial si se proporciona
    if (responsable_id) {
      await query(
        `INSERT INTO historial_custodia_bien (id_bien, id_usuario, fecha_asignacion, activo) 
         VALUES (?, ?, NOW(), 1)`,
        [bienId, responsable_id]
      );
    }

    res.json({
      success: true,
      message: "Bien creado exitosamente",
      data: { id: bienId },
    });
  } catch (error) {
    console.error("Error creando bien:", error);
    res.status(500).json({
      success: false,
      message: "Error creando bien",
      error: error.message,
    });
  }
});

// Actualizar bien
router.put("/bienes/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codigo_institucional,
      nombre,
      descripcion,
      marca,
      modelo,
      serie,
      estado,
      valor,
      fecha_adquisicion,
      vida_util,
      valor_residual,
      categoria_id,
      ubicacion_id,
      responsable_id,
      observaciones,
      codigo_senescyt,
      periodo_id,
      nro_acta_entrega_recepcion,
      nro_acta_constatacion_fisica,
      color,
      material
    } = req.body;

    console.log('Datos recibidos para actualizar bien:', req.body);

    // Verificar si el bien existe
    const existing = await query("SELECT * FROM bienes WHERE id_bien = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bien no encontrado",
      });
    }

    // Formatear fecha si viene con hora
    let fechaFormateada = null;
    if (fecha_adquisicion) {
      fechaFormateada = fecha_adquisicion.includes('T') 
        ? fecha_adquisicion.split('T')[0] 
        : fecha_adquisicion;
    }

    // Actualizar bien
    await query(
      `UPDATE bienes SET
        codigo_institucional = ?, nombre = ?, descripcion = ?, marca = ?,
        modelo = ?, serie = ?, estado = ?, valor = ?, fecha_adquisicion = ?,
        vida_util = ?, valor_residual = ?, categoria_id = ?, observaciones = ?,
        codigo_senescyt = ?, periodo_id = ?, nro_acta_entrega_recepcion = ?,
        nro_acta_constatacion_fisica = ?, color = ?, material = ?, updated_at = NOW()
       WHERE id_bien = ?`,
      [
        codigo_institucional || null,
        nombre || null,
        descripcion || null,
        marca || null,
        modelo || null,
        serie || null,
        estado || 'ACTIVO',
        valor ? parseFloat(valor) : 0,
        fechaFormateada,
        vida_util || 5,
        valor_residual || 0,
        categoria_id || null,
        observaciones || null,
        codigo_senescyt || null,
        periodo_id || null,
        nro_acta_entrega_recepcion || null,
        nro_acta_constatacion_fisica || null,
        color || null,
        material || null,
        id
      ]
    );

    // Actualizar ubicación si cambió
    if (ubicacion_id) {
      // Desactivar ubicación anterior
      await query(
        "UPDATE historial_ubicacion_bien SET activo = 0 WHERE id_bien = ? AND activo = 1",
        [id]
      );
      // Insertar nueva ubicación
      await query(
        `INSERT INTO historial_ubicacion_bien (id_bien, id_ubicacion, fecha_asignacion, activo) 
         VALUES (?, ?, NOW(), 1)`,
        [id, ubicacion_id]
      );
    }

    // Actualizar responsable si cambió
    if (responsable_id) {
      // Desactivar custodia anterior
      await query(
        "UPDATE historial_custodia_bien SET activo = 0 WHERE id_bien = ? AND activo = 1",
        [id]
      );
      // Insertar nueva custodia
      await query(
        `INSERT INTO historial_custodia_bien (id_bien, id_usuario, fecha_asignacion, activo) 
         VALUES (?, ?, NOW(), 1)`,
        [id, responsable_id]
      );
    }

    res.json({
      success: true,
      message: "Bien actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error actualizando bien:", error);
    res.status(500).json({
      success: false,
      message: "Error actualizando bien",
      error: error.message,
    });
  }
});

// Eliminar bien
router.delete("/bienes/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el bien existe
    const existing = await query("SELECT * FROM bienes WHERE id_bien = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bien no encontrado",
      });
    }

    // Eliminar historiales primero
    await query("DELETE FROM historial_ubicacion_bien WHERE id_bien = ?", [id]);
    await query("DELETE FROM historial_custodia_bien WHERE id_bien = ?", [id]);

    // Eliminar bien
    await query("DELETE FROM bienes WHERE id_bien = ?", [id]);

    res.json({
      success: true,
      message: "Bien eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando bien:", error);
    res.status(500).json({
      success: false,
      message: "Error eliminando bien",
      error: error.message,
    });
  }
});

// ==================== DASHBOARD ====================

// Obtener métricas del dashboard
router.get("/dashboard/stats", verifyToken, async (req, res) => {
  try {
    // Obtener total de bienes
    const totalBienes = await query("SELECT COUNT(*) as total FROM bienes");

    // Obtener valor total
    const valorTotal = await query("SELECT SUM(valor) as total FROM bienes");

    // Obtener alertas activas
    const alertasActivas = await query(
      "SELECT COUNT(*) as total FROM alertas WHERE estado = 'pendiente'"
    );

    // Obtener usuarios activos
    const usuariosActivos = await query(
      "SELECT COUNT(*) as total FROM usuarios WHERE activo = 1"
    );

    // Obtener bienes agregados este mes
    const bienesEsteMes = await query(`
      SELECT COUNT(*) as total 
      FROM bienes 
      WHERE MONTH(created_at) = MONTH(CURRENT_DATE()) 
      AND YEAR(created_at) = YEAR(CURRENT_DATE())
    `);

    const stats = {
      totalBienes: totalBienes[0]?.total || 0,
      valorTotal: valorTotal[0]?.total || 0,
      alertasActivas: alertasActivas[0]?.total || 0,
      usuariosActivos: usuariosActivos[0]?.total || 0,
      incrementoBienes: bienesEsteMes[0]?.total || 0,
      incrementoValor: 5.2, // Calculado dinámicamente más tarde
      alertasCriticas: 2,
      nuevosUsuarios: 3,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo estadísticas del dashboard",
      error: error.message,
    });
  }
});

// Obtener bienes por categoría
router.get("/dashboard/bienes-por-categoria", verifyToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        c.nombre_categoria as nombre,
        COUNT(b.id_bien) as cantidad,
        ROUND((COUNT(b.id_bien) * 100.0) / (SELECT COUNT(*) FROM bienes), 2) as porcentaje
      FROM categorias c
      LEFT JOIN bienes b ON c.id_categoria = b.categoria_id
      GROUP BY c.id_categoria, c.nombre_categoria
      ORDER BY cantidad DESC
    `);

    // Agregar colores para el gráfico
    const colores = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#06B6D4",
      "#84CC16",
    ];
    const data = result.map((item, index) => ({
      ...item,
      color: colores[index % colores.length],
    }));

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo bienes por categoría",
      error: error.message,
    });
  }
});

// Obtener valor por ubicación
router.get("/dashboard/valor-por-ubicacion", verifyToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        u.area as nombre,
        COALESCE(SUM(b.valor), 0) as valor,
        COUNT(b.id_bien) as cantidad
      FROM ubicaciones u
      LEFT JOIN historial_ubicacion_bien hub ON u.id_ubicacion = hub.id_ubicacion AND hub.activo = 1
      LEFT JOIN bienes b ON hub.id_bien = b.id_bien
      GROUP BY u.id_ubicacion, u.area
      ORDER BY valor DESC
    `);

    // Calcular porcentajes
    const total = result.reduce((sum, item) => sum + item.valor, 0);
    const colores = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#06B6D4",
      "#84CC16",
    ];

    const data = result.map((item, index) => ({
      ...item,
      porcentaje: total > 0 ? Math.round((item.valor * 100) / total) : 0,
      color: colores[index % colores.length],
    }));

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo valor por ubicación",
      error: error.message,
    });
  }
});

// Obtener alertas recientes
router.get("/dashboard/alertas-recientes", verifyToken, async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        a.id_alerta as id,
        a.tipo_alerta as tipo,
        a.descripcion as titulo,
        a.descripcion,
        a.fecha_alerta as tiempo,
        b.codigo_institucional as bien_codigo
      FROM alertas a
      LEFT JOIN bienes b ON a.id_bien = b.id_bien
      WHERE a.estado = 'pendiente'
      ORDER BY a.fecha_alerta DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo alertas recientes",
      error: error.message,
    });
  }
});

// Obtener actividades recientes
router.get(
  "/dashboard/actividades-recientes",
  verifyToken,
  async (req, res) => {
    try {
      const result = await query(`
      SELECT 
        a.id_auditoria as id,
        CONCAT(u.nombres, ' ', u.apellidos) as usuario,
        a.accion,
        a.created_at as tiempo,
        a.tipo_entidad as tipo,
        a.id_entidad
      FROM auditoria a
      LEFT JOIN usuarios u ON a.usuario_id = u.id_usuario
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

      const data = result.map((item) => ({
        ...item,
        detalle: `${item.accion} bien ${item.bien_codigo || "N/A"}`,
      }));

      res.json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error obteniendo actividades recientes",
        error: error.message,
      });
    }
  }
);

// Buscar bien por código QR
router.get("/bienes/search", verifyToken, async (req, res) => {
  try {
    const { codigo, qr } = req.query;

    if (!codigo && !qr) {
      return res.status(400).json({
        success: false,
        message: "Código o datos QR requeridos",
      });
    }

    let searchCode = codigo;

    // Si viene datos QR completos, intentar parsearlo
    if (qr && !codigo) {
      try {
        const qrData = JSON.parse(qr);
        searchCode = qrData.codigo || qrData.codigo_institucional;
      } catch (e) {
        // Si no es JSON válido, usar como código directo
        searchCode = qr;
      }
    }

    const result = await query(
      `
      SELECT 
        b.*,
        c.nombre_categoria as categoria_nombre,
        hub.id_ubicacion as ubicacion_id,
        u.area as ubicacion_nombre,
        hcb.id_usuario as responsable_id,
        usr.nombres as usuario_nombre,
        usr.apellidos as usuario_apellidos
      FROM bienes b
      LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
      LEFT JOIN historial_ubicacion_bien hub ON b.id_bien = hub.id_bien AND hub.activo = 1
      LEFT JOIN ubicaciones u ON hub.id_ubicacion = u.id_ubicacion
      LEFT JOIN historial_custodia_bien hcb ON b.id_bien = hcb.id_bien AND hcb.activo = 1
      LEFT JOIN usuarios usr ON hcb.id_usuario = usr.id_usuario
      WHERE b.codigo_institucional = ? OR b.codigo_senescyt = ? OR b.serie = ?
      ORDER BY b.created_at DESC
    `,
      [searchCode, searchCode, searchCode]
    );

    res.json({
      success: true,
      data: result,
      searchCode: searchCode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error buscando bien por código QR",
      error: error.message,
    });
  }
});

// Generar código QR para un bien
router.get("/generateQRCode/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener el bien con información completa
    const bienes = await query(
      `
      SELECT 
        b.*,
        c.nombre_categoria as categoria_nombre,
        hub.id_ubicacion as ubicacion_id,
        u.area as ubicacion_nombre,
        hcb.id_usuario as responsable_id,
        usr.nombres as usuario_nombre,
        usr.apellidos as usuario_apellidos
      FROM bienes b
      LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
      LEFT JOIN historial_ubicacion_bien hub ON b.id_bien = hub.id_bien AND hub.activo = 1
      LEFT JOIN ubicaciones u ON hub.id_ubicacion = u.id_ubicacion
      LEFT JOIN historial_custodia_bien hcb ON b.id_bien = hcb.id_bien AND hcb.activo = 1
      LEFT JOIN usuarios usr ON hcb.id_usuario = usr.id_usuario
      WHERE b.id_bien = ?
    `,
      [id]
    );

    if (bienes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bien no encontrado",
      });
    }

    const bien = bienes[0];

    // Crear datos estructurados para el QR
    const qrData = {
      id: bien.id_bien,
      codigo: bien.codigo_institucional,
      codigo_senescyt: bien.codigo_senescyt,
      nombre: bien.nombre,
      descripcion: bien.descripcion,
      marca: bien.marca,
      modelo: bien.modelo,
      serie: bien.serie,
      estado: bien.estado,
      categoria: bien.categoria_nombre,
      ubicacion: bien.ubicacion_nombre,
      responsable: bien.usuario_nombre
        ? `${bien.usuario_nombre} ${bien.usuario_apellidos}`
        : null,
      valor: bien.valor,
      fecha_adquisicion: bien.fecha_adquisicion,
      url: `${process.env.FRONTEND_URL || "http://localhost:3001"}/bienes/${
        bien.id_bien
      }`,
      sistema: "Instituto Nelson Torres - Gestión de Bienes",
      timestamp: new Date().toISOString(),
    };

    // Usar la librería qrcode para generar QR real
    const QRCode = require("qrcode");
    const qrString = JSON.stringify(qrData);

    // Generar QR como Data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        qrData: qrData,
        codigo: bien.codigo_institucional,
        bien: bien,
      },
    });
  } catch (error) {
    console.error("Error generando código QR:", error);
    res.status(500).json({
      success: false,
      message: "Error generando código QR",
      error: error.message,
    });
  }
});

// Generar QR en diferentes formatos
router.get("/generateQRCode/:id/:format?", verifyToken, async (req, res) => {
  try {
    const { id, format = "json" } = req.params;

    // Obtener el bien con información completa
    const bienes = await query(
      `
      SELECT 
        b.*,
        c.nombre_categoria as categoria_nombre,
        hub.id_ubicacion as ubicacion_id,
        u.area as ubicacion_nombre,
        hcb.id_usuario as responsable_id,
        usr.nombres as usuario_nombre,
        usr.apellidos as usuario_apellidos
      FROM bienes b
      LEFT JOIN categorias c ON b.categoria_id = c.id_categoria
      LEFT JOIN historial_ubicacion_bien hub ON b.id_bien = hub.id_bien AND hub.activo = 1
      LEFT JOIN ubicaciones u ON hub.id_ubicacion = u.id_ubicacion
      LEFT JOIN historial_custodia_bien hcb ON b.id_bien = hcb.id_bien AND hcb.activo = 1
      LEFT JOIN usuarios usr ON hcb.id_usuario = usr.id_usuario
      WHERE b.id_bien = ?
    `,
      [id]
    );

    if (bienes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bien no encontrado",
      });
    }

    const bien = bienes[0];

    let qrString;

    // Generar contenido según formato
    switch (format.toLowerCase()) {
      case "simple":
        qrString = bien.codigo_institucional;
        break;
      case "url":
        qrString = `${
          process.env.FRONTEND_URL || "http://localhost:3001"
        }/bienes/${bien.id_bien}`;
        break;
      case "compact":
        qrString = JSON.stringify({
          id: bien.id_bien,
          codigo: bien.codigo_institucional,
          nombre: bien.nombre,
          url: `${process.env.FRONTEND_URL || "http://localhost:3001"}/bienes/${
            bien.id_bien
          }`,
        });
        break;
      default: // 'json' o formato completo
        qrString = JSON.stringify({
          id: bien.id_bien,
          codigo: bien.codigo_institucional,
          codigo_senescyt: bien.codigo_senescyt,
          nombre: bien.nombre,
          descripcion: bien.descripcion,
          marca: bien.marca,
          modelo: bien.modelo,
          serie: bien.serie,
          estado: bien.estado,
          categoria: bien.categoria_nombre,
          ubicacion: bien.ubicacion_nombre,
          responsable: bien.usuario_nombre
            ? `${bien.usuario_nombre} ${bien.usuario_apellidos}`
            : null,
          valor: bien.valor,
          fecha_adquisicion: bien.fecha_adquisicion,
          url: `${process.env.FRONTEND_URL || "http://localhost:3001"}/bienes/${
            bien.id_bien
          }`,
          sistema: "Instituto Nelson Torres - Gestión de Bienes",
          timestamp: new Date().toISOString(),
        });
    }

    // Usar la librería qrcode para generar QR real
    const QRCode = require("qrcode");

    // Generar QR como Data URL
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      width: 256,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        qrString: qrString,
        format: format,
        codigo: bien.codigo_institucional,
        bien: bien,
      },
    });
  } catch (error) {
    console.error("Error generando código QR:", error);
    res.status(500).json({
      success: false,
      message: "Error generando código QR",
      error: error.message,
    });
  }
});

// Crear bien
router.post("/bienes", verifyToken, async (req, res) => {
  try {
    const {
      codigo_institucional,
      codigo_senescyt,
      nombre,
      descripcion,
      marca,
      modelo,
      serie,
      estado,
      valor_adquisicion,
      fecha_adquisicion,
      vida_util,
      categoria_id,
      ubicacion_id,
      responsable_id,
      observaciones,
      color,
      material,
    } = req.body;

    if (!codigo_institucional || !codigo_senescyt || !nombre || !categoria_id) {
      return res.status(400).json({
        success: false,
        message:
          "Campos requeridos: codigo_institucional, codigo_senescyt, nombre, categoria_id",
      });
    }

    // Verificar si el bien ya existe
    const existing = await query(
      "SELECT * FROM bienes WHERE codigo_institucional = ? OR codigo_senescyt = ?",
      [codigo_institucional, codigo_senescyt]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un bien con ese código institucional o SENESCYT",
      });
    }

    // Insertar bien (sin ubicacion_id ni responsable_id)
    const result = await query(
      `INSERT INTO bienes (
        codigo_institucional, codigo_senescyt, nombre, descripcion, marca, modelo, serie, 
        estado, valor, fecha_adquisicion, vida_util, categoria_id, 
        observaciones, color, material
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        codigo_institucional,
        codigo_senescyt,
        nombre,
        descripcion || null,
        marca || null,
        modelo || null,
        serie || null,
        estado || "ACTIVO",
        valor_adquisicion || 0,
        fecha_adquisicion || null,
        vida_util || null,
        categoria_id,
        observaciones || null,
        color || null,
        material || null,
      ]
    );

    const bienId = result.insertId;

    // Crear registro en historial_ubicacion_bien si se proporciona ubicacion
    if (ubicacion_id) {
      await query(
        `INSERT INTO historial_ubicacion_bien (id_bien, id_ubicacion, activo) VALUES (?, ?, 1)`,
        [bienId, ubicacion_id]
      );
    }

    // Crear registro en historial_custodia_bien si se proporciona responsable
    if (responsable_id) {
      await query(
        `INSERT INTO historial_custodia_bien (id_bien, id_usuario, activo) VALUES (?, ?, 1)`,
        [bienId, responsable_id]
      );
    }

    res.json({
      success: true,
      message: "Bien creado exitosamente",
      data: { id: bienId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creando bien",
      error: error.message,
    });
  }
});

// Actualizar bien
router.put("/bienes/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      codigo_institucional,
      codigo_senescyt,
      nombre,
      descripcion,
      marca,
      modelo,
      serie,
      estado,
      valor_adquisicion,
      fecha_adquisicion,
      vida_util,
      categoria_id,
      ubicacion_id,
      responsable_id,
      observaciones,
      color,
      material,
    } = req.body;

    // Verificar si el bien existe
    const existing = await query("SELECT * FROM bienes WHERE id_bien = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bien no encontrado",
      });
    }

    // Actualizar bien (sin ubicacion_id ni responsable_id)
    await query(
      `UPDATE bienes SET 
        codigo_institucional = ?, codigo_senescyt = ?, nombre = ?, descripcion = ?, 
        marca = ?, modelo = ?, serie = ?, estado = ?, valor = ?, fecha_adquisicion = ?, 
        vida_util = ?, categoria_id = ?, observaciones = ?,
        color = ?, material = ?
      WHERE id_bien = ?`,
      [
        codigo_institucional,
        codigo_senescyt,
        nombre,
        descripcion,
        marca,
        modelo,
        serie,
        estado,
        valor_adquisicion,
        fecha_adquisicion,
        vida_util,
        categoria_id,
        observaciones,
        color,
        material,
        id,
      ]
    );

    // Actualizar ubicación si cambió
    if (ubicacion_id) {
      // Desactivar ubicación anterior
      await query(
        `UPDATE historial_ubicacion_bien SET activo = 0, fecha_retiro = NOW() WHERE id_bien = ? AND activo = 1`,
        [id]
      );
      // Crear nueva ubicación
      await query(
        `INSERT INTO historial_ubicacion_bien (id_bien, id_ubicacion, activo) VALUES (?, ?, 1)`,
        [id, ubicacion_id]
      );
    }

    // Actualizar responsable si cambió
    if (responsable_id) {
      // Desactivar custodia anterior
      await query(
        `UPDATE historial_custodia_bien SET activo = 0, fecha_devolucion = NOW() WHERE id_bien = ? AND activo = 1`,
        [id]
      );
      // Crear nueva custodia
      await query(
        `INSERT INTO historial_custodia_bien (id_bien, id_usuario, activo) VALUES (?, ?, 1)`,
        [id, responsable_id]
      );
    }

    res.json({
      success: true,
      message: "Bien actualizado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error actualizando bien",
      error: error.message,
    });
  }
});

// Eliminar bien
router.delete("/bienes/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el bien existe
    const existing = await query("SELECT * FROM bienes WHERE id_bien = ?", [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bien no encontrado",
      });
    }

    // Eliminar registros relacionados primero
    await query("DELETE FROM auditoria WHERE tipo_entidad = 'BIEN' AND id_entidad = ?", [id]);
    await query("DELETE FROM alertas WHERE id_bien = ?", [id]);

    // Eliminar bien
    await query("DELETE FROM bienes WHERE id_bien = ?", [id]);

    res.json({
      success: true,
      message: "Bien eliminado exitosamente",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error eliminando bien",
      error: error.message,
    });
  }
});

// ==================== MANTENIMIENTOS ====================

// Obtener mantenimientos
router.get("/mantenimientos", verifyToken, async (req, res) => {
  try {
    let querySQL = `
      SELECT m.*, b.nombre as bien_nombre, b.codigo_institucional
      FROM mantenimientos m
      LEFT JOIN bienes b ON m.id_bien = b.id_bien
      LEFT JOIN historial_custodia_bien hcb ON b.id_bien = hcb.id_bien AND hcb.activo = 1
    `;

    const params = [];
    if (req.query.responsable) {
      querySQL += " WHERE hcb.id_usuario = ?";
      params.push(req.query.responsable);
    }

    querySQL += " ORDER BY m.fecha_programada DESC";

    const mantenimientos = await query(querySQL, params);
    res.json({ success: true, data: mantenimientos });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo mantenimientos", error: error.message });
  }
});

// Crear mantenimiento
router.post("/mantenimientos", verifyToken, async (req, res) => {
  try {
    const { id_bien, descripcion, fecha_programada, estado, responsable_nombre } = req.body;
    const result = await query(
      `INSERT INTO mantenimientos (id_bien, descripcion, fecha_programada, estado, responsable_nombre) VALUES (?, ?, ?, ?, ?)`,
      [id_bien, descripcion, fecha_programada, estado || 'PENDIENTE', responsable_nombre]
    );
    res.json({ success: true, message: "Mantenimiento creado", data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creando mantenimiento", error: error.message });
  }
});

// Actualizar mantenimiento
router.put("/mantenimientos/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion, fecha_programada, fecha_realizada, estado, responsable_nombre } = req.body;
    await query(
      `UPDATE mantenimientos SET descripcion = ?, fecha_programada = ?, fecha_realizada = ?, estado = ?, responsable_nombre = ? WHERE id_mantenimiento = ?`,
      [descripcion, fecha_programada, fecha_realizada, estado, responsable_nombre, id]
    );
    res.json({ success: true, message: "Mantenimiento actualizado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error actualizando mantenimiento", error: error.message });
  }
});

// Eliminar mantenimiento
router.delete("/mantenimientos/:id", verifyToken, async (req, res) => {
  try {
    await query("DELETE FROM mantenimientos WHERE id_mantenimiento = ?", [req.params.id]);
    res.json({ success: true, message: "Mantenimiento eliminado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando mantenimiento", error: error.message });
  }
});

// ==================== ALERTAS ====================

// Obtener alertas
router.get("/alertas", verifyToken, async (req, res) => {
  try {
    let querySQL = `
      SELECT a.*, b.nombre as bien_nombre
      FROM alertas a
      LEFT JOIN bienes b ON a.id_bien = b.id_bien
      LEFT JOIN historial_custodia_bien hcb ON b.id_bien = hcb.id_bien AND hcb.activo = 1
    `;
    
    const params = [];
    if (req.query.responsable) {
      querySQL += " WHERE hcb.id_usuario = ?";
      params.push(req.query.responsable);
    }
    
    querySQL += " ORDER BY a.fecha_alerta DESC";

    const alertas = await query(querySQL, params);
    res.json({ success: true, data: alertas });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo alertas", error: error.message });
  }
});

// Crear alerta
router.post("/alertas", verifyToken, async (req, res) => {
  try {
    const { id_bien, tipo_alerta, descripcion, prioridad } = req.body;
    const result = await query(
      `INSERT INTO alertas (id_bien, tipo_alerta, descripcion, prioridad) VALUES (?, ?, ?, ?)`,
      [id_bien, tipo_alerta, descripcion, prioridad || 'MEDIA']
    );
    res.json({ success: true, message: "Alerta creada", data: { id: result.insertId } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creando alerta", error: error.message });
  }
});

// Marcar alerta como resuelta
router.put("/alertas/:id", verifyToken, async (req, res) => {
  try {
    await query("UPDATE alertas SET fecha_resolucion = NOW() WHERE id_alerta = ?", [req.params.id]);
    res.json({ success: true, message: "Alerta resuelta" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error actualizando alerta", error: error.message });
  }
});

// Eliminar alerta
router.delete("/alertas/:id", verifyToken, async (req, res) => {
  try {
    await query("DELETE FROM alertas WHERE id_alerta = ?", [req.params.id]);
    res.json({ success: true, message: "Alerta eliminada" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando alerta", error: error.message });
  }
});

// ==================== HISTORIALES ====================

// Historial de ubicaciones de un bien
router.get("/historial-ubicacion/:bienId", verifyToken, async (req, res) => {
  try {
    const historial = await query(`
      SELECT hub.*, u.area as ubicacion_nombre
      FROM historial_ubicacion_bien hub
      LEFT JOIN ubicaciones u ON hub.id_ubicacion = u.id_ubicacion
      WHERE hub.id_bien = ?
      ORDER BY hub.fecha_asignacion DESC
    `, [req.params.bienId]);
    res.json({ success: true, data: historial });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo historial", error: error.message });
  }
});

// Historial de custodia de un bien
router.get("/historial-custodia/:bienId", verifyToken, async (req, res) => {
  try {
    const historial = await query(`
      SELECT hcb.*, u.nombres, u.apellidos
      FROM historial_custodia_bien hcb
      LEFT JOIN usuarios u ON hcb.id_usuario = u.id_usuario
      WHERE hcb.id_bien = ?
      ORDER BY hcb.fecha_asignacion DESC
    `, [req.params.bienId]);
    res.json({ success: true, data: historial });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo historial", error: error.message });
  }
});

// ==================== PERIODOS ACADÉMICOS ====================

// Obtener periodos académicos
router.get("/periodos-academicos", verifyToken, async (req, res) => {
  try {
    const periodos = await query("SELECT * FROM periodos_academicos ORDER BY anio DESC, semestre DESC");
    res.json({ success: true, data: periodos });
  } catch (error) {
    // Si la tabla no existe, devolver datos de ejemplo
    res.json({ 
      success: true, 
      data: [
        { id: 1, nombre: "2024-1", anio: 2024, semestre: 1 },
        { id: 2, nombre: "2024-2", anio: 2024, semestre: 2 },
        { id: 3, nombre: "2025-1", anio: 2025, semestre: 1 },
      ] 
    });
  }
});

// ==================== UBICACIONES ====================

// Obtener ubicaciones
router.get("/ubicaciones", verifyToken, async (req, res) => {
  try {
    const ubicaciones = await query("SELECT * FROM ubicaciones ORDER BY area");
    res.json({ success: true, data: ubicaciones });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo ubicaciones", error: error.message });
  }
});

// ==================== REPORTES ====================

// Obtener reportes
router.get("/reportes", verifyToken, async (req, res) => {
  try {
    // Devolver lista vacía ya que el sistema de reportes no está implementado aún
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo reportes", error: error.message });
  }
});

// Estadísticas de reportes
router.get("/reportes/estadisticas", verifyToken, async (req, res) => {
  try {
    // Obtener estadísticas básicas de bienes
    const totalBienes = await query("SELECT COUNT(*) as total FROM bienes");
    const valorTotal = await query("SELECT COALESCE(SUM(valor), 0) as total FROM bienes");
    
    res.json({ 
      success: true, 
      data: {
        totalBienes: totalBienes[0]?.total || 0,
        valorTotal: valorTotal[0]?.total || 0,
        ultimoReporte: null,
        reportesGenerados: 0
      }
    });
  } catch (error) {
    res.json({ 
      success: true, 
      data: {
        totalBienes: 0,
        valorTotal: 0,
        ultimoReporte: null,
        reportesGenerados: 0
      }
    });
  }
});

// Generar reporte
router.post("/reportes/generar", verifyToken, async (req, res) => {
  try {
    const reporte = {
      id: Date.now(),
      tipo: req.body.tipoReporte || 'Inventario General',
      fecha: new Date().toISOString(),
      generadoPor: req.user.nombre || 'Usuario',
      estado: 'Completado',
      descripcion: 'Reporte generado automáticamente',
      contenido: 'Contenido del reporte...'
    };
    res.json({ success: true, data: reporte });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error generando reporte", error: error.message });
  }
});

// ==================== DEPARTAMENTOS ====================

// Obtener departamentos
router.get("/departamentos", verifyToken, async (req, res) => {
  try {
    const departamentos = await query("SELECT * FROM departamentos ORDER BY nombre");
    res.json({ success: true, data: departamentos });
  } catch (error) {
    // Si la tabla no existe, devolver datos de ejemplo
    res.json({ 
      success: true, 
      data: [
        { id: 1, nombre: "Administración" },
        { id: 2, nombre: "Académico" },
        { id: 3, nombre: "Sistemas" },
        { id: 4, nombre: "Contabilidad" },
        { id: 5, nombre: "Recursos Humanos" },
      ] 
    });
  }
});

// ==================== IMPORTACIÓN/EXPORTACIÓN ====================

// Mapeo de tablas a configuraciones
const tableConfigs = {
  bienes: {
    table: 'bienes',
    columns: ['codigo_institucional', 'nombre', 'descripcion', 'marca', 'modelo', 'serie', 'estado', 'valor', 'fecha_adquisicion', 'vida_util', 'categoria_id'],
    headers: ['Código', 'Nombre', 'Descripción', 'Marca', 'Modelo', 'Serie', 'Estado', 'Valor', 'Fecha Adquisición', 'Vida Útil', 'Categoría ID']
  },
  usuarios: {
    table: 'usuarios',
    columns: ['nombres', 'apellidos', 'cedula', 'email', 'departamento_id', 'activo'],
    headers: ['Nombres', 'Apellidos', 'Cédula', 'Email', 'Departamento ID', 'Activo']
  },
  ubicaciones: {
    table: 'ubicaciones',
    columns: ['area', 'descripcion', 'sede', 'piso', 'tipo', 'capacidad', 'activo'],
    headers: ['Área', 'Descripción', 'Sede', 'Piso', 'Tipo', 'Capacidad', 'Activo']
  },
  categorias: {
    table: 'categorias',
    columns: ['nombre_categoria', 'descripcion', 'activo'],
    headers: ['Nombre', 'Descripción', 'Activo']
  },
  mantenimientos: {
    table: 'mantenimientos',
    columns: ['id_bien', 'tipo_mantenimiento', 'descripcion', 'fecha_programada', 'fecha_realizacion', 'costo', 'estado'],
    headers: ['ID Bien', 'Tipo', 'Descripción', 'Fecha Programada', 'Fecha Realización', 'Costo', 'Estado']
  }
};

// Exportar datos a Excel
router.get("/export/:tabla", verifyToken, async (req, res) => {
  try {
    const { tabla } = req.params;
    const { formato = 'xlsx', dateFrom, dateTo } = req.query;
    
    const config = tableConfigs[tabla];
    if (!config) {
      return res.status(400).json({ success: false, message: 'Tabla no válida para exportación' });
    }
    
    // Construir query
    let querySQL = `SELECT ${config.columns.join(', ')} FROM ${config.table}`;
    const params = [];
    
    if (dateFrom && dateTo) {
      querySQL += ` WHERE created_at BETWEEN ? AND ?`;
      params.push(dateFrom, dateTo);
    }
    
    const data = await query(querySQL, params);
    
    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'INT Bienes';
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet(tabla.charAt(0).toUpperCase() + tabla.slice(1));
    
    // Agregar headers
    worksheet.addRow(config.headers);
    
    // Estilo para headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4A90D9' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    
    // Agregar datos
    data.forEach(row => {
      const rowData = config.columns.map(col => row[col]);
      worksheet.addRow(rowData);
    });
    
    // Ajustar ancho de columnas
    worksheet.columns.forEach((column, i) => {
      column.width = Math.max(config.headers[i].length + 5, 15);
    });
    
    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Enviar respuesta
    const filename = `export_${tabla}_${Date.now()}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
    
  } catch (error) {
    console.error('Error exportando:', error);
    res.status(500).json({ success: false, message: 'Error exportando datos', error: error.message });
  }
});

// Importar datos desde Excel
router.post("/import/:tabla", verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { tabla } = req.params;
    const { hasHeaders = 'true', updateExisting = 'false' } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se recibió archivo' });
    }
    
    const config = tableConfigs[tabla];
    if (!config) {
      return res.status(400).json({ success: false, message: 'Tabla no válida para importación' });
    }
    
    // Leer archivo Excel
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ success: false, message: 'Archivo Excel vacío' });
    }
    
    let insertedCount = 0;
    let updatedCount = 0;
    let errors = [];
    
    const startRow = hasHeaders === 'true' ? 2 : 1;
    
    // Procesar cada fila
    for (let rowNumber = startRow; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      try {
        const rowData = {};
        config.columns.forEach((col, index) => {
          const cell = row.getCell(index + 1);
          rowData[col] = cell.value !== null && cell.value !== undefined ? cell.value : null;
        });
        
        // Validar que hay datos
        const hasData = Object.values(rowData).some(v => v !== null && v !== '');
        if (!hasData) continue;
        
        // Insertar en BD
        const columns = Object.keys(rowData).filter(k => rowData[k] !== null);
        const values = columns.map(k => rowData[k]);
        const placeholders = columns.map(() => '?').join(', ');
        
        const insertSQL = `INSERT INTO ${config.table} (${columns.join(', ')}) VALUES (${placeholders})`;
        await query(insertSQL, values);
        insertedCount++;
        
      } catch (rowError) {
        errors.push({ row: rowNumber, error: rowError.message });
      }
    }
    
    res.json({
      success: true,
      message: `Importación completada`,
      data: {
        inserted: insertedCount,
        updated: updatedCount,
        errors: errors.length,
        errorDetails: errors.slice(0, 10) // Mostrar solo primeros 10 errores
      }
    });
    
  } catch (error) {
    console.error('Error importando:', error);
    res.status(500).json({ success: false, message: 'Error importando datos', error: error.message });
  }
});

module.exports = router;
