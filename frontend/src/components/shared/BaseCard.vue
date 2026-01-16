<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <div class="card-title-wrapper">
          <h3 v-if="title" class="card-title">
            <i v-if="icon" :class="icon" class="mr-2"></i>
            {{ title }}
          </h3>
          <div v-if="$slots.actions" class="card-actions">
            <slot name="actions" />
          </div>
        </div>
      </slot>
    </div>
    
    <div v-if="$slots.default" class="card-body">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script src="./BaseCard.script.js"></script>

<style scoped src="./BaseCard.style.scoped.css"></style>