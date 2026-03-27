// Utilidad para mapear ubicacion_id a nombre de ubicacion
export function getUbicacionNombre(ubicaciones, id) {
  if (!id) return '-';
  const found = ubicaciones.find(u => u.id_ubicacion === id);
  return found ? found.nombre : id;
}
