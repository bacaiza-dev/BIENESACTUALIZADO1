<template>
  <button
    :type="type"
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    v-bind="$attrs"
  >
    <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
    <i v-else-if="icon" :class="icon" class="mr-2"></i>
    <slot />
  </button>
</template>

<script src="./BaseButton.script.js"></script>

<style scoped src="./BaseButton.style.scoped.css"></style>