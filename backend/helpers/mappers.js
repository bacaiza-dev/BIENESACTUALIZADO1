// helpers/mappers.js - Funciones para mapear filas de BD a objetos
const { formatDate, normalizeEstadoBien, normalizeEstadoUbicacion } = require("./utils");

/**
 * Mapear fila de usuario
 * BD usa: nombres, apellidos (no nombre, apellido)
 */
function mapUserRow(row, roles = []) {
  if (!row) return null;
  const roleNames = roles.map((r) => (typeof r === "string" ? r : r.nombre));
  return {
    id: row.id_usuario,
    nombre: row.nombres || row.nombre,
    apellido: row.apellidos || row.apellido,
    nombres: row.nombres,
    apellidos: row.apellidos,
    email: row.email,
    cedula: row.cedula,
    documento: row.cedula, // Alias para frontend
    telefono: row.telefono,
    departamento_id: row.departamento_id,
    departamento: row.departamento_nombre || null,
    rol_id: row.rol_id,
    rol: roleNames[0] || row.rol_nombre || 'Sin rol',
    activo: row.activo === 1,
    estado: row.activo === 1 ? 'activo' : 'inactivo',
    created_at: row.created_at,
    updated_at: row.updated_at,
    roles: roleNames,
  };
}

/**
 * Mapear fila de categoría
 * BD usa: id_categoria, nombre_categoria (no id_cat, nombre)
 */
function mapCategoriaRow(row) {
  if (!row) return null;
  return {
    id: row.id_categoria || row.id_cat,
    nombre: row.nombre_categoria || row.nombre,
    nombre_categoria: row.nombre_categoria,
    descripcion: row.descripcion,
    codigo: row.codigo,
    tipo: row.tipo,
    observaciones: row.observaciones,
    activo: row.activo === 1,
    bienes_count: row.bienes_count || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Mapear fila de ubicación
 */
function mapUbicacionRow(row) {
  if (!row) return null;
  return {
    id: row.id_ubicacion,
    nombre: row.area || row.descripcion,
    area: row.area,
    descripcion: row.descripcion,
    sede: row.sede,
    edificio: row.sede,
    piso: row.piso,
    aula: row.numero_aula,
    numero_aula: row.numero_aula,
    capacidad: row.capacidad,
    estado: normalizeEstadoUbicacion(row.estado, row.activo),
    activo: row.activo === 1,
    id_campus: row.id_campus,
    campus_nombre: row.campus_nombre || null,
    bienes_count: row.bienes_count || 0,
  };
}

/**
 * Mapear fila de aula asignada a custodio
 */
function mapAulaCustodioRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    ubicacion_id: row.ubicacion_id,
    usuario_id: row.usuario_id,
    periodo_id: row.periodo_id,
    observaciones: row.observaciones,
    activo: row.activo === 1,
    ubicacion: {
      id: row.ubicacion_id,
      nombre: row.ubicacion_nombre || row.area,
      tipo: row.ubicacion_tipo,
      piso: row.ubicacion_piso,
      edificio: row.ubicacion_sede,
      aula: row.numero_aula,
    },
    custodio: {
      id: row.usuario_id,
      nombre: row.custodio_nombre || row.custodio_nombres,
      apellido: row.custodio_apellido || row.custodio_apellidos,
      email: row.custodio_email,
    },
    periodo: {
      id: row.periodo_id,
      nombre: row.periodo_nombre,
    },
  };
}

/**
 * Mapear fila de periodo académico
 */
