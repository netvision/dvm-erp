<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
          <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.754 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          School Library System
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <AppInput
            v-model="form.email"
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            required
            :error="errors.email"
          />

          <AppInput
            v-model="form.password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
            :error="errors.password"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              v-model="form.rememberMe"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <div v-if="loginError" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Login Failed
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ loginError }}
              </div>
            </div>
          </div>
        </div>

        <div>
          <AppButton
            type="submit"
            :loading="isLoading"
            :disabled="!isFormValid"
            full-width
          >
            Sign in
          </AppButton>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
              Sign up here
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const errors = ref({
  email: '',
  password: ''
})

const isLoading = ref(false)
const loginError = ref('')

const isFormValid = computed(() => {
  return form.value.email && form.value.password && !errors.value.email && !errors.value.password
})

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return 'Email is required'
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return ''
}

const validatePassword = (password: string) => {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  return ''
}

const validateForm = () => {
  errors.value.email = validateEmail(form.value.email)
  errors.value.password = validatePassword(form.value.password)
}

const handleLogin = async () => {
  validateForm()
  
  if (!isFormValid.value) return
  
  isLoading.value = true
  loginError.value = ''
  
  try {
    const result = await authStore.login(
      form.value.email,
      form.value.password
    )
    
    if (result.success) {
      // Redirect based on user role
      const user = authStore.user
      if (user?.role === 'student') {
        router.push('/student/dashboard')
      } else if (user?.role === 'librarian' || user?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
    } else {
      console.error('Login failed:', result.message)
      loginError.value = result.message || 'Login failed. Please try again.'
    }
  } catch (error: any) {
    console.error('Login error:', error)
    loginError.value = error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>