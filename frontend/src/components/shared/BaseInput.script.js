
export default {
  name: 'BaseInput',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number, Boolean],
      default: '',
    },
    label: {
      type: String,
      default: null,
    },
    placeholder: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
      validator: value => [
        'text',
        'email',
        'password',
        'number',
        'tel',
        'url',
        'search',
        'date',
        'datetime-local',
        'time',
        'month',
        'week',
        'color',
      ].includes(value),
    },
    inputType: {
      type: String,
      default: 'input',
      validator: value => ['input', 'textarea', 'select'].includes(value),
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg'].includes(value),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: null,
    },
    helpText: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    showPasswordToggle: {
      type: Boolean,
      default: true,
    },
    // Number input specific
    min: {
      type: [String, Number],
      default: null,
    },
    max: {
      type: [String, Number],
      default: null,
    },
    step: {
      type: [String, Number],
      default: null,
    },
    // Textarea specific
    rows: {
      type: [String, Number],
      default: 3,
    },
    cols: {
      type: [String, Number],
      default: null,
    },
  },
  emits: ['update:modelValue', 'input', 'blur', 'focus', 'change'],
  data() {
    return {
      isPasswordVisible: false,
    }
  },
  computed: {
    inputId() {
      return `input-${this.$.uid}`
    },
    componentType() {
      return this.inputType
    },
    actualType() {
      if (this.type === 'password' && this.showPasswordToggle) {
        return this.isPasswordVisible ? 'text' : 'password'
      }
      return this.type
    },
    inputClasses() {
      return [
        'base-input',
        `base-input-${this.size}`,
        {
          'has-icon': this.icon,
          'has-error': this.error,
          'is-disabled': this.disabled,
          'is-readonly': this.readonly,
        },
      ]
    },
  },
  methods: {
    handleInput(event) {
      const value = event.target.value
      this.$emit('update:modelValue', value)
      this.$emit('input', value)
    },
    handleBlur(event) {
      this.$emit('blur', event)
    },
    handleFocus(event) {
      this.$emit('focus', event)
    },
    handleChange(event) {
      this.$emit('change', event)
    },
    clearInput() {
      this.$emit('update:modelValue', '')
      this.$emit('input', '')
    },
    togglePasswordVisibility() {
      this.isPasswordVisible = !this.isPasswordVisible
    },
  },
}
