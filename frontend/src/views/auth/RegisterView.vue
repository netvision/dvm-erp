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
          Create Your Account
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Join the School Library System
        </p>
      </div>

      <!-- Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AppInput
              v-model="form.firstName"
              label="First Name"
              placeholder="Enter your first name"
              required
              :error="errors.firstName"
            />

            <AppInput
              v-model="form.lastName"
              label="Last Name"
              placeholder="Enter your last name"
              required
              :error="errors.lastName"
            />
          </div>

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
            placeholder="Create a password"
            required
            :error="errors.password"
            help="Password must be at least 6 characters long"
          />

          <AppInput
            v-model="form.confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            required
            :error="errors.confirmPassword"
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Account Type <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.role"
              required
              class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select account type</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
            <p v-if="errors.role" class="mt-1 text-sm text-red-600">
              {{ errors.role }}
            </p>
          </div>
        </div>

        <div v-if="registerError" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Registration Failed
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ registerError }}
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
            Create Account
          </AppButton>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
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
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
})

const errors = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: ''
})

const isLoading = ref(false)
const registerError = ref('')

const isFormValid = computed(() => {
  return (
    form.value.firstName &&
    form.value.lastName &&
    form.value.email &&
    form.value.password &&
    form.value.confirmPassword &&
    form.value.role &&
    !Object.values(errors.value).some(error => error !== '')
  )
})

const validateName = (name: string, field: string) => {
  if (!name) return `${field} is required`
  if (name.length < 2) return `${field} must be at least 2 characters`
  return ''
}

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

const validateConfirmPassword = (password: string, confirmPassword: string) => {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  return ''
}

const validateRole = (role: string) => {
  if (!role) return 'Please select an account type'
  return ''
}

const validateForm = () => {
  errors.value.firstName = validateName(form.value.firstName, 'First name')
  errors.value.lastName = validateName(form.value.lastName, 'Last name')
  errors.value.email = validateEmail(form.value.email)
  errors.value.password = validatePassword(form.value.password)
  errors.value.confirmPassword = validateConfirmPassword(form.value.password, form.value.confirmPassword)
  errors.value.role = validateRole(form.value.role)
}

const handleRegister = async () => {
  validateForm()
  
  if (!isFormValid.value) return
  
  isLoading.value = true
  registerError.value = ''
  
  try {
    // Prepare registration data
    const registrationData: any = {
      first_name: form.value.firstName,
      last_name: form.value.lastName,
      email: form.value.email,
      password: form.value.password,
      role: form.value.role
    }

    // Add role-specific fields
    if (form.value.role === 'student') {
      // Generate a student ID (you can make this more sophisticated)
      registrationData.student_id = `STU${Date.now().toString().slice(-6)}`
    } else if (form.value.role === 'teacher') {
      // Generate an employee ID for teachers
      registrationData.employee_id = `EMP${Date.now().toString().slice(-6)}`
    }

    const result = await authStore.register(registrationData)
    
    if (result.success) {
      // Redirect to login page with success message
      router.push({
        path: '/login',
        query: { message: 'Registration successful! Please log in.' }
      })
    } else {
      console.error('Registration failed:', result.message)
      registerError.value = result.message || 'Registration failed. Please try again.'
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    registerError.value = error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>