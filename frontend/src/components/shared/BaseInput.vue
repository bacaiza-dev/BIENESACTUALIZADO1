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

<script src="./BaseInput.script.js"></script>

<style scoped src="./BaseInput.style.scoped.css"></style>