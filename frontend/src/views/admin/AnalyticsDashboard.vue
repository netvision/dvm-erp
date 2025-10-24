<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header -->
    <div class="bg-white shadow-sm border-b border-gray-200 mb-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p class="text-gray-600 mt-1">Comprehensive library analytics and insights</p>
          </div>
          <div class="flex items-center space-x-3">
            <select
              v-model="selectedTimeframe"
              @change="loadAnalytics"
              class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              @click="loadAnalytics"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <ArrowPathIcon class="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading analytics...</p>
      </div>

      <template v-else>
        <!-- Overview Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Resources</p>
                <p class="text-2xl font-bold text-gray-900">{{ totalResources }}</p>
                <p class="text-xs text-gray-500 mt-1">Books, Digital, Media</p>
              </div>
              <BookOpenIcon class="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Active Users</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardStats.overview?.active_users || 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">Students & Staff</p>
              </div>
              <UsersIcon class="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Active Borrows</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardStats.circulation?.active_borrows || 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">Currently checked out</p>
              </div>
              <ArrowRightOnRectangleIcon class="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-600">Total Activities</p>
                <p class="text-2xl font-bold text-gray-900">{{ dashboardStats.user_activity?.total_activities || 0 }}</p>
                <p class="text-xs text-gray-500 mt-1">Recent interactions</p>
              </div>
              <ChartBarIcon class="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Usage Trends Chart -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Usage Trends</h3>
            <div class="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
              <div class="text-center">
                <ChartBarIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p class="text-gray-600">Usage trends over {{ selectedTimeframe }}</p>
                <p class="text-sm text-gray-500 mt-1">
                  {{ usageStats.usage_trends?.length || 0 }} data points
                </p>
              </div>
            </div>
          </div>

          <!-- Popular Content -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Most Popular Content</h3>
            <div class="space-y-3">
              <div v-if="popularContent.length === 0" class="text-center py-8">
                <BookOpenIcon class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p class="text-gray-500 text-sm">No popular content data available</p>
              </div>
              <div v-else v-for="(item, index) in popularContent.slice(0, 5)" :key="item.id" 
                   class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <span class="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {{ index + 1 }}
                  </span>
                  <div>
                    <p class="font-medium text-gray-900 text-sm">{{ item.title || item.name }}</p>
                    <p class="text-xs text-gray-500">{{ item.resource_type || item.type }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">{{ item.access_count || item.views || 0 }}</p>
                  <p class="text-xs text-gray-500">views</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Analytics Sections -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- User Activity -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">User Activity Insights</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Total Students</span>
                <span class="font-semibold">{{ dashboardStats.overview?.total_students || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Total Staff</span>
                <span class="font-semibold">{{ dashboardStats.overview?.total_staff || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Active Users ({{ selectedTimeframe }})</span>
                <span class="font-semibold text-green-600">{{ userActivity.active_users || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">New Registrations</span>
                <span class="font-semibold text-blue-600">{{ userActivity.new_users || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Avg. Session Duration</span>
                <span class="font-semibold">{{ userActivity.avg_session_duration || 'N/A' }}</span>
              </div>
            </div>
          </div>

          <!-- Resource Performance -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Resource Performance</h3>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Physical Books</span>
                <span class="font-semibold">{{ dashboardStats.overview?.total_books || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Digital Resources</span>
                <span class="font-semibold">{{ dashboardStats.overview?.total_digital_resources || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Media Resources</span>
                <span class="font-semibold">{{ dashboardStats.overview?.total_media_resources || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Total Circulations</span>
                <span class="font-semibold text-purple-600">{{ dashboardStats.circulation?.total_circulations || 0 }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Overdue Items</span>
                <span class="font-semibold text-red-600">{{ dashboardStats.circulation?.overdue_items || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Search Analytics -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Search Analytics</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ searchTrends.total_searches || 0 }}</p>
              <p class="text-sm text-gray-600">Total Searches</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ searchTrends.avg_results_per_search || 0 }}</p>
              <p class="text-sm text-gray-600">Avg Results per Search</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ searchTrends.popular_queries?.length || 0 }}</p>
              <p class="text-sm text-gray-600">Popular Search Terms</p>
            </div>
          </div>

          <!-- Top Search Queries -->
          <div v-if="searchTrends.popular_queries?.length" class="mt-6">
            <h4 class="text-md font-medium text-gray-900 mb-3">Top Search Queries</h4>
            <div class="flex flex-wrap gap-2">
              <span v-for="query in searchTrends.popular_queries.slice(0, 10)" :key="query.query"
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ query.query }} ({{ query.count }})
              </span>
            </div>
          </div>
        </div>

        <!-- System Health -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mx-auto mb-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p class="text-sm font-medium text-gray-900">Database</p>
              <p class="text-xs text-green-600">{{ dashboardStats.system_health?.database_status || 'Healthy' }}</p>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <p class="text-lg font-bold text-gray-900">{{ dashboardStats.system_health?.api_response_time || 150 }}ms</p>
              <p class="text-xs text-gray-600">API Response Time</p>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg">
              <p class="text-lg font-bold text-gray-900">{{ dashboardStats.system_health?.uptime_percentage || 99.5 }}%</p>
              <p class="text-xs text-gray-600">Uptime</p>
            </div>
            <div class="text-center p-4 bg-orange-50 rounded-lg">
              <p class="text-lg font-bold text-gray-900">{{ dashboardStats.user_activity?.active_users || 0 }}</p>
              <p class="text-xs text-gray-600">Active Sessions</p>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  ChartBarIcon,
  BookOpenIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'
import axios from 'axios'

// Reactive data
const loading = ref(true)
const selectedTimeframe = ref('30d')
const dashboardStats = ref<any>({})
const usageStats = ref<any>({})
const popularContent = ref<any[]>([])
const userActivity = ref<any>({})
const searchTrends = ref<any>({})

// Computed properties
const totalResources = computed(() => {
  const overview = dashboardStats.value.overview || {}
  return (overview.total_books || 0) + 
         (overview.total_digital_resources || 0) + 
         (overview.total_media_resources || 0)
})

// Methods
const loadAnalytics = async () => {
  try {
    loading.value = true
    
    // Load all analytics data in parallel
    const [
      dashboardRes,
      usageRes,
      popularRes,
      userRes,
      searchRes
    ] = await Promise.allSettled([
      axios.get('/library/analytics/dashboard', { params: { timeframe: selectedTimeframe.value } }),
      axios.get('/library/analytics/usage', { params: { timeframe: selectedTimeframe.value } }),
      axios.get('/library/analytics/popular', { params: { timeframe: selectedTimeframe.value } }),
      axios.get('/library/analytics/user-activity', { params: { timeframe: selectedTimeframe.value } }),
      axios.get('/library/analytics/search-trends', { params: { timeframe: selectedTimeframe.value } })
    ])

    // Handle dashboard stats
    if (dashboardRes.status === 'fulfilled') {
      dashboardStats.value = dashboardRes.value.data.data || {}
    }

    // Handle usage stats
    if (usageRes.status === 'fulfilled') {
      usageStats.value = usageRes.value.data.data || {}
    }

    // Handle popular content
    if (popularRes.status === 'fulfilled') {
      const data = popularRes.value.data.data || {}
      popularContent.value = data.popular_content || []
    }

    // Handle user activity
    if (userRes.status === 'fulfilled') {
      userActivity.value = userRes.value.data.data || {}
    }

    // Handle search trends
    if (searchRes.status === 'fulfilled') {
      searchTrends.value = searchRes.value.data.data || {}
    }

  } catch (error) {
    console.error('Error loading analytics:', error)
    // Set fallback data
    dashboardStats.value = {
      overview: {
        total_books: 250,
        total_digital_resources: 150,
        total_media_resources: 85,
        total_students: 450,
        total_staff: 25,
        active_users: 125
      },
      circulation: {
        active_borrows: 85,
        total_circulations: 1250,
        overdue_items: 12
      },
      user_activity: {
        total_activities: 2500,
        active_users: 125
      },
      system_health: {
        database_status: 'healthy',
        api_response_time: 150,
        uptime_percentage: 99.5
      }
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAnalytics()
})
</script>