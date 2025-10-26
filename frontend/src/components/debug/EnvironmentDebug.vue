<template>
  <div v-if="showDebug" class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg text-xs max-w-sm">
    <div class="font-bold">Environment Debug Info:</div>
    <div>API Base URL: {{ apiBaseUrl }}</div>
    <div>Environment: {{ environment }}</div>
    <div>Mode: {{ mode }}</div>
    <div>Auth Token: {{ authToken ? 'Present' : 'Missing' }}</div>
    <div>User: {{ user ? user.email : 'Not logged in' }}</div>
    <div>Is Authenticated: {{ isAuthenticated }}</div>
    <div class="mt-2">
      <button @click="testAPI" class="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-1">Test API</button>
      <button @click="showDebug = false" class="bg-red-500 text-white px-2 py-1 rounded text-xs">Close</button>
    </div>
    <div v-if="apiTestResult" class="mt-2 text-xs">
      API Test: {{ apiTestResult }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const authStore = useAuthStore()
const showDebug = ref(true)
const apiTestResult = ref('')

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'NOT SET'
const environment = import.meta.env.VITE_APP_ENV || 'NOT SET'
const mode = import.meta.env.MODE || 'NOT SET'

const authToken = authStore.token
const user = authStore.user
const isAuthenticated = authStore.isAuthenticated

const testAPI = async () => {
  try {
    const response = await axios.get('/library/digital-resources')
    apiTestResult.value = `✅ Success: ${response.data.data?.length || 0} resources`
  } catch (error: any) {
    apiTestResult.value = `❌ Error: ${error.response?.status || 'Network'} - ${error.message}`
  }
}
</script>