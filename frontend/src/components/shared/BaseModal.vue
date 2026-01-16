<template>
  <teleport to="body">
    <transition name="modal" appear>
      <div
        v-if="show"
        class="modal-overlay"
        @click="handleOverlayClick"
        @keydown.esc="handleEscapeKey"
        tabindex="0"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="bodyId"
      >
        <div :class="modalClasses" @click.stop>
          <!-- Loading State -->
          <div v-if="loading" class="modal-loading">
            <div class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
          </div>

          <!-- Header -->
          <div v-if="$slots.header || title" class="modal-header">
            <slot name="header">
              <div class="modal-title-wrapper">
                <h3 :id="titleId" class="modal-title">
                  <i v-if="icon" :class="icon" class="mr-2"></i>
                  {{ title }}
                </h3>
                <button
                  v-if="closable"
                  @click="handleClose"
                  class="modal-close-button"
                  aria-label="Cerrar modal"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </slot>
          </div>

          <!-- Body -->
          <div v-if="$slots.default" :id="bodyId" class="modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer">
              <div class="modal-actions">
                <base-button
                  v-if="cancelable"
                  variant="outline"
                  @click="handleCancel"
                  :disabled="loading"
                >
                  {{ cancelText }}
                </base-button>
                <base-button
                  v-if="confirmable"
                  variant="primary"
                  @click="handleConfirm"
                  :loading="loading"
                >
                  {{ confirmText }}
                </base-button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script src="./BaseModal.script.js"></script>

<style scoped src="./BaseModal.style.scoped.css"></style>