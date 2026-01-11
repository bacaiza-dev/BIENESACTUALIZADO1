<template>
  <div class="base-input-group">
    <label v-if="label" :for="inputId" class="base-input-label">
      {{ label }}
      <span v-if="required" class="required-asterisk">*</span>
    </label>
    
    <div class="base-input-wrapper" :class="{ 'has-error': error, 'has-icon': icon }">
      <div v-if="icon" class="input-icon">
        <i :class="icon"></i>
      </div>
      
      <component
        :is="componentType"
        :id="inputId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :type="actualType"
        :min="min"
        :max="max"
        :step="step"
        :rows="rows"
        :cols="cols"
        :class="inputClasses"
        v-bind="$attrs"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @change="handleChange"
      >
        <template v-if="componentType === 'select'">
          <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
          <slot name="options" />
        </template>
        <template v-else-if="componentType === 'textarea'">
          {{ modelValue }}
        </template>
      </component>
      
      <!-- Password toggle button -->
      <div 
        v-if="type === 'password' && showPasswordToggle" 
        class="password-toggle-button" 
        @click="togglePasswordVisibility"
      >
        <i :class="isPasswordVisible ? 'bx bx-hide' : 'bx bx-show'"></i>
      </div>
      
      <div v-else-if="clearable && modelValue" class="clear-button" @click="clearInput">
        <i class="bx bx-x"></i>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      {{ error }}
    </div>
    
    <div v-else-if="helpText" class="help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script>
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
</script>

<style scoped>
.base-input-group {
  @apply w-full;
}

.base-input-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2;
}

.required-asterisk {
  @apply text-red-500 ml-1;
}

.base-input-wrapper {
  @apply relative;
}

.input-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none z-10;
}

.clear-button,
.password-toggle-button {
  @apply absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 z-10 transition-colors duration-200;
}

.password-toggle-button:hover {
  @apply text-blue-500 dark:text-blue-400;
}

.base-input {
  @apply w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:focus:ring-opacity-50 transition-all duration-200;
}

.base-input:focus {
  @apply outline-none;
}

.base-input.has-icon {
  @apply pl-10;
}

.base-input.has-error {
  @apply border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500;
}

.base-input.is-disabled {
  @apply bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed;
}

.base-input.is-readonly {
  @apply bg-gray-50 dark:bg-gray-600 cursor-default;
}

/* Size variants */
.base-input-sm {
  @apply px-3 py-2 text-sm min-h-[36px];
}

.base-input-md {
  @apply px-4 py-3 text-base min-h-[44px];
}

.base-input-lg {
  @apply px-5 py-4 text-lg min-h-[48px];
}

/* Textarea specific */
textarea.base-input {
  @apply resize-y;
}

/* Select specific */
select.base-input {
  @apply appearance-none bg-no-repeat bg-right pr-10;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-size: 1.5em 1.5em;
}

.dark select.base-input {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%9ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
}

.error-message {
  @apply mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1;
}

.help-text {
  @apply mt-2 text-sm text-gray-500 dark:text-gray-400;
}

/* iOS Safe Area Support */
@supports (padding: max(0px)) {
  .base-input-group {
    margin-left: max(env(safe-area-inset-left), 0px);
    margin-right: max(env(safe-area-inset-right), 0px);
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .base-input-sm {
    @apply min-h-[40px] px-4 py-2;
  }
  
  .base-input-md {
    @apply min-h-[44px] px-4 py-3;
  }
  
  .base-input-lg {
    @apply min-h-[48px] px-5 py-4;
  }
  
  .input-icon {
    @apply left-4;
  }
  
  .clear-button,
  .password-toggle-button {
    @apply right-4;
  }
}

/* Prevent iOS zoom on input focus */
@media (max-width: 768px) {
  .base-input {
    font-size: 16px;
  }
  
  .base-input-sm {
    font-size: 16px;
  }
  
  .base-input-lg {
    font-size: 18px;
  }
}

/* Touch improvements */
.base-input {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
}

.clear-button,
.password-toggle-button {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

/* Focus states for better accessibility */
.base-input:focus-visible {
  @apply ring-2 ring-blue-500 ring-opacity-50;
}

/* Placeholder styles */
.base-input::placeholder {
  @apply text-gray-500 dark:text-gray-400;
}

/* Autofill styles */
.base-input:-webkit-autofill,
.base-input:-webkit-autofill:hover,
.base-input:-webkit-autofill:focus {
  -webkit-text-fill-color: theme('colors.gray.900');
  -webkit-box-shadow: 0 0 0px 1000px theme('colors.white') inset;
}

.dark .base-input:-webkit-autofill,
.dark .base-input:-webkit-autofill:hover,
.dark .base-input:-webkit-autofill:focus {
  -webkit-text-fill-color: theme('colors.gray.100');
  -webkit-box-shadow: 0 0 0px 1000px theme('colors.gray.700') inset;
}
</style>