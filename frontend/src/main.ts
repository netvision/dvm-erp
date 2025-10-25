import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'
import './style.css'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

// Configure Axios defaults
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
axios.defaults.baseURL = `${apiBaseUrl}/api`
axios.defaults.headers.common['Content-Type'] = 'application/json'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Setup Axios interceptors after Pinia is available
const authStore = useAuthStore()

// Request interceptor to add auth token
axios.interceptors.request.use(
  (config) => {
    const token = authStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.logout()
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

// Initialize authentication on app startup
async function initializeApp() {
  await authStore.initializeAuth()
  app.mount('#app')
}

initializeApp()
