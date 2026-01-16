
export default {
  name: 'BaseButton',
  inheritAttrs: false,
  props: {
    variant: {
      type: String,
      default: 'primary',
      validator: value => [
        'primary',
        'secondary',
        'success',
        'danger',
        'warning',
        'info',
        'outline',
        'ghost',
        'icon'
      ].includes(value),
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
    },
    type: {
      type: String,
      default: 'button',
      validator: value => ['button', 'submit', 'reset'].includes(value),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    block: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      default: null,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  computed: {
    buttonClasses() {
      return [
        'btn',
        `btn-${this.variant}`,
        `btn-${this.size}`,
        {
          'btn-block': this.block,
          'btn-loading': this.loading,
          'btn-rounded': this.rounded,
          'btn-disabled': this.disabled,
        },
      ]
    },
  },
  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading && this.type !== 'submit') {
        this.$emit('click', event)
      }
    },
  },
}
