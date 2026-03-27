// routes/usuarios.js - CRUD de usuarios
const express = require("express");
const router = express.Router();
const { query } = require("../config/database");
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { hashPassword } = require("../helpers/password");

// Mapper local para usuarios con todos los campos que el frontend espera
function mapUserRow(row) {
  if (!row) return null;
  return {
    id: row.id_usuario,
    nombre: row.nombres,
    apellido: row.apellidos,
    nombres: row.nombres,
    apellidos: row.apellidos,
    email: row.email,
    cedula: row.cedula,
    documento: row.cedula, // Alias para frontend
    telefono: row.telefono,
    departamento_id: row.departamento_id,
    departamento: row.departamento_nombre || null,
    area_id: row.area_id,
    area: row.area_nombre || null,
    rol_id: row.rol_id,
    rol: row.rol_nombre || 'Sin rol',
    roles: row.rol_nombre ? [row.rol_nombre] : [],
    activo: row.activo === 1,
    estado: row.activo === 1 ? 'activo' : 'inactivo', // lowercase para comparación
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// GET /usuarios - Listar usuarios
router.get("/", verifyToken, async (req, res) => {
  try {
    const { search, activo } = req.query;
    
    // Incluir JOIN con roles, áreas y departamentos para obtener nombres
    let sql = `
      SELECT u.*, r.nombre_rol as rol_nombre, a.nombre as area_nombre, d.nombre as departamento_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id_rol
      LEFT JOIN areas a ON u.area_id = a.id
      LEFT JOIN departamentos d ON u.departamento_id = d.id_departamento
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += " AND (u.nombres LIKE ? OR u.apellidos LIKE ? OR u.email LIKE ? OR u.cedula LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (activo !== undefined) {
      sql += " AND u.activo = ?";
      params.push(activo === "true" ? 1 : 0);
    } else {
      // Por defecto solo activos
      sql += " AND u.activo = 1";
    }

    sql += " ORDER BY u.nombres, u.apellidos";

    const users = await query(sql, params);

    res.json({ success: true, data: users.map(mapUserRow) });
  } catch (error) {
    console.error("[ERROR] GET /usuarios:", error.message);
    res.json({ success: true, data: [] });
  }
});

// GET /usuarios/:id - Obtener usuario por ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const users = await query(`
      SELECT u.*, r.nombre_rol as rol_nombre, a.nombre as area_nombre, d.nombre as departamento_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id_rol
      LEFT JOIN areas a ON u.area_id = a.id
      LEFT JOIN departamentos d ON u.departamento_id = d.id_departamento
      WHERE u.id_usuario = ?
    `, [id]);

    if (!users.length) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, data: mapUserRow(users[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error obteniendo usuario", error: error.message });
  }
});

// Helper para obtener o crear departamento
async function getOrCreateDepartamento(nombre, id) {
  if (id) return id; // Si ya viene ID, usarlo
  if (!nombre) return null;
  
  const cleanName = nombre.trim();
  if (!cleanName) return null;

  try {
    const existing = await query("SELECT id_departamento FROM departamentos WHERE nombre = ?", [cleanName]);
    if (existing.length > 0) return existing[0].id_departamento;

    const result = await query("INSERT INTO departamentos (nombre) VALUES (?)", [cleanName]);
    return result.insertId;
  } catch (error) {
    console.error("Error en getOrCreateDepartamento:", error);
    return null;
  }
}

// Validaciones de cédula/documento por país
function validateCedulaByCountry(cedula, pais) {
  if (!cedula) return { valid: true };

  switch (pais) {
    case 'EC':
      // Cédula ecuatoriana
      if (!/^\d{10}$/.test(cedula)) {
        return { valid: false, error: 'Cédula ecuatoriana debe tener exactamente 10 dígitos' };
      }
      const province = parseInt(cedula.substring(0, 2), 10);
      if (province < 1 || province > 24) {
        return { valid: false, error: 'Provincia inválida en cédula ecuatoriana' };
      }
      const third = parseInt(cedula.charAt(2), 10);
      if (third >= 6) {
        return { valid: false, error: 'Tipo de cédula ecuatoriana inválido' };
      }

      const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2];
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        let val = parseInt(cedula.charAt(i), 10) * coefficients[i];
        if (val > 9) val -= 9;
        sum += val;
      }
      const verifier = (10 - (sum % 10)) % 10;
      if (verifier !== parseInt(cedula.charAt(9), 10)) {
        return { valid: false, error: 'Checksum inválido en cédula ecuatoriana' };
      }
      return { valid: true };

    case 'CO':
      // Cédula colombiana: 7-10 dígitos
      if (!/^\d{7,10}$/.test(cedula)) {
        return { valid: false, error: 'Cédula colombiana debe tener 7-10 dígitos' };
      }
      return { valid: true };

    case 'VE':
      // CI venezolano: 7-8 dígitos, opcionalmente con prefijo V/E
      if (!/^([VE]-?)?\d{7,8}$/.test(cedula)) {
        return { valid: false, error: 'CI venezolano debe tener 7-8 dígitos, opcionalmente con prefijo V/E' };
      }
      return { valid: true };

    case 'OTRO':
      // Documento genérico: 4-20 caracteres alfanuméricos
      if (!/^[A-Za-z0-9\- ]{4,20}$/.test(cedula)) {
        return { valid: false, error: 'Documento debe tener 4-20 caracteres alfanuméricos' };
      }
      return { valid: true };

    default:
      return { valid: true };
  }
}

// POST /usuarios - Crear usuario
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    console.log("[DEBUG] POST /usuarios - Body recibido:", JSON.stringify(req.body, null, 2));
    let { nombres, apellidos, email, password, cedula, telefono, rol_id, departamento, departamento_id, area_id, activo } = req.body;

    // Normalize empty strings to null and trim
    email = email && String(email).trim() !== '' ? String(email).trim() : null;
    cedula = cedula && String(cedula).trim() !== '' ? String(cedula).trim() : null;
    telefono = telefono && String(telefono).trim() !== '' ? String(telefono).trim() : null;

    // Validación de cédula ecuatoriana
    if (cedula) {
      const validation = validateCedulaByCountry(cedula, 'EC');
      if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.error });
      }
    }

    // Validación de teléfono (Ecuador)
    const validateEcuadorianPhone = (phone) => {
      if (!phone) return true; // no obligatorio
      return /^09\d{8}$/.test(String(phone));
    };

    if (telefono && !validateEcuadorianPhone(telefono)) {
      return res.status(400).json({ success: false, message: 'Teléfono inválido (debe tener 10 dígitos y comenzar con 09).' });
    }

    const missing = [];
    if (!nombres) missing.push("nombres");
    if (!password) missing.push("password");

    if (missing.length > 0) {
      return res.status(400).json({ success: false, message: `Faltan campos requeridos: ${missing.join(", ")}` });
    }

    // Validar nombres duplicados (crear)
    if (nombres) {
      const existingNombre = await query(
        "SELECT id_usuario FROM usuarios WHERE LOWER(CONCAT(nombres, ' ', apellidos)) = ?",
        [(`${nombres} ${apellidos || ''}`).toLowerCase()]
      );
      if (existingNombre.length) {
        return res.status(400).json({ success: false, message: `El nombre "${nombres} ${apellidos || ''}" ya existe en el sistema` });
      }
    }

    // Validar email duplicado (si se proporciona)
    if (email) {
      const existingEmail = await query("SELECT id_usuario FROM usuarios WHERE LOWER(email) = ?", [email.toLowerCase()]);
      if (existingEmail.length) {
        return res.status(400).json({ success: false, message: `El email "${email}" ya está registrado` });
      }
    }

    // Validar cédula duplicada (si se proporciona)
    if (cedula) {
      const existingCedula = await query("SELECT id_usuario FROM usuarios WHERE cedula = ?", [cedula]);
      if (existingCedula.length) {
        return res.status(400).json({ success: false, message: `La cédula "${cedula}" ya está registrada` });
      }
    }

    // Validar teléfono duplicado (si se proporciona)
    if (telefono) {
      const existingTelefono = await query("SELECT id_usuario FROM usuarios WHERE telefono = ?", [telefono]);
      if (existingTelefono.length) {
        return res.status(400).json({ success: false, message: `El teléfono "${telefono}" ya está registrado` });
      }
    }

    const passwordHash = hashPassword(password);
    
    // Resolver departamento
    const finalDepartamentoId = await getOrCreateDepartamento(departamento, departamento_id);

    const result = await query(
      `INSERT INTO usuarios (nombres, apellidos, email, password_hash, cedula, telefono, rol_id, departamento_id, area_id, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombres, apellidos || null, email ? email.toLowerCase() : null, passwordHash, cedula || null, telefono || null, rol_id || null, finalDepartamentoId, area_id || null, activo !== false ? 1 : 0]
    );

    res.json({ success: true, message: "Usuario creado", data: { id: result.insertId } });
  } catch (error) {
    console.error("[ERROR] POST /usuarios - Error creando usuario:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Error creando usuario", error: error.message });
  }
});

