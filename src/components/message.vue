<template>
  <div v-if="show" class="message-overlay">
    <div class="message-content">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.message-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 1000;
}
</style>