function mapPeriodoRow(row) {
  if (!row) return null;
  return {
    id: row.id_periodo,
    nombre: row.nombre_periodo,
    tipo: row.tipo,
    anio: row.anio,
    fecha_inicio: formatDate(row.fecha_inicio),
    fecha_fin: formatDate(row.fecha_fin),
    descripcion: row.descripcion,
    activo: row.activo === 1,
    bienesAsignados: row.bienes_count || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Mapear fila de bien
 * BD usa: valor (no valor_adquisicion)
 * Frontend espera: categoria, ubicacion, responsable como OBJETOS {id, nombre}
 */
function mapBienRow(row) {
  if (!row) return null;
  return {
    id: row.id_bien,
    codigo_institucional: row.codigo_institucional,
    codigo_senescyt: row.codigo_senescyt,
    nombre: row.nombre,
    descripcion: row.descripcion,
    clase_de_bien: row.clase_de_bien,
    marca: row.marca,
    modelo: row.modelo,
    serie: row.serie,
    anio_fabricacion: row.anio_fabricacion,
    estado: normalizeEstadoBien(row.estado),
    valor: row.valor,
    valor_adquisicion: row.valor,
    valor_residual: row.valor_residual,
    vida_util: row.vida_util,
    depreciacion_acumulada: row.depreciacion_acumulada,
    fecha_adquisicion: formatDate(row.fecha_adquisicion),
    proveedor: row.proveedor,
    color: row.color,
    material: row.material,
    observaciones: row.observaciones,
    nro_acta_entrega_recepcion: row.nro_acta_entrega_recepcion,
    nro_acta_constatacion_fisica: row.nro_acta_constatacion_fisica,
    periodo_id: row.periodo_id,
    // Categoría como objeto
    categoria_id: row.categoria_id,
    categoria: row.categoria_id ? {
      id: row.categoria_id,
      nombre: row.categoria_nombre || 'Sin categoría'
    } : null,
    // Ubicación como objeto
    ubicacion_id: row.ubicacion_id,
    ubicacion: row.ubicacion_id ? {
      id: row.ubicacion_id,
      nombre: row.ubicacion_nombre || row.ubicacion_area || 'Sin ubicación',
      sede: row.ubicacion_sede
    } : null,
    // Responsable como objeto
    responsable_id: row.responsable_id,
    responsable: row.responsable_id ? {
      id: row.responsable_id,
      nombre: row.responsable_nombre || 'Sin asignar'
    } : null,
    // Nombre completo calculado (compatibilidad con frontend)
    responsable_completo: row.responsable_nombre ? row.responsable_nombre.trim() : (row.responsable_completo || null),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Mapear fila de mantenimiento
 */
function mapMantenimientoRow(row) {
  if (!row) return null;
  return {
    id: row.id_mantenimiento || row.id_mant,
    tipo: row.tipo,
    descripcion: row.descripcion,
    estado: row.estado,
    fecha_programada: formatDate(row.fecha_programada),
    fecha_limite: formatDate(row.fecha_limite),
    fecha_realizada: formatDate(row.fecha_realizada),
    fecha_ejecucion: formatDate(row.fecha_ejecucion),
    costo_estimado: row.costo_estimado,
    costo_real: row.costo_real,
    proveedor: row.proveedor,
    tecnico_id: row.tecnico_id,
    tecnico_nombre: row.tecnico_nombre,
    // Aliases for compatibility
    responsable: row.tecnico_nombre,
    responsable_nombre: row.tecnico_nombre,
    prioridad: row.prioridad,
    observaciones: row.observaciones,
    bien_id: row.id_bien || row.bien_id,
    bien: row.id_bien ? {
      id: row.id_bien,
      nombre: row.bien_nombre,
      codigo: row.bien_codigo
    } : null,
    bien_nombre: row.bien_nombre,
    bien_codigo: row.codigo_institucional || row.bien_codigo,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Mapear fila de documento
 */
function mapDocumentoRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    bien_id: row.bien_id,
    nombre_original: row.nombre_original,
    nombre_archivo: row.nombre_archivo,
    tipo: row.tipo,
    mime_type: row.mime_type,
    tamaño: row.tamaño || row.tamano,
    descripcion: row.descripcion,
    url: `/api/bienes/${row.bien_id}/documentos/${row.id}/download`,
    created_at: row.created_at,
  };
}

module.exports = {
  mapUserRow,
  mapCategoriaRow,
  mapUbicacionRow,
  mapAulaCustodioRow,
  mapPeriodoRow,
  mapBienRow,
  mapMantenimientoRow,
  mapDocumentoRow,
};
