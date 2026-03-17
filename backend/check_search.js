const { query, closePool } = require('./config/database');

async function testSearch() {
  try {
    console.log("--- STARTING SEARCH DEBUG ---");
    const searchTerm = '%a%'; // Broad search
    const limitNum = 10;

    // 1. Check Bienes Table Count
    const countBienes = await query('SELECT COUNT(*) as c FROM bienes');
    console.log("Total Bienes in DB:", countBienes[0].c);

    // 2. Run Search Query for Bienes
    console.log("Running Bienes Search Query...");
    const bienes = await query(`
      SELECT 
        b.id_bien as id,
        'Bien' as tipo,
        b.nombre as titulo,
        CONCAT('Código: ', b.codigo_institucional, ' | Estado: ', b.estado, 
               COALESCE(CONCAT(' | Marca: ', b.marca), ''),
               COALESCE(CONCAT(' | Ubicación: ', u.area), '')) as descripcion,
        b.created_at as fecha
      FROM bienes b
      LEFT JOIN ubicaciones u ON b.ubicacion_id = u.id_ubicacion
      WHERE b.codigo_institucional LIKE ?
         OR b.nombre LIKE ?
         OR b.clase_de_bien LIKE ?
         OR b.marca LIKE ?
         OR b.modelo LIKE ?
         OR b.serie LIKE ?
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);
    console.log(`Found ${bienes.length} bienes.`);
    if (bienes.length > 0) console.log("First Bien:", JSON.stringify(bienes[0], null, 2));


    // 3. Check Documentos Count
    const countDocs = await query('SELECT COUNT(*) as c FROM documentos_bien');
    console.log("Total Documentos in DB:", countDocs[0].c);

    // 4. Run Search Query for Documentos
    console.log("Running Documentos Search Query...");
    const documentos = await query(`
      SELECT 
        db.id_documento as id,
        'Documento' as tipo,
        db.nombre_archivo as titulo,
        CONCAT('Tipo: ', COALESCE(db.tipo_documento, 'N/A'), 
               ' | Bien: ', COALESCE(b.nombre, 'N/A'),
               COALESCE(CONCAT(' | ', db.descripcion), '')) as descripcion,
        db.uploaded_at as fecha
      FROM documentos_bien db
      LEFT JOIN bienes b ON db.id_bien = b.id_bien
      WHERE db.nombre_archivo LIKE ?
         OR db.tipo_documento LIKE ?
         OR db.descripcion LIKE ?
         OR b.nombre LIKE ?
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, limitNum]);
    console.log(`Found ${documentos.length} documentos.`);
    if (documentos.length > 0) console.log("First Documento:", JSON.stringify(documentos[0], null, 2));


  } catch (err) {
    console.error("DEBUG ERROR:", err);
  } finally {
    await closePool();
  }
}

testSearch();
