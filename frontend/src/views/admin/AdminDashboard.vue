<template>
  <div class="p-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">Manage your school library system</p>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <BookOpenIcon class="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Books</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalBooks }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <UsersIcon class="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.totalUsers }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <ClockIcon class="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Borrowed Books</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.borrowedBooks }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
              <ExclamationTriangleIcon class="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Books</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats.overdueBooks }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div class="space-y-3">
            <router-link 
              to="/admin/books/new" 
              class="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <PlusIcon class="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
              <span class="text-blue-800 dark:text-blue-300 font-medium">Add New Book</span>
            </router-link>
            
            <router-link 
              to="/admin/users/new" 
              class="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <UserPlusIcon class="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
              <span class="text-green-800 dark:text-green-300 font-medium">Add New User</span>
            </router-link>
            
            <router-link 
              to="/admin/borrowing" 
              class="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
            >
              <DocumentTextIcon class="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3" />
              <span class="text-yellow-800 dark:text-yellow-300 font-medium">Manage Borrowing</span>
            </router-link>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div class="space-y-3">
            <div v-for="activity in recentActivities" :key="activity.id" class="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="flex-shrink-0">
                <div :class="[
                  'p-2 rounded-full',
                  activity.type === 'borrow' ? 'bg-blue-100 dark:bg-blue-900/30' : 
                  activity.type === 'return' ? 'bg-green-100 dark:bg-green-900/30' : 
                  'bg-gray-100 dark:bg-gray-700'
                ]">
                  <ArrowDownIcon v-if="activity.type === 'borrow'" class="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <ArrowUpIcon v-else-if="activity.type === 'return'" class="h-4 w-4 text-green-600 dark:text-green-400" />
                  <UserIcon v-else class="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
              </div>
              <div class="ml-3 flex-1">
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ activity.description }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatTime(activity.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Popular Books</h2>
          <div class="space-y-3">
            <div v-for="book in popularBooks" :key="book.id" class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900 dark:text-white">{{ book.title }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ book.author }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-blue-600 dark:text-blue-400">{{ book.borrow_count }} borrows</p>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Overdue Items</h2>
          <div class="space-y-3">
            <div v-for="overdue in overdueItems" :key="overdue.id" class="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-gray-900 dark:text-white">{{ overdue.book_title }}</p>
                  <p class="text-sm text-gray-600 dark:text-gray-400">Borrowed by: {{ overdue.user_name }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-red-600 dark:text-red-400">
                    {{ calculateOverdueDays(overdue.due_date) }} days overdue
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { 
  BookOpenIcon, 
  UsersIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  PlusIcon,
  UserPlusIcon,
  DocumentTextIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  UserIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

// Types
interface DashboardStats {
  totalBooks: number
  totalUsers: number
  borrowedBooks: number
  overdueBooks: number
}

interface Activity {
  id: number
  type: 'borrow' | 'return' | 'user'
  description: string
  timestamp: string
}

interface PopularBook {
  id: number
  title: string
  author: string
  borrow_count: number
}

interface OverdueItem {
  id: number
  book_title: string
  user_name: string
  due_date: string
}

// Reactive data
const loading = ref(true)
const stats = ref<DashboardStats>({
  totalBooks: 0,
  totalUsers: 0,
  borrowedBooks: 0,
  overdueBooks: 0
})
const recentActivities = ref<Activity[]>([])
const popularBooks = ref<PopularBook[]>([])
const overdueItems = ref<OverdueItem[]>([])

// Methods
const fetchDashboardData = async () => {
  try {
    loading.value = true
    
    // Fetch real analytics data
    const [dashboardResponse, popularResponse] = await Promise.all([
      axios.get('/library/analytics/dashboard'),
      axios.get('/library/analytics/popular?limit=5')
    ])
    
    const dashboardData = dashboardResponse.data.data
    const popularData = popularResponse.data.data.popular_content
    
    // Update stats with real data
    stats.value = {
      totalBooks: dashboardData.overview.total_books,
      totalUsers: dashboardData.overview.total_students + dashboardData.overview.total_staff,
      borrowedBooks: dashboardData.overview.active_borrows,
      overdueBooks: dashboardData.circulation.overdue_items
    }
    
    // Update popular books with real data
    popularBooks.value = popularData.slice(0, 5).map((item: any) => ({
      id: item.id,
      title: item.title || 'Unknown Title',
      author: item.author || 'Unknown Author',
      borrow_count: item.metric_value || 0
    }))
    
    // Sample recent activities (can be made dynamic later)
    recentActivities.value = [
      {
        id: 1,
        type: 'borrow',
        description: 'Student borrowed a book from digital library',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        type: 'return',
        description: 'Book returned successfully',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        type: 'user',
        description: 'New user registered in the system',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ]
    
    // Sample overdue items (can be made dynamic later)
    overdueItems.value = [
      {
        id: 1,
        book_title: 'Library Resource #1',
        user_name: 'Student User',
        due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        book_title: 'Library Resource #2',
        user_name: 'Faculty User',
        due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    
    // Fallback to sample data if API fails
    stats.value = {
      totalBooks: 0,
      totalUsers: 0,
      borrowedBooks: 0,
      overdueBooks: 0
    }
    
    popularBooks.value = []
    recentActivities.value = []
    overdueItems.value = []
  } finally {
    loading.value = false
  }
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffHours < 1) {
    return 'Just now'
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else {
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }
}

const calculateOverdueDays = (dueDate: string) => {
  const due = new Date(dueDate)
  const now = new Date()
  const diffMs = now.getTime() - due.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

// Lifecycle
onMounted(() => {
  fetchDashboardData()
})
</script>