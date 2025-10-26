import { defineStore } from 'pinia'
import axios from 'axios'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  phone?: string
  address?: string
  student_id?: string
  employee_id?: string
  grade_level?: string
  department?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

// Safe localStorage access
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem('token')
  } catch (error) {
    console.warn('localStorage not available:', error)
    return null
  }
}

const setStoredToken = (token: string): void => {
  try {
    localStorage.setItem('token', token)
  } catch (error) {
    console.warn('Could not store token:', error)
  }
}

const removeStoredToken = (): void => {
  try {
    localStorage.removeItem('token')
  } catch (error) {
    console.warn('Could not remove token:', error)
  }
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: getStoredToken(),
    isAuthenticated: !!getStoredToken()
  }),

  actions: {
    async login(email: string, password: string) {
      try {
        const response = await axios.post('/auth/login', {
          email,
          password
        })

        const { user, token } = response.data.data
        
        this.user = user
        this.token = token
        this.isAuthenticated = true
        
        setStoredToken(token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        return { success: true }
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Login failed' 
        }
      }
    },

    async register(userData: any) {
      try {
        const response = await axios.post('/auth/register', userData)
        
        const { user, token } = response.data.data
        
        this.user = user
        this.token = token
        this.isAuthenticated = true
        
        setStoredToken(token)
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        return { success: true }
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Registration failed' 
        }
      }
    },

    async fetchProfile() {
      try {
        const response = await axios.get('/auth/profile')
        this.user = response.data.data.user
        this.isAuthenticated = true
        return { success: true }
      } catch (error: any) {
        this.logout()
        return { success: false }
      }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      removeStoredToken()
      delete axios.defaults.headers.common['Authorization']
    },

    async initializeAuth() {
      const token = getStoredToken()
      if (token) {
        this.token = token
        this.isAuthenticated = true
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        
        try {
          await this.fetchProfile()
        } catch (error) {
          // If profile fetch fails, the token is probably invalid
          this.logout()
        }
      }
    }
  },

  getters: {
    isAdmin: (state) => state.user?.role === 'admin',
    isLibrarian: (state) => state.user?.role === 'librarian',
    isStudent: (state) => state.user?.role === 'student',
    isTeacher: (state) => state.user?.role === 'teacher',
    canManageBooks: (state) => ['admin', 'librarian'].includes(state.user?.role || ''),
    canManageUsers: (state) => ['admin', 'librarian'].includes(state.user?.role || ''),
    fullName: (state) => state.user ? `${state.user.first_name} ${state.user.last_name}` : '',
    isReallyAuthenticated: (state) => !!(state.token && state.user && state.isAuthenticated)
  }
})