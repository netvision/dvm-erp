<template>
  <div v-if="showDebug" class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg text-xs">
    <div class="font-bold">Environment Debug Info:</div>
    <div>API Base URL: {{ apiBaseUrl }}</div>
    <div>Environment: {{ environment }}</div>
    <div>Mode: {{ mode }}</div>
    <button @click="showDebug = false" class="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs">Close</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showDebug = ref(true)

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'NOT SET'
const environment = import.meta.env.VITE_APP_ENV || 'NOT SET'
const mode = import.meta.env.MODE || 'NOT SET'
</script>
</template>

<parameter name="newString">