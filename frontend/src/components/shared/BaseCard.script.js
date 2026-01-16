
export default {
  name: 'BaseCard',
  props: {
    title: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    variant: {
      type: String,
      default: 'default',
      validator: value => [
        'default',
        'primary',
        'secondary',
        'success',
        'danger',
        'warning',
        'info',
        'elevated',
        'outline',
        'glass',
      ].includes(value),
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value),
    },
    shadow: {
      type: String,
      default: 'md',
      validator: value => ['none', 'sm', 'md', 'lg', 'xl'].includes(value),
    },
    rounded: {
      type: String,
      default: 'lg',
      validator: value => ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'].includes(value),
    },
    hover: {
      type: Boolean,
      default: false,
    },
    clickable: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    noPadding: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  computed: {
    cardClasses() {
      return [
        'base-card',
        `card-${this.variant}`,
        `card-${this.size}`,
        `card-shadow-${this.shadow}`,
        `card-rounded-${this.rounded}`,
        {
          'card-hover': this.hover,
          'card-clickable': this.clickable,
          'card-loading': this.loading,
          'card-no-padding': this.noPadding,
        },
      ]
    },
  },
  methods: {
    handleClick(event) {
      if (this.clickable) {
        this.$emit('click', event)
      }
    },
  },
}