// PUT /usuarios/:id - Actualizar usuario
router.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID de usuario inválido" });
    }

    let { nombres, apellidos, email, password, cedula, telefono, activo, rol_id, departamento, departamento_id, area_id } = req.body;

    // Obtener usuario actual para comparaciones
    const [usuarioActual] = await query("SELECT cedula, email, telefono, nombres, apellidos FROM usuarios WHERE id_usuario = ?", [id]);
    if (!usuarioActual) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }

    // Si SOLO se está cambiando el estado (activo), hacer actualización simple
    const soloActivo = activo !== undefined && 
                       !nombres && 
                       !apellidos && 
                       !email && 
                       !cedula && 
                       !telefono && 
                       !rol_id && 
                       !departamento && 
                       !departamento_id &&
                       !area_id &&
                       !password;

    if (soloActivo) {
      await query("UPDATE usuarios SET activo = ? WHERE id_usuario = ?", [activo ? 1 : 0, id]);
      return res.json({ success: true, message: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente` });
    }

    // Si se actualiza otros datos, hacer validaciones completas
    // Normalize empty strings to null and trim
    email = email && String(email).trim() !== '' ? String(email).trim() : null;
    cedula = cedula && String(cedula).trim() !== '' ? String(cedula).trim() : null;
    telefono = telefono && String(telefono).trim() !== '' ? String(telefono).trim() : null;

    // Validación de cédula ecuatoriana SOLO si cambió
    if (cedula && cedula !== usuarioActual.cedula) {
      const validation = validateCedulaByCountry(cedula, 'EC');
      if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.error });
      }
    }

    // Validación de teléfono (Ecuador)
    const validateEcuadorianPhone = (phone) => {
      if (!phone) return true;
      return /^09\d{8}$/.test(String(phone));
    };

    if (telefono && !validateEcuadorianPhone(telefono)) {
      return res.status(400).json({ success: false, message: 'Teléfono inválido (debe tener 10 dígitos y comenzar con 09).' });
    }

    // Resolver departamento
    const finalDepartamentoId = await getOrCreateDepartamento(departamento, departamento_id);
    
    // Validar nombres duplicados (actualizar) - excluye el usuario actual
    if (nombres) {
      const existingNombre = await query(
        "SELECT id_usuario FROM usuarios WHERE LOWER(CONCAT(nombres, ' ', apellidos)) = ? AND id_usuario != ?",
        [(`${nombres} ${apellidos || ''}`).toLowerCase(), id]
      );
      if (existingNombre.length) {
        return res.status(400).json({ success: false, message: `El nombre "${nombres} ${apellidos || ''}" ya existe en el sistema` });
      }
    }

    // Validar email duplicado (excluye el usuario actual) - solo si se proporciona
    if (email) {
      const existingEmail = await query(
        "SELECT id_usuario FROM usuarios WHERE LOWER(email) = ? AND id_usuario != ?",
        [email.toLowerCase(), id]
      );
      if (existingEmail.length) {
        return res.status(400).json({ success: false, message: `El email "${email}" ya está registrado` });
      }
    }

    // Validar cédula duplicada (si se proporciona)
    if (cedula) {
      const existingCedula = await query(
        "SELECT id_usuario FROM usuarios WHERE cedula = ? AND id_usuario != ?",
        [cedula, id]
      );
      if (existingCedula.length) {
        return res.status(400).json({ success: false, message: `La cédula "${cedula}" ya está registrada` });
      }
    }

    // Validar teléfono duplicado (si se proporciona)
    if (telefono) {
      const existingTelefono = await query(
        "SELECT id_usuario FROM usuarios WHERE telefono = ? AND id_usuario != ?",
        [telefono, id]
      );
      if (existingTelefono.length) {
        return res.status(400).json({ success: false, message: `El teléfono "${telefono}" ya está registrado` });
      }
    }

    let sql = "UPDATE usuarios SET nombres = ?, apellidos = ?, email = ?, cedula = ?, telefono = ?, activo = ?, rol_id = ?, departamento_id = ?, area_id = ?";
    const params = [nombres, apellidos || null, email ? email.toLowerCase() : null, cedula || null, telefono || null, activo ? 1 : 0, rol_id || null, finalDepartamentoId, area_id || null];

    if (password) {
      sql += ", password_hash = ?";
      params.push(hashPassword(password));
    }

    sql += " WHERE id_usuario = ?";
    params.push(id);

    await query(sql, params);

    res.json({ success: true, message: "Usuario actualizado" });
  } catch (error) {
    console.error("[ERROR] PUT /usuarios/:id - Error actualizando usuario:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Error actualizando usuario", error: error.message });
  }
});

// DELETE /usuarios/:id - Desactivar usuario
router.delete("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await query("UPDATE usuarios SET activo = 0 WHERE id_usuario = ?", [id]);
    res.json({ success: true, message: "Usuario desactivado" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error eliminando usuario", error: error.message });
  }
});

// DELETE /usuarios/:id/permanent - Eliminación definitiva (solo si está inactivo)
router.delete("/:id/permanent", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const rows = await query("SELECT activo FROM usuarios WHERE id_usuario = ?", [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    if (rows[0].activo === 1) {
      return res.status(400).json({ success: false, message: 'El usuario debe estar inactivo antes de eliminarlo definitivamente' });
    }

    await query("DELETE FROM usuarios WHERE id_usuario = ?", [id]);
    res.json({ success: true, message: 'Usuario eliminado definitivamente' });
  } catch (error) {
    console.error('[ERROR] DELETE /usuarios/:id/permanent', error.message);
    res.status(500).json({ success: false, message: 'Error eliminando usuario definitivamente', error: error.message });
  }
});

// GET /usuarios/:id/roles
router.get("/:id/roles", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [user] = await query("SELECT rol_id FROM usuarios WHERE id_usuario = ?", [id]);
    if (user && user.rol_id) {
      const roles = await query("SELECT id_rol as id, nombre_rol as nombre FROM roles WHERE id_rol = ?", [user.rol_id]);
      res.json({ success: true, data: roles });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

// GET /usuarios/:id/check-restrictions - Verificar restricciones para modificar usuario
router.get("/:id/check-restrictions", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener usuario con su rol
    const users = await query(
      `SELECT u.*, r.nombre_rol as rol_nombre 
       FROM usuarios u 
       LEFT JOIN roles r ON u.rol_id = r.id_rol 
       WHERE u.id_usuario = ?`,
      [id]
    );
    
    if (!users.length) {
      return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    }
    
    const user = users[0];
    const restrictions = {
      canDelete: true,
      canToggleStatus: true,
      reasons: []
    };
    
    // Restricción 1: No permitir acciones sobre usuarios Administrador
    if (user.rol_nombre && user.rol_nombre.toLowerCase() === 'administrador') {
      restrictions.canDelete = false;
      restrictions.canToggleStatus = false;
      restrictions.reasons.push('No se puede modificar un usuario con rol Administrador');
    }
    
    // Restricción 2: Verificar si el usuario tiene bienes asignados
    const assignments = await query(
      `SELECT COUNT(*) as count FROM asignaciones_bien WHERE id_usuario = ? AND activo = 1`,
      [id]
    );
    
    if (assignments[0] && assignments[0].count > 0) {
      restrictions.canDelete = false;
      restrictions.canToggleStatus = false;
      restrictions.reasons.push(`Este usuario tiene ${assignments[0].count} bien(es) asignado(s)`);
    }
    
    res.json({ success: true, data: restrictions });
  } catch (error) {
    console.error("[ERROR] GET /usuarios/:id/check-restrictions:", error.message);
    res.status(500).json({ success: false, message: "Error verificando restricciones", error: error.message });
  }
});

module.exports = router;
