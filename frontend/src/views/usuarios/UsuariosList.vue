<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
            <p class="mt-2 text-gray-600 dark:text-gray-400">
              Administra usuarios del sistema institucional
            </p>
          </div>
          <div class="flex gap-3">
            <button @click="showInactiveModal = true"
              class="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors">
              <i class="bx bx-user-x mr-2"></i>
              Ver Inactivos
            </button>
            <button v-if="isAdmin" @click="showCreateModal = true"
              class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Selector de módulo: Activos / Inactivos -->
    <div v-show="false" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="mb-4 flex items-center justify-between">
        <div class="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button :class="['px-4 py-2 rounded-lg text-sm font-medium', !showInactive ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300']" @click="() => { showInactive = false; filters.value.estado = ''; loadUsers() }">
            Activos
          </button>
          <button :class="['px-4 py-2 rounded-lg text-sm font-medium', showInactive ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300']" @click="() => { showInactive = true; filters.value.estado = 'inactivo'; loadUsers() }">
            Inactivos
          </button>
        </div>

        <div class="text-sm text-gray-600 dark:text-gray-400">Mostrar: <strong>{{ showInactive ? 'Inactivos' : 'Activos' }}</strong></div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div class="lg:col-span-2">
            <input v-model="filters.search" type="text" placeholder="Buscar por nombre, email, cédula..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <select v-model="filters.rol"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">Todos los roles</option>
              <option v-for="rol in roles" :key="rol.id" :value="rol.nombre">
                {{ rol.nombre }}
              </option>
            </select>
          </div>
          <!-- Estado filter removed as requested -->
          <div>
            <select v-model="filters.area"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
              <option value="">Todas las áreas</option>
              <option v-for="area in areas" :key="area.id" :value="area.nombre">
                {{ area.nombre }}
              </option>
            </select>
          </div>
        </div>
        <div class="flex justify-end mt-4">
          <button @click="clearFilters"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- DataTable de usuarios -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Usuario
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Cédula
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Celular
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Área
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Rol
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-4 text-center">
                <div class="flex items-center justify-center">
                  <svg class="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
                  </svg>
                  Cargando usuarios...
                </div>
              </td>
            </tr>
            <tr v-else-if="paginatedUsers.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No se encontraron usuarios
              </td>
            </tr>
            <tr v-else v-for="user in paginatedUsers" :key="user.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span class="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {{ user.nombre.charAt(0).toUpperCase()
                        }}{{ user.apellido?.charAt(0).toUpperCase() }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user.nombre }} {{ user.apellido }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ user.documento }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ user.telefono || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ user.area }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" :class="getRolClass(user.rol)">
                  {{ user.rol }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  :class="getEstadoClass(user.estado)">
                  {{ user.estado }}
                </span>
              </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button @click="viewUser(user)"
                    class="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Ver detalles del usuario">
                    <i class="bx bx-show text-lg"></i>
                  </button>
                  <button v-if="isAdmin" @click="editUser(user)"
                    class="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
                    title="Editar usuario">
                    <i class="bx bx-edit text-lg"></i>
                  </button>
                  <button v-if="isAdmin" @click="toggleUserStatus(user)" :disabled="!canToggleUserStatus(user)" :class="[
                    'p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] touch-manipulation',
                    !canToggleUserStatus(user)
                      ? 'opacity-50 cursor-not-allowed text-gray-400 dark:text-gray-600'
                      : user.estado === 'activo'
                      ? 'text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900'
                      : 'text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900'
                  ]" :title="getToggleUserButtonTitle(user)">
                    <i :class="user.estado === 'activo' ? 'bx bx-user-x' : 'bx bx-user-check'" class="text-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Paginación -->
        <div class="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
            {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} de
            {{ filteredUsers.length }} usuarios
          </div>
          <div class="flex space-x-1">
            <button @click="previousPage" :disabled="currentPage === 1"
              class="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white disabled:opacity-50">
              Anterior
            </button>
            <button v-for="page in visiblePages" :key="page" @click="goToPage(page)" :class="[
              'px-3 py-1 rounded',
              page === currentPage
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white',
            ]">
              {{ page }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages"
              class="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white disabled:opacity-50">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de creación/edición -->
    <div v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-lg">
        <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          {{ showEditModal ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </h2>
        <form @submit.prevent="saveUser" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre *</label>
              <input v-model="form.nombre" type="text" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Apellido *</label>
              <input v-model="form.apellido" type="text" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
              <input v-model="form.email" type="email" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cédula/Documento *
                <span class="text-xs font-normal text-gray-500">(10 dígitos)</span>
              </label>
              <input v-model="form.documento" type="text" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Celular</label>
              <input v-model="form.telefono" type="tel" placeholder="Ej: 0991234567" maxlength="10" pattern="[0-9]*"
                inputmode="numeric" @input="form.telefono = form.telefono.replace(/[^0-9]/g, '').slice(0, 10)"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Área *</label>
              <select v-model="form.area_id" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Seleccionar Área</option>
                <option v-for="area in areas" :key="area.id_area || area.id" :value="area.id_area">
                  {{ area.nombre }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rol *</label>
              <select v-model="form.rol" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                <option value="">Seleccionar rol</option>
                <option v-for="rol in roles" :key="rol.id" :value="rol.nombre">
                  {{ rol.nombre }}
                </option>
              </select>
            </div>
            <div v-if="!showEditModal">
              <BaseInput v-model="form.password" type="password" label="Contraseña *"
                placeholder="Ingresa la contraseña" required :show-password-toggle="true" />
            </div>
            <div v-if="!showEditModal">
              <BaseInput v-model="form.confirmPassword" type="password" label="Confirmar Contraseña *"
                placeholder="Confirma la contraseña" required :show-password-toggle="true" />
            </div>
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeModal"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white">
              Cancelar
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
              {{ showEditModal ? 'Actualizar' : 'Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de detalles -->
    <div v-if="showViewModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeViewModal">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Detalles del Usuario</h2>
        <div v-if="selectedUser" class="space-y-6">
          <!-- Primera fila: Nombre y Área -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nombre Completo</label>
              <p class="text-base text-gray-900 dark:text-white font-medium">
                {{ selectedUser.nombre }} {{ selectedUser.apellido }}
              </p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Área</label>
              <p class="text-base text-gray-900 dark:text-white font-medium">
                {{ selectedUser.area || 'No asignado' }}
              </p>
            </div>
          </div>

          <!-- Segunda fila: Email y Cédula -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <p class="text-sm text-gray-900 dark:text-white break-all">{{ selectedUser.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cédula</label>
              <p class="text-base text-gray-900 dark:text-white font-medium">{{ selectedUser.documento }}</p>
            </div>
          </div>

          <!-- Tercera fila: Rol y Estado -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Rol</label>
              <span class="inline-flex px-3 py-1.5 text-sm font-semibold rounded-lg"
                :class="getRolClass(selectedUser.rol)">
                {{ selectedUser.rol }}
              </span>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Estado</label>
              <span class="inline-flex px-3 py-1.5 text-sm font-semibold rounded-lg"
                :class="getEstadoClass(selectedUser.estado)">
                {{ selectedUser.estado }}
              </span>
            </div>
          </div>

          <!-- Separador visual -->
          <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
            <!-- Botones de acción -->
            <div class="flex justify-between gap-3">
              <button @click="showUserAssignmentsModal = true; loadUserAssignments(selectedUser?.id)"
                class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium inline-flex items-center justify-center gap-2 transition-colors">
                <span>Ver Bienes Asignados</span>
                <span v-if="userAssignments.length > 0" class="bg-blue-800 rounded-full px-2 py-0.5 text-xs font-bold">
                  {{ userAssignments.length }}
                </span>
              </button>
              <button @click="closeViewModal"
                class="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Usuarios Inactivos -->
    <div v-if="showInactiveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <!-- Header del Modal -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Usuarios Inactivos</h2>
        </div>

        <!-- Búsqueda -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <input v-model="searchInactiveUsers" type="text" placeholder="Buscar por nombre, email o cédula..."
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" />
        </div>

        <!-- Tabla de Usuarios Inactivos -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">NOMBRE</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">EMAIL</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">CÉDULA</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ROL</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">ACCIONES</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-if="filteredInactiveUsers.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No hay usuarios inactivos
                </td>
              </tr>
              <tr v-for="user in filteredInactiveUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {{ user.nombre }} {{ user.apellido }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {{ user.email }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {{ user.documento }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getRolClass(user.rol)">
                    {{ user.rol }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex gap-2">
                    <button @click="activateUser(user.id || user.id_usuario)" :disabled="!canToggleUserStatus(user)"
                      :class="['px-3 py-1 text-white text-xs font-semibold rounded transition-colors', 
                        !canToggleUserStatus(user) 
                          ? 'opacity-50 cursor-not-allowed bg-gray-500' 
                          : 'bg-green-600 hover:bg-green-700']"
                      :title="getToggleUserButtonTitle(user)">
                      Activar
                    </button>
                    <button v-if="isAdmin" @click="permanentlyDeleteUser(user.id || user.id_usuario)" :disabled="!canToggleUserStatus(user)"
                      :class="['px-3 py-1 text-white text-xs font-semibold rounded transition-colors',
                        !canToggleUserStatus(user)
                          ? 'opacity-50 cursor-not-allowed bg-gray-500'
                          : 'bg-red-600 hover:bg-red-700']"
                      :title="!canToggleUserStatus(user) ? (userRestrictions.get(user.id)?.reasons?.[0] || 'No se puede eliminar') : 'Eliminar usuario'">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer del Modal -->
        <div class="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-6 py-4 flex justify-end">
          <button @click="showInactiveModal = false"
            class="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-medium rounded-lg transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Bienes Asignados a Usuario -->
    <div v-if="showUserAssignmentsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <!-- Header del Modal -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Bienes Asignados</h2>
            <p v-if="selectedUser" class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ selectedUser.nombre }} {{ selectedUser.apellido }}
            </p>
          </div>
          <button @click="closeAssignmentsModal"
            class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">
            &times;
          </button>
        </div>

        <!-- Contenido del Modal -->
        <div class="p-6">
          <!-- Loading State -->
          <div v-if="loadingAssignments" class="flex items-center justify-center py-12">
            <div class="text-center">
              <div class="mb-4">
                <i class="bx bx-loader-alt text-4xl animate-spin text-blue-600"></i>
              </div>
              <p class="text-gray-600 dark:text-gray-400">Cargando bienes asignados...</p>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="userAssignments.length === 0" class="text-center py-12">
            <i class="bx bx-inbox text-5xl text-gray-400 dark:text-gray-500 mb-4"></i>
            <p class="text-gray-600 dark:text-gray-400 font-medium">No hay bienes asignados</p>
            <p class="text-gray-500 dark:text-gray-500 text-sm mt-1">Este usuario no tiene bienes en su asignación</p>
          </div>

          <!-- Tabla de Bienes -->
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Código</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Nombre del Bien</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Fecha Asignación</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Observaciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="assignment in userAssignments" :key="assignment.id" 
                  class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {{ assignment.bien?.codigo || assignment.bien?.codigo_institucional || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {{ assignment.bien?.nombre || 'Sin nombre' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {{ formatDate(assignment.fecha_asignacion) }}
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span v-if="assignment.activo" 
                      class="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Activa
                    </span>
                    <span v-else 
                      class="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                      Devuelta
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                    {{ assignment.observaciones || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Resumen de estadísticas -->
            <div class="mt-6 grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div class="text-center">
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {{ (userAssignments as any[]).filter((a: any) => a.activo).length }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Bienes Activos</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-red-600 dark:text-red-400">
                  {{ (userAssignments as any[]).filter((a: any) => !a.activo).length }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Bienes Devueltos</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {{ userAssignments.length }}
                </p>
                <p class="text-sm text-gray-600 dark:text-gray-400">Total Asignaciones</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer del Modal -->
        <div class="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-6 py-4 flex justify-end">
          <button @click="closeAssignmentsModal"
            class="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-medium rounded-lg transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification'
import { confirm } from '@/composables/useConfirm'
import apiClient from '@/api/client'
import BaseInput from '@/components/shared/BaseInput.vue'
import type { User, Role } from '@/types'

interface ExtendedUser extends User {
  area?: string;
  area_id?: number | string;
  id_usuario?: number;
  rol_id?: number | string;
}

// Stores
const authStore = useAuthStore()
const toast = useToast()

// Control de acceso por rol
const isAdmin = computed(() => authStore.hasRole('Administrador'))

// Estado del componente
const users = ref<ExtendedUser[]>([])
const roles = ref<Role[]>([])
const areas = ref<any[]>([])
const loading = ref(false)
const userRestrictions = ref<Map<number, any>>(new Map()) // Rastrear restricciones por usuario ID

const filters = ref({
  search: '',
  rol: '',
  estado: '',
  area: '',
})

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showViewModal = ref(false)
const showInactiveModal = ref(false)
const showUserAssignmentsModal = ref(false)
const inactiveUsers = ref<ExtendedUser[]>([])
const searchInactiveUsers = ref('')
const selectedUser = ref<User | null>(null)
const userAssignments = ref<any[]>([])
const loadingAssignments = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const showInactive = ref(false) // controla el módulo: activos / inactivos

const form = ref({
  id: null as number | null,
  nombre: '',
  apellido: '',
  email: '',
  area: '',
  area_id: '',
  rol: '',
  password: '',
  confirmPassword: '',
  telefono: '',
  documento: '',
})

// Filtros y búsqueda
const filteredUsers = computed(() => {
  let result = users.value
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(
      (u: User) =>
        u.nombre.toLowerCase().includes(search) ||
        u.apellido?.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search) ||
        u.documento?.includes(search)
    )
  }
  if (filters.value.rol) {
    result = result.filter((u: User) => u.rol === filters.value.rol)
  }
  if (filters.value.estado) {
    result = result.filter((u: User) => u.estado === filters.value.estado)
  }
  if (filters.value.area) {
    result = result.filter((u: ExtendedUser) => u.area === filters.value.area)
  }
  return result
})

// Paginación
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value))
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredUsers.value.slice(start, start + itemsPerPage.value)
})
const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// Filtrar usuarios inactivos
const filteredInactiveUsers = computed(() => {
  if (!searchInactiveUsers.value) return inactiveUsers.value
  const search = searchInactiveUsers.value.toLowerCase()
  return inactiveUsers.value.filter((u: ExtendedUser) =>
    (u.nombre?.toLowerCase().includes(search)) ||
    (u.apellido?.toLowerCase().includes(search)) ||
    (u.email?.toLowerCase().includes(search)) ||
    (u.documento?.toLowerCase().includes(search))
  )
})

// Clases para badges
const getRolClass = (rol: string): string => {
  const key = (rol || '').toLowerCase()
  const map: Record<string, string> = {
    administrador: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    usuario: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    tecnico: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    supervisor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  }
  return map[key] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

const getEstadoClass = (estado: string): string => {
  const map: Record<string, string> = {
    activo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactivo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  }
  return map[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
}

// Métodos de carga de datos
const loadUsers = async () => {
  loading.value = true
  try {
    const activoParam = showInactive.value ? 'false' : 'true'
    const response = await apiClient.get(`/usuarios?activo=${activoParam}`)
    const data = response

    if (data.success) {
      users.value = data.data || []
      // sincronizar filtro de estado para UI cuando cambiamos de módulo
      filters.value.estado = showInactive.value ? 'inactivo' : ''
      currentPage.value = 1
      
      // Cargar restricciones para cada usuario
      users.value.forEach((user: ExtendedUser) => {
        checkUserRestrictions(user.id)
      })
    } else {
      throw new Error(data.message || 'Error al cargar usuarios')
    }
  } catch (error) {
    console.error('Error loading users:', error)
    users.value = []
    toast.error('Error al cargar los usuarios. Intente nuevamente.')
  } finally {
    loading.value = false
  }
}

// Recargar cuando se cambia de módulo (activos/inactivos)
watch(showInactive, async () => {
  await loadUsers()
})

const loadRoles = async () => {
  try {
    const response = await apiClient.get('/roles')
    const data = response
    if (data.success) {
      roles.value = data.data || []
    }
  } catch (error) {
    console.error('Error al cargar roles:', error)
    roles.value = []
    toast.error('Error al cargar los roles')
  }
}

const loadAreas = async () => {
  try {
    const response = await apiClient.get('/areas')
    const data = response
    if (data.success) {
      areas.value = data.data
    } else {
      console.error('Error en respuesta de áreas:', data)
    }
  } catch (error) {
    console.error('Error al cargar áreas:', error)
  }
}

// Cargar usuarios inactivos
const loadInactiveUsers = async () => {
  try {
    const response = await apiClient.get('/usuarios?activo=false')
    const data = response
    if (data.success) {
      inactiveUsers.value = data.data || []
      
      // Cargar restricciones para cada usuario inactivo
      inactiveUsers.value.forEach((user: ExtendedUser) => {
        checkUserRestrictions(user.id)
      })
    }
  } catch (error) {
    console.error('Error al cargar usuarios inactivos:', error)
    inactiveUsers.value = []
    toast.error('Error al cargar usuarios inactivos')
  }
}

// Actualizar usuarios inactivos cuando el modal se abre
watch(showInactiveModal, async (newVal: boolean) => {
  if (newVal) {
    await loadInactiveUsers()
  }
})

// Cargar bienes asignados a un usuario
const loadUserAssignments = async (userId: number | undefined) => {
  if (!userId) {
    toast.error('Usuario no seleccionado')
    return
  }

  loadingAssignments.value = true
  try {
    console.log(`[DEBUG] Cargando asignaciones para usuario ID: ${userId}`)
    const response = await apiClient.get(`/asignaciones?usuario_id=${userId}`)
    const data = response
    
    console.log(`[DEBUG] Respuesta del servidor para usuario ${userId}:`, data)

    if (data.success) {
      userAssignments.value = data.data || []
      console.log(`[DEBUG] Asignaciones cargadas: ${userAssignments.value.length}`)
    } else {
      throw new Error(data.message || 'Error al cargar asignaciones')
    }
  } catch (error) {
    console.error('Error loading user assignments:', error)
    userAssignments.value = []
    toast.error('Error al cargar los bienes asignados')
  } finally {
    loadingAssignments.value = false
  }
}

// Cerrar modal de bienes asignados
const closeAssignmentsModal = () => {
  showUserAssignmentsModal.value = false
  userAssignments.value = []
}

// Acciones
const clearFilters = () => {
  filters.value = { search: '', rol: '', estado: '', area: '' }
  currentPage.value = 1
}

const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const goToPage = (page: number) => {
  currentPage.value = page
}

const viewUser = async (user: User) => {
  console.log(`[DEBUG] viewUser llamado con usuario:`, user);
  console.log(`[DEBUG] Usuario ID: ${user.id} (tipo: ${typeof user.id})`);
  selectedUser.value = user
  showViewModal.value = true
  // Limpiar datos anteriores
  userAssignments.value = []
  loadingAssignments.value = true
  // Cargar bienes asignados de forma anticipada
  await loadUserAssignments(user.id)
}

const editUser = (user: ExtendedUser) => {
  form.value = {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido || '',
    email: user.email,
    documento: user.documento || '',
    area: user.area || '',
    area_id: (user as any).area_id || '',
    rol: user.rol || '',
    password: '',
    confirmPassword: '',
    telefono: user.telefono || '',
  }
  showEditModal.value = true
}

// Verificar restricciones del usuario
const checkUserRestrictions = async (userId: number) => {
  try {
    const response = await apiClient.get(`/usuarios/${userId}/check-restrictions`)
    const data = response
    if (data.success) {
      userRestrictions.value.set(userId, data.data)
      return data.data
    }
  } catch (error) {
    console.error('Error checking user restrictions:', error)
  }
  return { canDelete: true, canToggleStatus: true, reasons: [] }
}

// Determinar si se puede cambiar el estado del usuario
const canToggleUserStatus = (user: ExtendedUser): boolean => {
  const restrictions = userRestrictions.value.get(user.id)
  if (!restrictions) return true
  return restrictions.canToggleStatus !== false
}

// Obtener el título del botón de toggle
const getToggleUserButtonTitle = (user: ExtendedUser): string => {
  const restrictions = userRestrictions.value.get(user.id)
  
  if (!restrictions) {
    return user.estado === 'activo' ? 'Desactivar usuario' : 'Activar usuario'
  }
  
  if (!restrictions.canToggleStatus) {
    return restrictions.reasons && restrictions.reasons.length > 0
      ? restrictions.reasons[0]
      : 'No se puede cambiar el estado de este usuario'
  }
  
  return user.estado === 'activo' ? 'Desactivar usuario' : 'Activar usuario'
}

const toggleUserStatus = async (user: User) => {
  try {
    // Verificar restricciones
    const restrictions = await checkUserRestrictions(user.id)
    if (!restrictions.canToggleStatus) {
      toast.error(restrictions.reasons?.[0] || 'No se puede cambiar el estado de este usuario')
      return
    }

    const newStatus = user.estado === 'activo' ? 'inactivo' : 'activo'
    const areaId = (user as any).area_id || ''
    const payload = {
      nombres: user.nombre,
      apellidos: user.apellido,
      email: user.email,
      cedula: user.documento,
      telefono: user.telefono,
      area_id: areaId,
      rol_id: (user as any).rol_id || user.rol,
      activo: newStatus === 'activo'
    }

    const response = await apiClient.put(`/usuarios/${user.id}`, payload)
    const data = response
    if (data.success) {
      // Si cambiamos a inactivo: quitar de lista activa y añadir a inactivos
      if (newStatus === 'inactivo') {
        users.value = users.value.filter((u: User) => u.id !== user.id)
        const inactiveObj: ExtendedUser = {
          ...user as ExtendedUser,
          area_id: (user as any).area_id || '',
          rol_id: (user as any).rol_id || (user as any).rol || '',
          id: (user as any).id,
        }
        // evitar duplicados
        if (!inactiveUsers.value.find((u: ExtendedUser) => u.id === user.id)) {
          inactiveUsers.value.unshift(inactiveObj)
        }
      } else {
        // newStatus === 'activo': asegurar que esté en la lista principal y marcado activo
        const index = users.value.findIndex((u: User) => u?.id === user?.id)
        if (index >= 0 && users.value[index]) {
          users.value[index].estado = newStatus
          ;(users.value[index] as any).activo = true
        } else {
          // agregar al inicio
          const newUser = {
            ...(user as any),
            estado: 'activo',
            activo: true,
          } as unknown as User
          users.value.unshift(newUser)
        }
        // remover de inactivos si existe
        inactiveUsers.value = inactiveUsers.value.filter((u: ExtendedUser) => u.id !== user.id)
      }

      toast.success(`Usuario ${newStatus === 'activo' ? 'activado' : 'desactivado'} correctamente`)
    } else {
      throw new Error(data.message || 'Error al cambiar estado')
    }
  } catch (error) {
    console.error('Error toggleUserStatus:', error)
    toast.error('Error al cambiar el estado del usuario')
  }
}

// Eliminación condicional: soft-delete en vista activos, eliminación definitiva en inactivos
const deleteUser = async (id: number) => {
  if (showInactive.value) {
    // Si estamos en Inactivos, usar eliminación definitiva
    await permanentlyDeleteUser(id)
    return
  }

  const confirmed = await confirm({
    title: 'Eliminar usuario',
    message: '¿Estás seguro de que quieres mover este usuario a Inactivos?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    destructive: true,
  })
  if (!confirmed) return

  try {
    // Hacemos soft-delete mediante update (activo: false)
    const response = await apiClient.put(`/usuarios/${id}`, { activo: false })
    const data = response
    if (data.success) {
      users.value = users.value.filter((u: User) => u.id !== id)
      toast.success('Usuario movido a inactivos')
    } else {
      throw new Error(data.message || 'Error al eliminar usuario')
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    toast.error('Error al eliminar el usuario')
  }
}

const permanentlyDeleteUser = async (id: number) => {
  // Verificar restricciones
  const restrictions = await checkUserRestrictions(id)
  if (!restrictions.canDelete) {
    toast.error(restrictions.reasons?.[0] || 'No se puede eliminar este usuario')
    return
  }

  const confirmed = await confirm({
    title: 'Eliminar usuario',
    message: 'Eliminar DEFINITIVAMENTE este usuario. Esta acción no se puede deshacer. ¿Continuar?',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    destructive: true,
  })
  if (!confirmed) return
  try {
    // Intentar eliminar del API
    let response
    try {
      response = await apiClient.delete(`/usuarios/${id}/permanent`)
    } catch (err) {
      // Fallback a DELETE estándar si el endpoint especial no existe
      response = await apiClient.delete(`/usuarios/${id}`)
    }
    
    if (response && response.success) {
      // Eliminar del array de inactivos
      inactiveUsers.value = inactiveUsers.value.filter(
        (u: ExtendedUser) => u.id !== id
      )
      // También del array de usuarios activos
      users.value = users.value.filter((u: User) => u.id !== id)
      
      toast.success('Usuario eliminado definitivamente')
    } else {
      const msg = response?.message || 'Error al eliminar definitivamente'
      throw new Error(msg)
    }
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error)
    const msg = error?.message || error?.response?.data?.message || 'Error al eliminar el usuario'
    toast.error(msg)
  }
}

// Activar usuario inactivo (modal de inactivos)
const activateUser = async (id: number) => {
  // Verificar restricciones
  const restrictions = await checkUserRestrictions(id)
  if (!restrictions.canToggleStatus) {
    toast.error(restrictions.reasons?.[0] || 'No se puede activar este usuario')
    return
  }

  const confirmed = await confirm({
    title: 'Activar usuario',
    message: '¿Estás seguro de que quieres activar este usuario?',
    confirmText: 'Activar',
    cancelText: 'Cancelar',
  })
  if (!confirmed) return

  try {
    // Encontrar el usuario en la lista por id
    const user = inactiveUsers.value.find((u: ExtendedUser) => u.id === id)
    if (!user) {
      toast.error('Usuario no encontrado')
      return
    }

    // Enviar payload completo como en toggleUserStatus
    const payload = {
      nombres: user.nombre,
      apellidos: user.apellido || '',
      email: user.email,
      cedula: user.documento || '',
      telefono: user.telefono || '',
      area_id: (user as any).area_id || '',
      rol_id: (user as any).rol_id || user.rol || '',
      activo: true
    }

    const response = await apiClient.put(`/usuarios/${id}`, payload)
    const data = response
    if (data.success) {
      // Actualizar arrays locales para reflejar el cambio en tiempo real
      inactiveUsers.value = inactiveUsers.value.filter((u: ExtendedUser) => u.id !== id)
      // marcar usuario como activo y agregar a la lista principal si no existe
      user.activo = true as any
      user.estado = 'activo' as any
      const exists = users.value.find((u: User) => u.id === id)
      if (!exists) {
        users.value.unshift(user as unknown as User)
      } else {
        // si existe, actualizar estado
        exists.estado = 'activo'
        ;(exists as any).activo = true
      }

      toast.success('Usuario activado correctamente')
    } else {
      throw new Error(data.message || 'Error al activar usuario')
    }
  } catch (error) {
    console.error('Error activating user:', error)
    toast.error('Error al activar el usuario')
  }
}

const saveUser = async () => {
  try {
    if (form.value.password !== form.value.confirmPassword && !showEditModal.value) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    // Validaciones locales: cédula y teléfono
    const cedulaVal = String(form.value.documento || '').trim()
    const telefonoVal = String(form.value.telefono || '').trim()

    // Validación de cédula ecuatoriana
    const validateCedulaEcuador = (cedula: string): { valid: boolean; error?: string } => {
      if (!cedula) return { valid: true } // Opcional

      if (!/^\d{10}$/.test(cedula)) return { valid: false, error: 'Cédula debe tener exactamente 10 dígitos' }
      const province = parseInt(cedula.substring(0, 2), 10)
      if (province < 1 || province > 24) return { valid: false, error: 'Provincia inválida' }
      const third = parseInt(cedula.charAt(2), 10)
      if (third >= 6) return { valid: false, error: 'Tipo de cédula inválido' }

      const coefficients = [2, 1, 2, 1, 2, 1, 2, 1, 2]
      let sum = 0
      for (let i = 0; i < 9; i++) {
        let val = parseInt(cedula.charAt(i), 10) * coefficients[i]
        if (val > 9) val -= 9
        sum += val
      }
      const verifier = (10 - (sum % 10)) % 10
      if (verifier !== parseInt(cedula.charAt(9), 10)) {
        return { valid: false, error: 'Cédula inválida (checksum incorrecto)' }
      }
      return { valid: true }
    }

    const validateEcuadorianPhone = (phone: string) => {
      if (!phone) return true
      return /^09\d{8}$/.test(phone)
    }

    const cedValidation = validateCedulaEcuador(cedulaVal)
    if (!cedValidation.valid) {
      toast.error(`Cédula inválida: ${cedValidation.error}`)
      return
    }

    if (telefonoVal && !validateEcuadorianPhone(telefonoVal)) {
      toast.error('Teléfono inválido. Debe tener 10 dígitos y comenzar con 09.')
      return
    }

    const payload = {
      nombres: form.value.nombre,
      apellidos: form.value.apellido,
      email: form.value.email,
      cedula: form.value.documento,
      telefono: form.value.telefono,
      area_id: form.value.area_id,
      rol_id: roles.value.find((r: Role) => r.nombre === form.value.rol)?.id || form.value.rol,
      password: form.value.password,
      activo: true
    }

    const selectedRole = roles.value.find((r: Role) => r.nombre === form.value.rol)
    if (selectedRole) {
      payload.rol_id = selectedRole.id
    }

    let response
    if (showEditModal.value && form.value.id) {
      response = await apiClient.put(`/usuarios/${form.value.id}`, payload)
    } else {
      response = await apiClient.post('/usuarios', payload)
    }

    const data = response
    if (data.success) {
      await loadUsers()
      toast.success(showEditModal.value ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente')
      closeModal()
    } else {
      throw new Error(data.message || 'Error al guardar usuario')
    }
  } catch (error: any) {
    console.error('Error saving user:', error)
    // Intentar obtener el mensaje específico del backend
    let errorMsg = 'Error al guardar el usuario'
    if (error.response?.data?.message) {
      errorMsg = error.response.data.message
    } else if (error.message) {
      errorMsg = error.message
    }
    toast.error(errorMsg)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  form.value = {
    id: null,
    nombre: '',
    apellido: '',
    email: '',
    documento: '',
    area: '',
    area_id: '',
    rol: '',
    password: '',
    confirmPassword: '',
    telefono: '',
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedUser.value = null
  userAssignments.value = []
  loadingAssignments.value = false
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'Nunca'
  return new Date(dateString).toLocaleDateString('es-EC', {
    timeZone: 'America/Guayaquil',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Control de acceso por rol al cargar
onMounted(async () => {
  if (!isAdmin.value) {
    toast.error('Acceso denegado: solo administradores pueden gestionar usuarios')
    return
  }

  await Promise.all([loadUsers(), loadRoles(), loadAreas()])
})
</script>
