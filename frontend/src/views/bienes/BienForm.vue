<template>
  <!-- Layout verified and updated -->
  <div class="bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {{ isEditing ? 'Editar Bien' : 'Nuevo Bien' }}
            </h1>
            <p class="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {{ isEditing ? 'Modifica la información del bien institucional' : 'Registra un nuevo bien institucional'
              }}
            </p>
          </div>
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button @click="goBack"
              class="inline-flex items-center justify-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white min-h-[44px] touch-manipulation">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver
            </button>
            <button @click="openConfirmModal" :disabled="!isFormValid"
              class="inline-flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors min-h-[44px] touch-manipulation">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ isEditing ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulario principal -->
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <form @submit.prevent="openConfirmModal" class="p-6 space-y-6">
          <!-- Información Básica -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información Básica
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código del Bien *
                </label>
                <input v-model="form.codigo" type="text" required placeholder="Ej: BIEN-001"
                  class="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-h-[44px] text-base touch-manipulation"
                  :class="{ 'border-red-500': errors.codigo }" />
                <p v-if="errors.codigo" class="mt-1 text-sm text-red-600">{{ errors.codigo }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del Bien *
                </label>
                <input v-model="form.nombre" type="text" required placeholder="Ej: Laptop HP ProBook"
                  class="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-h-[44px] text-base touch-manipulation"
                  :class="{ 'border-red-500': errors.nombre }" />
                <p v-if="errors.nombre" class="mt-1 text-sm text-red-600">{{ errors.nombre }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría *
                </label>
                <VueMultiselect v-model="selectedCategoria" :options="categorias" :searchable="true"
                  :close-on-select="true" :show-labels="false" placeholder="Buscar categoría..." label="nombre"
                  track-by="id" />
                <p v-if="errors.categoria" class="mt-1 text-sm text-red-600">
                  {{ errors.categoria }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado / Condición *
                </label>
                <select v-model="form.estado" required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': errors.estado }">
                  <option value="">Seleccionar condición</option>
                  <option value="bueno">Bueno</option>
                  <option value="regular">Regular</option>
                  <option value="malo">Malo</option>
                  <option value="en_reparacion">En reparación</option>
                  <option value="dado_baja">Dado de baja</option>
                </select>
                <p v-if="errors.estado" class="mt-1 text-sm text-red-600">{{ errors.estado }}</p>
                <p v-else class="mt-1 text-xs text-gray-500">Corresponde a la condición física del bien (se muestra en la lista).</p>
              </div>
            </div>
          </div>

          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ubicación y Responsable
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ubicación
                </label>
                <VueMultiselect v-model="selectedUbicacion" :options="ubicaciones" :searchable="true"
                  :close-on-select="true" :show-labels="false" placeholder="Buscar ubicación (opcional)" label="nombre"
                  track-by="id" />
                <p v-if="errors.ubicacion" class="mt-1 text-sm text-red-600">
                  {{ errors.ubicacion }}
                </p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Responsable
                </label>
                <VueMultiselect v-model="selectedResponsable" :options="usuarios" :searchable="true"
                  :close-on-select="true" :show-labels="false" placeholder="Buscar responsable (opcional)"
                  label="nombre" track-by="id" :custom-label="({ nombre, apellido }) => `${nombre} ${apellido}`" />
                <p v-if="errors.responsable" class="mt-1 text-sm text-red-600">
                  {{ errors.responsable }}
                </p>
              </div>
            </div>
          </div>

          <!-- Especificaciones Técnicas -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Especificaciones Técnicas
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marca *
                </label>
                <input v-model="form.marca" type="text" placeholder="Ej: HP, Dell, Samsung" required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
                <p v-if="errors.marca" class="mt-1 text-sm text-red-600">{{ errors.marca }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modelo *
                </label>
                <input v-model="form.modelo" type="text" placeholder="Ej: ProBook 450 G8" required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
                <p v-if="errors.modelo" class="mt-1 text-sm text-red-600">{{ errors.modelo }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Serie *
                </label>
                <input v-model="form.serie" type="text" placeholder="Ej: 5CD1234567" required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
                <p v-if="errors.serie" class="mt-1 text-sm text-red-600">{{ errors.serie }}</p>
              </div>

            </div>
          </div>

          <!-- Información Financiera -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información Financiera
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor de Adquisición *
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-gray-500">$</span>
                  <input v-model="form.valorAdquisicion" type="number" step="0.01" min="0" required placeholder="0.00"
                    class="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    :class="{ 'border-red-500': errors.valorAdquisicion }" />
                </div>
                <p v-if="errors.valorAdquisicion" class="mt-1 text-sm text-red-600">
                  {{ errors.valorAdquisicion }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código SENESCYT
                </label>
                <input v-model="form.codigo_senescyt" type="text" placeholder="Código SENESCYT del bien (o N/A)"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
                <p v-if="errors.codigo_senescyt" class="mt-1 text-sm text-red-600">
                  {{ errors.codigo_senescyt }}
                </p>
                <p v-else class="mt-1 text-xs text-gray-500">Si no aplica, escribe <code>N/A</code> — puede repetirse en varios bienes.</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vida Útil (años) *
                </label>
                <input v-model="form.vida_util" type="number" min="1" max="50" required placeholder="5"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': errors.vida_util }" />
                <p v-if="errors.vida_util" class="mt-1 text-sm text-red-600">
                  {{ errors.vida_util }}
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Valor Residual
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-gray-500">$</span>
                  <input v-model="form.valor_residual" type="number" step="0.01" min="0" placeholder="0.00"
                    class="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
                </div>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Valor estimado al final de la vida útil
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Depreciación Acumulada
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-gray-500">$</span>
                  <input :value="depreciacionCalculada" type="number" step="0.01" readonly placeholder="0.00"
                    class="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400" />
                </div>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Calculado automáticamente: {{ porcentajeDepreciacion }}% depreciado
                </p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Adquisición *
                </label>
                <input v-model="form.fechaAdquisicion" type="date" required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  :class="{ 'border-red-500': errors.fechaAdquisicion }" />
                <p v-if="errors.fechaAdquisicion" class="mt-1 text-sm text-red-600">
                  {{ errors.fechaAdquisicion }}
                </p>
              </div>

            </div>
          </div>

          <!-- Información Adicional -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Información Adicional
            </h2>
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción *
                </label>
                <textarea v-model="form.descripcion" rows="3" placeholder="Descripción detallada del bien..." required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observaciones *
                </label>
                <textarea v-model="form.observaciones" rows="2" placeholder="Observaciones adicionales..." required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"></textarea>
              </div>
            </div>
          </div>

          <!-- Información de Documentación -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Documentación y Actas
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nro. Acta Entrega-Recepción *
                </label>
                <input v-model="form.nro_acta_entrega_recepcion" type="text" required
                  placeholder="Número del acta de entrega-recepción"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
                <p v-if="errors.nro_acta_entrega_recepcion" class="mt-1 text-sm text-red-600">{{
                  errors.nro_acta_entrega_recepcion }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nro. Acta Constatación Física *
                </label>
                <input v-model="form.nro_acta_constatacion_fisica" type="text" required
                  placeholder="Número del acta de constatación física"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
                <p v-if="errors.nro_acta_constatacion_fisica" class="mt-1 text-sm text-red-600">{{
                  errors.nro_acta_constatacion_fisica }}</p>
              </div>
            </div>
          </div>

          <!-- Información Física -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Características Físicas
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color *
                </label>
                <input v-model="form.color" type="text" placeholder="Color del bien" required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
                <p v-if="errors.color" class="mt-1 text-sm text-red-600">{{ errors.color }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Material *
                </label>
                <input v-model="form.material" type="text" placeholder="Material de construcción" required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
                <p v-if="errors.material" class="mt-1 text-sm text-red-600">{{ errors.material }}</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período Académico *
                </label>
                <VueMultiselect v-model="selectedPeriodo" :options="periodos" :searchable="true" :close-on-select="true"
                  :show-labels="false" placeholder="Buscar periodo..." label="nombre" track-by="id" />
                <p v-if="errors.periodo_id" class="mt-1 text-sm text-red-600">{{ errors.periodo_id }}</p>
              </div>
            </div>
          </div>

          <!-- Evidencias del Bien -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              <i class="bx bx-camera mr-2"></i>
              Evidencias del Bien
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Sube fotos, facturas, actas u otros documentos como evidencia de la entrega del bien sin novedades.
            </p>

            <!-- Evidencias Guardadas -->
            <div v-if="evidenciasExistentes.length > 0" class="mb-6">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Evidencias Guardadas ({{ evidenciasExistentes.length }})
              </h3>
              <div class="space-y-2">
                <div v-for="(doc, index) in evidenciasExistentes" :key="doc.id"
                  class="flex items-center justify-between p-3 bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 rounded-lg">
                  <div class="flex items-center space-x-3">
                    <i :class="getFileIcon(doc.mime_type)" class="text-2xl"></i>
                    <div>
                      <p class="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">{{ doc.nombre }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(doc.tamano) }} • {{ doc.tipo
                      }}</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button type="button" @click="downloadDocument(doc)"
                      class="text-blue-600 hover:text-blue-800 dark:text-blue-400 p-1" title="Descargar">
                      <i class="bx bx-download text-lg"></i>
                    </button>
                    <button type="button" @click="requestDeleteDocument(doc.id, index)"
                      class="text-red-500 hover:text-red-700 p-1" title="Eliminar">
                      <i class="bx bx-trash text-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Zona de Drop -->
            <div @drop.prevent="handleFileDrop" @dragover.prevent="isDragging = true" @dragleave="isDragging = false"
              :class="isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'"
              class="w-full p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors duration-200 hover:border-blue-400">
              <input ref="fileInput" type="file" multiple accept="image/*,.pdf,.xlsx,.xls,.doc,.docx"
                @change="handleFileSelect" class="hidden" />

              <div @click="$refs.fileInput.click()">
                <i class="bx bx-cloud-upload text-4xl text-gray-400 dark:text-gray-500 mb-2"></i>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  <span class="font-medium text-blue-600 hover:text-blue-500">Haga clic para seleccionar</span>
                  o arrastre y suelte
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Imágenes, PDF, Excel, Word (máx. 20MB por archivo)
                </p>
              </div>
            </div>

            <!-- Lista de archivos seleccionados -->
            <div v-if="evidenciasPendientes.length > 0" class="mt-4 space-y-2">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
                Archivos seleccionados ({{ evidenciasPendientes.length }})
              </h3>
              <div v-for="(file, index) in evidenciasPendientes" :key="index"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div class="flex items-center space-x-3">
                  <i :class="getFileIcon(file.type)" class="text-2xl"></i>
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">{{ file.name }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(file.size) }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <select v-model="file.tipoEvidencia"
                    class="text-xs px-2 py-1 border rounded-lg bg-white dark:bg-gray-600 dark:text-white">
                    <option value="foto">Foto</option>
                    <option value="factura">Factura</option>
                    <option value="acta_entrega">Acta de entrega</option>
                    <option value="acta_constatacion">Acta de constatación</option>
                    <option value="garantia">Garantía</option>
                    <option value="manual">Manual</option>
                    <option value="otro">Otro</option>
                  </select>
                  <button type="button" @click="removeFile(index)" class="text-red-500 hover:text-red-700 p-1">
                    <i class="bx bx-x text-lg"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Vista previa de imágenes -->
            <div v-if="imagenesPreview.length > 0" class="mt-4">
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Vista previa</h3>
              <div class="flex flex-wrap gap-2">
                <div v-for="(img, idx) in imagenesPreview" :key="idx" class="relative w-20 h-20">
                  <img :src="img.url" :alt="img.name"
                    class="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600" />
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button type="button" @click="goBack"
              class="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
              Cancelar
            </button>
            <button type="submit" :disabled="!isFormValid"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors">
              {{ isEditing ? 'Actualizar Bien' : 'Guardar Bien' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirmar Acción</h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          ¿Estás seguro de que quieres {{ isEditing ? 'actualizar' : 'guardar' }} este bien?
        </p>
        <div class="flex justify-end space-x-3">
          <button @click="showConfirmModal = false"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
            Cancelar
          </button>
          <button @click="confirmSave" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Confirmar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal confirmación eliminar documento -->
    <div v-if="showDeleteConfirmModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
      <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4 transform transition-all scale-100">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <i class="bx bx-trash text-2xl text-red-600 dark:text-red-400"></i>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">¿Eliminar documento?</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            ¿Estás seguro de que quieres eliminar este documento? Esta acción no se puede deshacer.
          </p>
          <div class="flex justify-center space-x-3">
            <button @click="cancelDeleteDocument"
              class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors">
              Cancelar
            </button>
            <button @click="confirmDeleteDocument"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./BienForm.script.js"></script>

<style src="./BienForm.style.css"></style>
