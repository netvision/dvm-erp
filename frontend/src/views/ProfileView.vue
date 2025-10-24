<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Profile
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          View and manage your account information
        </p>
      </div>
    </div>

    <!-- Profile Information -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <!-- Avatar Section -->
          <div class="col-span-1 sm:col-span-2 flex items-center space-x-6">
            <div class="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center">
              <span class="text-2xl font-medium text-white">
                {{ userInitials }}
              </span>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ authStore.fullName }}</h3>
              <p class="text-sm text-gray-500 capitalize">{{ authStore.user?.role }}</p>
              <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
            </div>
          </div>

          <!-- Personal Information -->
          <div>
            <label class="block text-sm font-medium text-gray-700">First Name</label>
            <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.first_name || '-' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Last Name</label>
            <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.last_name || '-' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <p class="mt-1 text-sm text-gray-900">{{ authStore.user?.email || '-' }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Role</label>
            <p class="mt-1 text-sm text-gray-900 capitalize">{{ authStore.user?.role || '-' }}</p>
          </div>

          <div v-if="authStore.user?.phone">
            <label class="block text-sm font-medium text-gray-700">Phone</label>
            <p class="mt-1 text-sm text-gray-900">{{ authStore.user.phone }}</p>
          </div>

          <div v-if="authStore.user?.student_id">
            <label class="block text-sm font-medium text-gray-700">Student ID</label>
            <p class="mt-1 text-sm text-gray-900">{{ authStore.user.student_id }}</p>
          </div>

          <div v-if="authStore.user?.employee_id">
            <label class="block text-sm font-medium text-gray-700">Employee ID</label>
            <p class="mt-1 text-sm text-gray-900">{{ authStore.user.employee_id }}</p>
          </div>

          <div v-if="authStore.user?.grade_level">
            <label class="block text-sm font-medium text-gray-700">Grade Level</label>
            <p class="mt-1 text-sm text-gray-900">{{ authStore.user.grade_level }}</p>
          </div>

          <div v-if="authStore.user?.department">
            <label class="block text-sm font-medium text-gray-700">Department</label>
            <p class="mt-1 text-sm text-gray-900">{{ authStore.user.department }}</p>
          </div>

          <div v-if="authStore.user?.address" class="col-span-1 sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Address</label>
            <p class="mt-1 text-sm text-gray-900">{{ authStore.user.address }}</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            @click="showEditModal = true"
            class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <PencilIcon class="w-4 h-4 mr-2" />
            Edit Profile
          </button>
          <button
            @click="showPasswordModal = true"
            class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <KeyIcon class="w-4 h-4 mr-2" />
            Change Password
          </button>
        </div>
      </div>
    </div>

    <!-- Account Statistics (for students) -->
    <div v-if="authStore.isStudent" class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Library Statistics</h3>
        
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div class="bg-blue-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-blue-600 truncate">Books Borrowed</dt>
            <dd class="mt-1 text-3xl font-semibold text-blue-900">{{ stats.totalBorrowed }}</dd>
          </div>
          
          <div class="bg-green-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-green-600 truncate">Books Returned</dt>
            <dd class="mt-1 text-3xl font-semibold text-green-900">{{ stats.totalReturned }}</dd>
          </div>
          
          <div class="bg-purple-50 overflow-hidden rounded-lg px-4 py-5 sm:p-6">
            <dt class="text-sm font-medium text-purple-600 truncate">Bookmarks</dt>
            <dd class="mt-1 text-3xl font-semibold text-purple-900">{{ stats.totalBookmarks }}</dd>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
        
        <div v-if="recentActivity.length === 0" class="text-center py-8">
          <p class="text-sm text-gray-500">No recent activity</p>
        </div>
        
        <div v-else class="flow-root">
          <ul role="list" class="-mb-8">
            <li v-for="(activity, activityIdx) in recentActivity" :key="activity.id">
              <div class="relative pb-8">
                <span
                  v-if="activityIdx !== recentActivity.length - 1"
                  class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                      <BookOpenIcon class="h-4 w-4 text-white" />
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">{{ activity.description }}</p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time :datetime="activity.created_at">{{ formatDate(activity.created_at) }}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Edit Profile</h2>
            <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="saveProfile" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  v-model="profileForm.first_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  v-model="profileForm.last_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                  {{ authStore.user?.email || 'N/A' }}
                </div>
                <p class="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  v-model="profileForm.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                v-model="profileForm.address"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="closeEditModal"
                class="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="saving"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Change Password</h2>
            <button @click="closePasswordModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
          
          <form @submit.prevent="savePassword" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Current Password *</label>
              <input
                v-model="passwordForm.currentPassword"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">New Password *</label>
              <input
                v-model="passwordForm.newPassword"
                type="password"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password *</label>
              <input
                v-model="passwordForm.confirmPassword"
                type="password"
                required
                minlength="6"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="closePasswordModal"
                class="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="changingPassword"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {{ changingPassword ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Notification Toast -->
    <div v-if="notification.show" class="fixed top-4 right-4 z-50">
      <div 
        :class="[
          'rounded-lg px-4 py-3 shadow-lg text-white font-medium',
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        ]"
      >
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BookOpenIcon, PencilIcon, KeyIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const authStore = useAuthStore()

