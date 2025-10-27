<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">Manage students, teachers, and staff accounts</p>
      </div>
      <button
        @click="showAddModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
      >
        <UserPlusIcon class="h-5 w-5" />
        <span>Add User</span>
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
          <select
            v-model="selectedRole"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="librarian">Librarian</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="searchUsers"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Search
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />

    <!-- Users Table -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID/Department
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Joined
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                      <span class="text-white font-medium">{{ getUserInitials(user) }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ user.first_name }} {{ user.last_name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.phone || 'No phone' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  getRoleColor(user.role)
                ]">
                  {{ formatRole(user.role) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                <div v-if="user.role === 'student'">
                  <div>{{ user.student_id || 'No ID' }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Grade: {{ user.grade_level || 'N/A' }}</div>
                </div>
                <div v-else>
                  <div>{{ user.employee_id || 'No ID' }}</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ user.department || 'No dept' }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  user.is_active 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                ]">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="editUser(user)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button
                  @click="toggleUserStatus(user)"
                  :class="[
                    'hover:text-gray-900 dark:hover:text-gray-300',
                    user.is_active ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  ]"
                >
                  <component :is="user.is_active ? LockClosedIcon : LockOpenIcon" class="h-4 w-4" />
                </button>
                <button
                  @click="resetPassword(user)"
                  class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                >
                  <KeyIcon class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalUsers) }} of {{ totalUsers }} users
          </div>
          <div class="flex space-x-2">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {{ showAddModal ? 'Add New User' : 'Edit User' }}
          </h2>
          
          <form @submit.prevent="saveUser" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name *</label>
                <input
                  v-model="userForm.first_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name *</label>
                <input
                  v-model="userForm.last_name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                <input
                  v-model="userForm.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role *</label>
                <select
                  v-model="userForm.role"
                  required
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="librarian">Librarian</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                <input
                  v-model="userForm.phone"
                  type="tel"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div v-if="userForm.role === 'student'">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student ID</label>
                <input
                  v-model="userForm.student_id"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div v-if="userForm.role === 'student'">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Grade Level</label>
                <input
                  v-model="userForm.grade_level"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div v-if="userForm.role !== 'student'">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Employee ID</label>
                <input
                  v-model="userForm.employee_id"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div v-if="userForm.role !== 'student'">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Department</label>
                <input
                  v-model="userForm.department"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
              <textarea
                v-model="userForm.address"
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              ></textarea>
            </div>

            <div v-if="showAddModal">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password *</label>
              <input
                v-model="userForm.password"
                type="password"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {{ showAddModal ? 'Add User' : 'Update User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  UserPlusIcon, 
  PencilIcon, 
  LockClosedIcon, 
  LockOpenIcon,
  KeyIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

// Types
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
  is_active: boolean
  created_at: string
}

// Reactive data
const loading = ref(false)
const users = ref<User[]>([])
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(0)

// User form
const userForm = ref({
  id: null as number | null,
  first_name: '',
  last_name: '',
  email: '',
  role: 'student',
  phone: '',
  address: '',
  student_id: '',
  employee_id: '',
  grade_level: '',
  department: '',
  password: ''
})

// Computed
const totalPages = computed(() => Math.ceil(totalUsers.value / pageSize.value))

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

// Methods
const fetchUsers = async () => {
  try {
    loading.value = true
    
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: pageSize.value.toString()
    })
    
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (selectedRole.value) params.append('role', selectedRole.value)
    if (selectedStatus.value) params.append('is_active', selectedStatus.value === 'active' ? 'true' : 'false')
    
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/api/users?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    
    const result = await response.json()
    users.value = result.data || []
    
    if (result.pagination) {
      totalUsers.value = result.pagination.total
    } else {
      totalUsers.value = users.value.length
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    alert('Failed to load users. Please try again.')
  } finally {
    loading.value = false
  }
}

const searchUsers = () => {
  currentPage.value = 1
  fetchUsers()
}

const getUserInitials = (user: User) => {
  return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
}

const getRoleColor = (role: string) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    librarian: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    teacher: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    student: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  }
  return colors[role as keyof typeof colors] || colors.student
}

const formatRole = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const editUser = (user: User) => {
  userForm.value = { 
    ...user, 
    password: '',
    phone: user.phone || '',
    address: user.address || '',
    student_id: user.student_id || '',
    employee_id: user.employee_id || '',
    grade_level: user.grade_level || '',
    department: user.department || ''
  }
  showEditModal.value = true
}

const toggleUserStatus = async (user: User) => {
  const action = user.is_active ? 'deactivate' : 'activate'
  if (!confirm(`Are you sure you want to ${action} ${user.first_name} ${user.last_name}?`)) {
    return
  }
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        is_active: !user.is_active
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to update user status')
    }
    
    // Update local state
    user.is_active = !user.is_active
    alert(`User ${action}d successfully!`)
  } catch (error) {
    console.error('Error toggling user status:', error)
    alert('Failed to update user status. Please try again.')
  }
}

const resetPassword = async (user: User) => {
  if (!confirm(`Reset password for ${user.first_name} ${user.last_name}? A new password will be generated and displayed.`)) {
    return
  }
  
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/reset-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to reset password')
    }
    
    const result = await response.json()
    
    if (result.data?.newPassword) {
      alert(`Password reset successful!\n\nNew password: ${result.data.newPassword}\n\nPlease copy and share this with the user securely.`)
    } else {
      alert('Password reset successful! The user will receive an email with instructions.')
    }
  } catch (error) {
    console.error('Error resetting password:', error)
    alert('Failed to reset password. Please try again.')
  }
}

const saveUser = async () => {
  try {
    const token = localStorage.getItem('token')
    
    if (showAddModal.value) {
      // Create new user
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: userForm.value.first_name,
          last_name: userForm.value.last_name,
          email: userForm.value.email,
          password: userForm.value.password,
          role: userForm.value.role,
          phone: userForm.value.phone || undefined,
          address: userForm.value.address || undefined,
          student_id: userForm.value.student_id || undefined,
          employee_id: userForm.value.employee_id || undefined,
          grade_level: userForm.value.grade_level || undefined,
          department: userForm.value.department || undefined
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create user')
      }
      
      alert('User created successfully!')
    } else {
      // Update existing user
      const response = await fetch(`${API_BASE_URL}/api/users/${userForm.value.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_name: userForm.value.first_name,
          last_name: userForm.value.last_name,
          email: userForm.value.email,
          role: userForm.value.role,
          phone: userForm.value.phone || undefined,
          address: userForm.value.address || undefined,
          student_id: userForm.value.student_id || undefined,
          employee_id: userForm.value.employee_id || undefined,
          grade_level: userForm.value.grade_level || undefined,
          department: userForm.value.department || undefined
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update user')
      }
      
      alert('User updated successfully!')
    }
    
    closeModal()
    await fetchUsers()
  } catch (error) {
    console.error('Error saving user:', error)
    alert(error instanceof Error ? error.message : 'Failed to save user. Please try again.')
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  userForm.value = {
    id: null,
    first_name: '',
    last_name: '',
    email: '',
    role: 'student',
    phone: '',
    address: '',
    student_id: '',
    employee_id: '',
    grade_level: '',
    department: '',
    password: ''
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchUsers()
  }
}

// Lifecycle
onMounted(() => {
  fetchUsers()
})
</script>