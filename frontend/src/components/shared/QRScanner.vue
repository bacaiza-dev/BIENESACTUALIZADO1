<template>
  <div class="qr-scanner-container">
    <!-- Header del scanner -->
    <div class="scanner-header">
      <h3 class="scanner-title">
        <i class="fas fa-qrcode"></i>
        Escáner QR
      </h3>
      <div class="scanner-controls">
        <button
          v-if="!isScanning"
          @click="startScanning"
          class="btn-primary"
          :disabled="!cameraAvailable"
        >
          <i class="fas fa-play"></i>
          Iniciar Escaneo
        </button>
        <button v-else @click="stopScanning" class="btn-secondary">
          <i class="fas fa-stop"></i>
          Detener
        </button>
        <button
          @click="toggleFlash"
          class="btn-icon"
          :class="{ active: flashEnabled }"
          :disabled="!flashAvailable"
        >
          <i class="fas fa-bolt"></i>
        </button>
      </div>
    </div>

    <!-- Estado de conectividad -->
    <div class="connectivity-status" :class="{ offline: !isOnline }">
      <i :class="isOnline ? 'fas fa-wifi' : 'fas fa-wifi-slash'"></i>
      <span>{{ isOnline ? 'Modo Online' : 'Modo Offline' }}</span>
    </div>

    <!-- Área del scanner -->
    <div class="scanner-area" ref="scannerArea">
      <!-- Video del scanner -->
      <video
        v-show="isScanning"
        ref="video"
        class="scanner-video"
        :class="{ 'flash-on': flashEnabled }"
      ></video>

      <!-- Overlay del scanner -->
      <div v-show="isScanning" class="scanner-overlay">
        <div class="scanner-frame">
          <div class="corner top-left"></div>
          <div class="corner top-right"></div>
          <div class="corner bottom-left"></div>
          <div class="corner bottom-right"></div>
        </div>
        <div class="scanner-instructions">
          <p>Coloca el código QR dentro del marco</p>
        </div>
      </div>

      <!-- Placeholder cuando no está escaneando -->
      <div v-show="!isScanning" class="scanner-placeholder">
        <div class="placeholder-icon">
          <i class="fas fa-qrcode"></i>
        </div>
        <p class="placeholder-text">
          <template v-if="!isMobile && !isTablet">
            📱 Scanner QR solo disponible en dispositivos móviles
          </template>
          <template v-else-if="!isAndroid && !isIOS">
            🤖📱 Compatible solo con Android e iOS
          </template>
          <template v-else-if="cameraAvailable">
            Presiona "Iniciar Escaneo" para comenzar
          </template>
          <template v-else>
            Cámara no disponible
          </template>
        </p>
      </div>
    </div>

    <!-- Resultados del escaneo -->
    <div v-if="scanResults.length > 0" class="scan-results">
      <h4 class="results-title">
        <i class="fas fa-list"></i>
        Resultados Recientes
      </h4>
      <div class="results-list">
        <div
          v-for="(result, index) in scanResults"
          :key="index"
          class="result-item"
          :class="{ 'offline-result': !result.synced }"
        >
          <div class="result-content">
            <div class="result-code">{{ result.code }}</div>
            <div class="result-info">
              <span class="result-time">{{ formatTime(result.timestamp) }}</span>
              <span v-if="!result.synced" class="result-status offline">
                <i class="fas fa-clock"></i>
                Pendiente
              </span>
              <span v-else class="result-status online">
                <i class="fas fa-check"></i>
                Sincronizado
              </span>
            </div>
          </div>
          <div class="result-actions">
            <button @click="viewResult(result)" class="btn-icon">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="removeResult(index)" class="btn-icon danger">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de resultado -->
    <div v-if="selectedResult" class="result-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Información del Bien</h3>
          <button @click="closeModal" class="btn-icon">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="selectedResult.bien" class="bien-info">
            <div class="info-row">
              <span class="label">Código:</span>
              <span class="value">{{ selectedResult.bien.codigo_institucional }}</span>
            </div>
            <div class="info-row">
              <span class="label">Bien:</span>
              <span class="value">{{ selectedResult.bien.nombre || selectedResult.bien.clase_de_bien }}</span>
            </div>
            <div class="info-row">
              <span class="label">Clase:</span>
              <span class="value">{{ selectedResult.bien.clase_de_bien || 'N/A' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Categoria:</span>
              <span class="value">{{ selectedResult.bien.categoria?.nombre || 'N/A' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Ubicacion:</span>
              <span class="value">{{ selectedResult.bien.ubicacion?.nombre || 'No asignada' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Responsable:</span>
              <span class="value">
                {{
                  selectedResult.bien.responsable
                    ? `${selectedResult.bien.responsable.nombre || ''} ${selectedResult.bien.responsable.apellido || ''}`.trim()
                    : 'Sin asignar'
                }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">Marca:</span>
              <span class="value">{{ selectedResult.bien.marca }}</span>
            </div>
            <div class="info-row">
              <span class="label">Modelo:</span>
              <span class="value">{{ selectedResult.bien.modelo }}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado:</span>
              <span class="value status-badge" :class="selectedResult.bien.estado.toLowerCase()">
                {{ selectedResult.bien.estado }}
              </span>
            </div>
            <div class="info-row">
              <span class="label">Valor:</span>
              <span class="value">{{ formatCurrency(selectedResult.bien.valor) }}</span>
            </div>
          </div>
          <div v-else class="no-bien-info">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Bien no encontrado en la base de datos</p>
            <p class="code-display">{{ selectedResult.code }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">Cerrar</button>
          <button
            v-if="selectedResult.bien"
            @click="editBien(selectedResult.bien)"
            class="btn-primary"
          >
            <i class="fas fa-edit"></i>
            Editar
          </button>
        </div>
      </div>
    </div>

    <!-- Notificaciones -->
    <div v-if="notification" class="notification" :class="notification.type">
      <i :class="notification.icon"></i>
      <span>{{ notification.message }}</span>
    </div>
  </div>
</template>

<script src="./QRScanner.script.js"></script>

<style scoped src="./QRScanner.style.scoped.css"></style>