// Modal states
const showEditModal = ref(false)
const showPasswordModal = ref(false)
const saving = ref(false)
const changingPassword = ref(false)

// Notification state
const notification = ref({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

// Form data
const profileForm = ref({
  first_name: '',
  last_name: '',
  phone: '',
  address: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const stats = ref({
  totalBorrowed: 0,
  totalReturned: 0,
  totalBookmarks: 0
})

const recentActivity = ref<Array<{
  id: number
  description: string
  created_at: string
}>>([])

const userInitials = computed(() => {
  if (!authStore.user) return ''
  const first = authStore.user.first_name?.charAt(0) || ''
  const last = authStore.user.last_name?.charAt(0) || ''
  return (first + last).toUpperCase()
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// Notification helper
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// Initialize profile form with current user data
const initializeProfileForm = () => {
  if (authStore.user) {
    profileForm.value = {
      first_name: authStore.user.first_name || '',
      last_name: authStore.user.last_name || '',
      phone: authStore.user.phone || '',
      address: authStore.user.address || ''
    }
  }
}

// Profile edit functions
const closeEditModal = () => {
  showEditModal.value = false
  initializeProfileForm() // Reset form to original values
}

const saveProfile = async () => {
  if (!authStore.user) return
  
  saving.value = true
  try {
    await axios.put('/auth/profile', profileForm.value)
    
    // Update the auth store with new user data
    await authStore.initializeAuth()
    
    showEditModal.value = false
    showNotification('Profile updated successfully!')
  } catch (error) {
    console.error('Error updating profile:', error)
    showNotification('Error updating profile. Please try again.', 'error')
  } finally {
    saving.value = false
  }
}

// Password change functions
const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const savePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showNotification('New passwords do not match!', 'error')
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    showNotification('New password must be at least 6 characters long!', 'error')
    return
  }

  changingPassword.value = true
  try {
    await axios.put('/auth/change-password', {
      current_password: passwordForm.value.currentPassword,
      new_password: passwordForm.value.newPassword
    })
    
    showPasswordModal.value = false
    showNotification('Password changed successfully!')
  } catch (error: any) {
    console.error('Error changing password:', error)
    if (error.response?.status === 400) {
      showNotification('Current password is incorrect!', 'error')
    } else {
      showNotification('Error changing password. Please try again.', 'error')
    }
  } finally {
    changingPassword.value = false
  }
}

const fetchUserStats = async () => {
  try {
    // TODO: Implement API calls for user statistics
    // const borrowResponse = await axios.get('/borrow/stats')
    // const bookmarkResponse = await axios.get('/bookmarks/count')
    // stats.value = { ... }
    
    // Mock data for now
    stats.value = {
      totalBorrowed: 12,
      totalReturned: 10,
      totalBookmarks: 5
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
  }
}

const fetchRecentActivity = async () => {
  try {
    // TODO: Implement API call for recent activity
    // const response = await axios.get('/activity/recent')
    // recentActivity.value = response.data.data
    
    // Mock data for now
    recentActivity.value = []
  } catch (error) {
    console.error('Error fetching recent activity:', error)
  }
}

onMounted(() => {
  initializeProfileForm()
  if (authStore.isStudent) {
    fetchUserStats()
  }
  fetchRecentActivity()
})
</script>