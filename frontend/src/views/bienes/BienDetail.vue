<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Loading State -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Cargando información del bien...</p>
      </div>
    </div>

    <!-- Content -->
    <div v-else>
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Detalle del Bien</h1>
              <p class="mt-2 text-gray-600 dark:text-gray-400">
                Información completa del bien institucional
              </p>
            </div>
            <div class="flex space-x-3">
              <!-- Botón Volver -->
              <button @click="goBack"
                class="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver a Bienes
              </button>
              <!-- Botones según rol -->
              <button v-if="isAdmin" @click="showQRModal = true"
                class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                </svg>
                Ver QR
              </button>
              <button v-if="isAdmin" @click="goToEdit"
                class="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              <button v-if="isAdmin" @click="deleteBien"
                class="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
              <!-- Para usuario estándar -->
              <button v-if="!isAdmin && canViewQR" @click="showQRModal = true"
                class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                </svg>
                Ver QR
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Información principal -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Tarjeta de información básica -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Información Básica
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Código</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.codigo }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.nombre }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Categoría</label>
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                    :class="getCategoriaClass(bien.categoria)">
                    {{ bien.categoria }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Estado</label>
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1"
                    :class="getEstadoClass(bien.estado)">
                    {{ bien.estado }}
                  </span>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ubicación</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.ubicacion }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Responsable</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.responsable }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Creación</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ bien.created_at ? new Date(bien.created_at).toLocaleString() : '-' }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Última Actualización</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">
                    {{ bien.updated_at ? new Date(bien.updated_at).toLocaleString() : '-' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Tarjeta de especificaciones técnicas -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Especificaciones Técnicas
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.marca }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Modelo</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.modelo }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Serie</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.serie }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Año de Fabricación</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">{{ bien.anioFabricacion }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor Adquisición</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">
                    ${{ bien.valorAdquisicion.toLocaleString('en-US', {
                      minimumFractionDigits: 2, maximumFractionDigits:
                    2 }) }}
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Valor Actual</label>
                  <p class="mt-1 text-sm text-gray-900 dark:text-white">
                    ${{ bien.valorActual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Tarjeta de Descripción y Observaciones -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Información Adicional
              </h2>
              <div class="space-y-4">
                <div v-if="bien.descripcion">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                  <p class="mt-2 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{{ bien.descripcion }}</p>
                </div>
                <div v-if="bien.observaciones">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Observaciones</label>
                  <p class="mt-2 text-sm text-gray-900 dark:text-white whitespace-pre-wrap">{{ bien.observaciones }}</p>
                </div>
              </div>
            </div>

            <!-- Tarjeta de historial -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                <i class="bx bx-history mr-2"></i>
                Historial de Responsables
              </h2>
              <div v-if="bien.historial && bien.historial.length > 0" class="space-y-3">
                <div v-for="evento in bien.historial" :key="evento.id"
                  class="p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-lg border-l-4 border-blue-500">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <p class="text-sm font-semibold text-gray-900 dark:text-white">
                        {{ evento.accion }}
                      </p>
                      <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">
                        📅 {{ evento.fecha }}
                      </p>
                      <p class="text-xs text-gray-600 dark:text-gray-300">
                        👤 Registrado por: {{ evento.usuario }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Sin cambios de responsables registrados
                </p>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-6">
            <!-- Tarjeta de estado -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estado Actual</h3>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Condición</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ bien.condicion }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Último Mantenimiento</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ bien.ultimoMantenimiento }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600 dark:text-gray-400">Próximo Mantenimiento</span>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">{{ bien.proximoMantenimiento }}</span>
                </div>
              </div>
            </div>

            <!-- Tarjeta de documentos -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documentos</h3>
              <div class="space-y-2">
                <div v-for="doc in bien.documentos" :key="doc.id"
                  class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span class="text-sm text-gray-900 dark:text-white">{{ doc.nombre }}</span>
                  <div class="flex items-center space-x-2">
                    <button @click="viewDocument(doc)"
                      class="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      title="Ver documento">
                      <i class="bx bx-show text-lg"></i>
                    </button>
                    <button @click="downloadDocument(doc)"
                      class="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Descargar documento">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tarjeta de alertas -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alertas</h3>
              <div class="space-y-2">
                <div v-for="alerta in bien.alertas" :key="alerta.id"
                  class="flex items-center space-x-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                  <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span class="text-sm text-red-700 dark:text-red-400">{{ alerta.mensaje }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>





      <!-- Modal de QR -->
      <div v-if="showQRModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
        @click.self="closeQRModal">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
          <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">Código QR del Bien</h2>
          <div class="flex flex-col items-center space-y-4">
            <div id="qr-container" class="bg-white p-4 rounded-lg">
              <!-- El QR se genera aquí con JavaScript -->
            </div>
            <div class="text-left w-full bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-xs font-mono">
              <div class="text-gray-900 dark:text-white whitespace-pre-line">=== INT BIENES ===
                Código: {{ bien.codigo_institucional }}
                SENESCYT: {{ bien.codigo_senescyt || 'N/A' }}
                Nombre: {{ bien.nombre }}
                Categoría: {{ bien.categoria }}
                Ubicación: {{ bien.ubicacion }}
                Responsable: {{ bien.responsable }}
                ==================</div>
            </div>
          </div>
          <div class="flex justify-center mt-6">
            <button @click="closeQRModal" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              Cerrar
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script src="./BienDetail.script.js"></script>
