/**
 * Utilidades de exportación a PDF y Excel
 */

// Tipos
interface ExportColumn {
  key: string
  label: string
  width?: number
}

interface ExportOptions {
  filename: string
  title: string
  columns: ExportColumn[]
  data: Record<string, any>[]
}

/**
 * Exportar datos a Excel (formato XLSX simplificado como CSV con UTF-8 BOM)
 * Para un Excel real se necesitaría la librería xlsx o exceljs
 */
export const exportToExcel = async (options: ExportOptions): Promise<void> => {
  const { filename, title, columns, data } = options
  
  // Crear encabezado
  const headers = columns.map(col => col.label)
  
  // Crear filas
  const rows = data.map(row => 
    columns.map(col => {
      const value = getNestedValue(row, col.key)
      // Escapar comillas dobles y envolver en comillas
      return `"${String(value ?? '').replace(/"/g, '""')}"`
    }).join('\t')
  )
  
  // Crear contenido con BOM para UTF-8 en Excel
  const BOM = '\uFEFF'
  const content = BOM + [
    `"${title}"`,
    '',
    headers.map(h => `"${h}"`).join('\t'),
    ...rows
  ].join('\n')
  
  // Descargar archivo
  const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' })
  downloadBlob(blob, `${filename}.xls`)
}

/**
 * Exportar datos a PDF
 * Genera un HTML que se abre en nueva ventana para imprimir/guardar como PDF
 */
export const exportToPDF = async (options: ExportOptions): Promise<void> => {
  const { filename, title, columns, data } = options
  
  // Crear filas de la tabla
  const tableRows = data.map(row => `
    <tr>
      ${columns.map(col => `
        <td style="border: 1px solid #ddd; padding: 8px; font-size: 11px;">
          ${getNestedValue(row, col.key) ?? '-'}
        </td>
      `).join('')}
    </tr>
  `).join('')
  
  // Crear HTML del documento
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px;
          max-width: 100%;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #333;
        }
        .header h1 {
          font-size: 18px;
          color: #333;
          margin-bottom: 5px;
        }
        .header p {
          font-size: 12px;
          color: #666;
        }
        table { 
          width: 100%; 
          border-collapse: collapse;
          font-size: 10px;
        }
        th { 
          background-color: #2563eb; 
          color: white; 
          padding: 10px 6px;
          text-align: left;
          font-size: 10px;
          font-weight: bold;
        }
        td { 
          border: 1px solid #ddd; 
          padding: 6px;
          vertical-align: top;
        }
        tr:nth-child(even) { background-color: #f9f9f9; }
        tr:hover { background-color: #f5f5f5; }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 10px;
          color: #999;
        }
        .no-print {
          margin-bottom: 15px;
          text-align: center;
        }
        .no-print button {
          padding: 10px 20px;
          margin: 0 5px;
          cursor: pointer;
          border: none;
          border-radius: 5px;
          font-size: 14px;
        }
        .btn-print { background: #2563eb; color: white; }
        .btn-close { background: #6b7280; color: white; }
        @media print {
          .no-print { display: none; }
          body { padding: 0; }
        }
        @page {
          size: landscape;
          margin: 1cm;
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
        <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
      </div>
      
      <div class="header">
        <h1>INT BIENES - ${title}</h1>
        <p>Fecha de generación: ${new Date().toLocaleString('es-EC')}</p>
        <p>Total de registros: ${data.length}</p>
      </div>
      
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      
      <div class="footer">
        <p>Sistema INT Bienes - Documento generado automáticamente</p>
      </div>
    </body>
    </html>
  `
  
  // Abrir en nueva ventana
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }
}

/**
 * Exportar a CSV (formato universal)
 */
export const exportToCSV = async (options: ExportOptions): Promise<void> => {
  const { filename, columns, data } = options
  
  const headers = columns.map(col => col.label)
  
  const rows = data.map(row => 
    columns.map(col => {
      const value = getNestedValue(row, col.key)
      return `"${String(value ?? '').replace(/"/g, '""')}"`
    }).join(',')
  )
  
  const content = [headers.join(','), ...rows].join('\n')
  
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, `${filename}.csv`)
}

// Helpers
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

function downloadBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
