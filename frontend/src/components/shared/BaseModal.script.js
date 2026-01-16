
import BaseButton from './BaseButton.vue'

export default {
  name: 'BaseModal',
  components: {
    BaseButton,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['xs', 'sm', 'md', 'lg', 'xl', 'full'].includes(value),
    },
    variant: {
      type: String,
      default: 'default',
      validator: value => [
        'default',
        'primary',
        'success',
        'danger',
        'warning',
        'info',
      ].includes(value),
    },
    closable: {
      type: Boolean,
      default: true,
    },
    persistent: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    confirmable: {
      type: Boolean,
      default: false,
    },
    cancelable: {
      type: Boolean,
      default: false,
    },
    confirmText: {
      type: String,
      default: 'Confirmar',
    },
    cancelText: {
      type: String,
      default: 'Cancelar',
    },
    centered: {
      type: Boolean,
      default: true,
    },
    scrollable: {
      type: Boolean,
      default: false,
    },
    backdrop: {
      type: String,
      default: 'blur',
      validator: value => ['blur', 'dark', 'transparent'].includes(value),
    },
  },
  emits: ['close', 'confirm', 'cancel', 'update:show'],
  computed: {
    titleId() {
      return `modal-title-${this.$.uid}`
    },
    bodyId() {
      return `modal-body-${this.$.uid}`
    },
    modalClasses() {
      return [
        'modal-content',
        `modal-${this.size}`,
        `modal-${this.variant}`,
        {
          'modal-centered': this.centered,
          'modal-scrollable': this.scrollable,
          'modal-loading': this.loading,
        },
      ]
    },
  },
  watch: {
    show(newValue) {
      if (newValue) {
        this.handleOpen()
      } else {
        this.handleClose()
      }
    },
  },
  mounted() {
    if (this.show) {
      this.handleOpen()
    }
  },
  beforeUnmount() {
    this.handleClose()
  },
  methods: {
    handleOpen() {
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      // Focus management
      this.$nextTick(() => {
        const modal = this.$el.querySelector('.modal-content')
        if (modal) {
          modal.focus()
        }
      })
    },
    handleClose() {
      // Restore body scroll
      document.body.style.overflow = ''
      
      this.$emit('close')
      this.$emit('update:show', false)
    },
    handleOverlayClick() {
      if (!this.persistent && this.closable) {
        this.handleClose()
      }
    },
    handleEscapeKey() {
      if (!this.persistent && this.closable) {
        this.handleClose()
      }
    },
    handleConfirm() {
      this.$emit('confirm')
    },
    handleCancel() {
      this.$emit('cancel')
      this.handleClose()
    },
  },
}
