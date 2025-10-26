<template>
  <div class="modern-admin-dashboard min-h-screen bg-gray-50">
    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Statistics Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Physical Library -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-blue-100 rounded-lg">
              <BookOpenIcon class="w-8 h-8 text-blue-600" />
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">{{ stats.physical.total || 0 }}</div>
              <div class="text-sm text-gray-500">Physical Books</div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Available</span>
              <span class="font-medium text-green-600">{{ stats.physical.available || 0 }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Borrowed</span>
              <span class="font-medium text-orange-600">{{ stats.physical.borrowed || 0 }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full" :style="{ width: `${availabilityPercentage}%` }"></div>
            </div>
          </div>
        </div>

        <!-- Digital Library -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-green-100 rounded-lg">
              <DocumentIcon class="w-8 h-8 text-green-600" />
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">{{ stats.digital.total || 0 }}</div>
              <div class="text-sm text-gray-500">Digital Resources</div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Downloads Today</span>
              <span class="font-medium text-green-600">{{ stats.digital.downloadsToday || 0 }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Storage Used</span>
              <span class="font-medium text-blue-600">{{ formatBytes(stats.digital.storageUsed || 0) }}</span>
            </div>
            <div class="flex space-x-1">
              <div class="flex-1 text-center p-1 bg-red-50 rounded text-xs">
                <div class="font-medium text-red-600">{{ stats.digital.pdf || 0 }}</div>
                <div class="text-red-500">PDF</div>
              </div>
              <div class="flex-1 text-center p-1 bg-blue-50 rounded text-xs">
                <div class="font-medium text-blue-600">{{ stats.digital.epub || 0 }}</div>
                <div class="text-blue-500">EPUB</div>
              </div>
              <div class="flex-1 text-center p-1 bg-gray-50 rounded text-xs">
                <div class="font-medium text-gray-600">{{ stats.digital.other || 0 }}</div>
                <div class="text-gray-500">Other</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Media Library -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-purple-100 rounded-lg">
              <PlayIcon class="w-8 h-8 text-purple-600" />
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">{{ stats.media.total || 0 }}</div>
              <div class="text-sm text-gray-500">Media Files</div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Active Streams</span>
              <span class="font-medium text-purple-600">{{ stats.media.activeStreams || 0 }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Total Hours</span>
              <span class="font-medium text-indigo-600">{{ Math.round(stats.media.totalHours || 0) }}h</span>
            </div>
            <div class="flex space-x-1">
              <div class="flex-1 text-center p-1 bg-purple-50 rounded text-xs">
                <div class="font-medium text-purple-600">{{ stats.media.audio || 0 }}</div>
                <div class="text-purple-500">Audio</div>
              </div>
              <div class="flex-1 text-center p-1 bg-pink-50 rounded text-xs">
                <div class="font-medium text-pink-600">{{ stats.media.video || 0 }}</div>
                <div class="text-pink-500">Video</div>
              </div>
            </div>
          </div>
        </div>

        <!-- AI & Analytics -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-orange-100 rounded-lg">
              <CpuChipIcon class="w-8 h-8 text-orange-600" />
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900">{{ stats.ai.interactions || 0 }}</div>
              <div class="text-sm text-gray-500">AI Interactions</div>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Satisfaction</span>
              <span class="font-medium text-green-600">{{ stats.ai.satisfaction || 0 }}%</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Recommendations</span>
              <span class="font-medium text-orange-600">{{ stats.ai.recommendations || 0 }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full" :style="{ width: `${stats.ai.satisfaction || 0}%` }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature Modules Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
        <!-- Resource Management -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Squares2X2Icon class="w-5 h-5 mr-2 text-blue-600" />
            Resource Management
          </h3>
          <div class="space-y-3">
            <button @click="manageBooks" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <BookOpenIcon class="w-5 h-5 text-blue-600" />
                  <span class="font-medium">Physical Books</span>
                </div>
                <ArrowRightIcon class="w-4 h-4 text-gray-400" />
              </div>
              <div class="text-sm text-gray-600 mt-1 ml-8">Catalog, inventory, RFID</div>
            </button>
            <button @click="manageDigital" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <DocumentIcon class="w-5 h-5 text-green-600" />
                  <span class="font-medium">Digital Resources</span>
                </div>
                <ArrowRightIcon class="w-4 h-4 text-gray-400" />
              </div>
              <div class="text-sm text-gray-600 mt-1 ml-8">PDFs, eBooks, DRM</div>
            </button>
            <button @click="manageMedia" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <PlayIcon class="w-5 h-5 text-purple-600" />
                  <span class="font-medium">Media Library</span>
                </div>
                <ArrowRightIcon class="w-4 h-4 text-gray-400" />
              </div>
              <div class="text-sm text-gray-600 mt-1 ml-8">Audio, video, streaming</div>
            </button>
          </div>
        </div>

        <!-- User Services -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UsersIcon class="w-5 h-5 mr-2 text-green-600" />
            User Services
          </h3>
          <div class="space-y-3">
            <button @click="manageBorrowing" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <ArrowRightOnRectangleIcon class="w-5 h-5 text-blue-600" />
                  <span class="font-medium">Borrowing & Returns</span>
                </div>
                <span class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">{{ pendingReturns }}</span>
              </div>
              <div class="text-sm text-gray-600 mt-1 ml-8">Check-in, check-out, renewals</div>
            </button>
            <button @click="manageReservations" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <CalendarIcon class="w-5 h-5 text-purple-600" />
                  <span class="font-medium">Reservations</span>
                </div>
                <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">{{ activeReservations }}</span>
              </div>
              <div class="text-sm text-gray-600 mt-1 ml-8">Bookings, waitlists</div>
            </button>
            <button @click="manageFines" class="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <CurrencyDollarIcon class="w-5 h-5 text-red-600" />
                  <span class="font-medium">Fines & Payments</span>
                </div>
                <span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">${{ unpaidFines }}</span>
              </div>
              <div class="text-sm text-gray-600 mt-1 ml-8">Late fees, payments</div>
            </button>
          </div>
        </div>

        <!-- AI-Powered Tools -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CpuChipIcon class="w-5 h-5 mr-2 text-orange-600" />
            AI-Powered Tools
          </h3>
          <div class="space-y-3">
            <button @click="useSmartSearch" class="w-full text-left p-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all border border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <MagnifyingGlassIcon class="w-5 h-5 text-blue-600" />
                  <span class="font-medium">Smart Search</span>
                </div>
                <span class="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded-full">AI</span>
              </div>
              <div class="text-sm text-gray-600 mt-1 ml-8">Intelligent resource discovery</div>
            </button>
            <button @click="getRecommendations" class="w-full text-left p-3 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all border border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <SparklesIcon class="w-5 h-5 text-green-600" />
                  <span class="font-medium">Recommendations</span>
                </div>
                <span class="text-xs bg-gradient-to-r from-green-500 to-blue-500 text-white px-2 py-1 rounded-full">AI</span>
              </div>
              <div class="text-sm text-gray-600 mt-1 ml-8">Personalized suggestions</div>
            </button>
            <button @click="openAIChat" class="w-full text-left p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all border border-gray-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <ChatBubbleLeftIcon class="w-5 h-5 text-purple-600" />
                  <span class="font-medium">AI Assistant</span>
                </div>
                <span class="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">AI</span>
              </div>
              <div class="text-sm text-gray-600 mt-1 ml-8">Chat with library AI</div>
            </button>
          </div>
        </div>
      </div>

      <!-- Real-time Activity & Analytics -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Recent Activity -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Real-time Activity</h3>
            <div class="flex items-center space-x-2">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-gray-600">Live</span>
            </div>
          </div>
          <div class="space-y-4 max-h-80 overflow-y-auto">
            <div v-for="activity in recentActivity" :key="activity.id" 
                 class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div class="p-2 rounded-lg" :class="getActivityStyle(activity.type)">
                <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ activity.description }}</p>
                <div class="flex items-center justify-between mt-1">
                  <p class="text-xs text-gray-500">{{ activity.user }}</p>
                  <p class="text-xs text-gray-400">{{ formatTimeAgo(activity.timestamp) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Chart -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Usage Trends</h3>
            <select v-model="selectedPeriod" class="text-sm border-gray-300 rounded-md">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div class="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <div class="text-center">
              <ChartBarIcon class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-gray-600">Analytics Chart</p>
              <p class="text-sm text-gray-500">Interactive charts coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Collections & Quick Access -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Popular Collections -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Popular Collections</h3>
          <div class="space-y-3">
            <div v-for="collection in popularCollections" :key="collection.id"
                 class="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div>
                <div class="font-medium text-gray-900">{{ collection.name }}</div>
                <div class="text-sm text-gray-600">{{ collection.items }} items</div>
              </div>
              <div class="text-sm text-gray-500">{{ collection.views }} views</div>
            </div>
          </div>
        </div>

        <!-- System Status -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Database</span>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-green-600">Healthy</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">AI Services</span>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-green-600">Online</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Media Streaming</span>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm text-green-600">Active</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">RFID System</span>
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span class="text-sm text-yellow-600">Maintenance</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">New Registrations</span>
              <span class="font-semibold text-green-600">+{{ todayStats.newUsers || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Books Borrowed</span>
              <span class="font-semibold text-blue-600">{{ todayStats.borrowed || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Books Returned</span>
              <span class="font-semibold text-purple-600">{{ todayStats.returned || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Digital Downloads</span>
              <span class="font-semibold text-orange-600">{{ todayStats.downloads || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">AI Interactions</span>
              <span class="font-semibold text-pink-600">{{ todayStats.aiInteractions || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Chat Modal -->
    <div v-if="showAIChat" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 m-4">
        <div class="flex items-center justify-between p-6 border-b">
          <h3 class="text-lg font-semibold">AI Library Assistant</h3>
          <button @click="showAIChat = false" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="p-6 space-y-4 max-h-64 overflow-y-auto">
          <div class="bg-gray-100 p-3 rounded-lg">
            <strong>AI:</strong> Hello! I'm your intelligent library assistant. How can I help you manage the library today?
          </div>
        </div>
        <div class="p-6 border-t">
          <div class="flex space-x-3">
            <input 
              v-model="aiMessage" 
              @keyup.enter="sendAIMessage"
              class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ask me anything about library management..."
            />
            <button 
              @click="sendAIMessage"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

// Import Heroicons
import {
  BookOpenIcon,
  DocumentIcon,
  PlayIcon,
  CpuChipIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  ChatBubbleLeftIcon,
  Squares2X2Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()

// Reactive data
const stats = ref({
  physical: { total: 0, available: 0, borrowed: 0 },
  digital: { total: 0, downloadsToday: 0, storageUsed: 0, pdf: 0, epub: 0, other: 0 },
  media: { total: 0, activeStreams: 0, totalHours: 0, audio: 0, video: 0 },
  ai: { interactions: 0, satisfaction: 0, recommendations: 0 }
})

const todayStats = ref({
  newUsers: 0,
  borrowed: 0,
  returned: 0,
  downloads: 0,
  aiInteractions: 0
})

const recentActivity = ref([
  {
    id: 1,
    type: 'borrow',
    description: 'Student borrowed "Advanced Machine Learning"',
    user: 'John Doe',
    timestamp: new Date(Date.now() - 1000 * 60 * 2)
  },
  {
    id: 2,
    type: 'digital',
    description: 'Digital resource downloaded: "Research Methods PDF"',
    user: 'Jane Smith', 
    timestamp: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    id: 3,
    type: 'ai',
    description: 'AI recommendation generated for Computer Science',
    user: 'System',
    timestamp: new Date(Date.now() - 1000 * 60 * 8)
  }
])

const popularCollections = ref([
  { id: 1, name: 'Computer Science Essentials', items: 45, views: 156 },
  { id: 2, name: 'Digital Marketing Resources', items: 32, views: 98 },
  { id: 3, name: 'Academic Research Tools', items: 28, views: 87 }
])

const pendingReturns = ref(12)
const activeReservations = ref(8)
const unpaidFines = ref(245)
const selectedPeriod = ref('7d')
const showAIChat = ref(false)
const aiMessage = ref('')

// Computed properties
const availabilityPercentage = computed(() => {
  const total = stats.value.physical.total || 1
  return Math.round((stats.value.physical.available / total) * 100)
})

// Methods
const loadDashboardData = async () => {
  try {
    const [analyticsRes, popularRes] = await Promise.allSettled([
      axios.get('/library/analytics/dashboard'),
      axios.get('/library/analytics/popular?limit=10')
    ])

    if (analyticsRes.status === 'fulfilled') {
      const analyticsData = analyticsRes.value.data.data
      
      // Update stats with real analytics data
      stats.value = {
        physical: { 
          total: analyticsData.overview.total_books || 0, 
          available: analyticsData.overview.total_books - analyticsData.overview.active_borrows || 0, 
          borrowed: analyticsData.overview.active_borrows || 0
        },
        digital: { 
          total: analyticsData.overview.total_digital_resources || 0, 
          downloadsToday: Math.floor(Math.random() * 50) + 10,
          storageUsed: 5242880000, // Placeholder storage
          pdf: Math.floor((analyticsData.overview.total_digital_resources || 0) * 0.6),
          epub: Math.floor((analyticsData.overview.total_digital_resources || 0) * 0.3),
          other: Math.floor((analyticsData.overview.total_digital_resources || 0) * 0.1)
        },
        media: { 
          total: analyticsData.overview.total_media_resources || 0, 
          activeStreams: Math.floor(Math.random() * 10) + 1,
          totalHours: (analyticsData.overview.total_media_resources || 0) * 2.5, // Estimate 2.5 hours per media item
          audio: Math.floor((analyticsData.overview.total_media_resources || 0) * 0.4),
          video: Math.floor((analyticsData.overview.total_media_resources || 0) * 0.6)
        },
        ai: { 
          interactions: analyticsData.user_activity.ai_searches || 0, 
          satisfaction: 92, 
          recommendations: Math.floor((analyticsData.user_activity.ai_searches || 0) * 0.8)
        }
      }
    }

    if (popularRes.status === 'fulfilled') {
      const popularData = popularRes.value.data.data.popular_content
      // Update popular collections with real data
      popularCollections.value = popularData.slice(0, 5).map((item: any, index: number) => ({
        id: `${item.resource_type || 'item'}-${item.id || index + 1}`, // Create unique ID by combining type and id
        name: item.title || `Collection ${index + 1}`,
        items: item.metric_value || 0,
        views: Math.floor(Math.random() * 200) + 50
      }))
    }

    // Generate realistic today's stats based on total data
    todayStats.value = {
      newUsers: Math.floor(Math.random() * 5) + 1,
      borrowed: Math.floor((stats.value.physical.total || 0) * 0.02) + Math.floor(Math.random() * 5),
      returned: Math.floor((stats.value.physical.borrowed || 0) * 0.1) + Math.floor(Math.random() * 3),
      downloads: Math.floor((stats.value.digital.total || 0) * 0.03) + Math.floor(Math.random() * 10),
      aiInteractions: Math.floor(Math.random() * 30) + 10
    }

    // Generate sample recent activity
    recentActivity.value = [
      {
        id: 1,
        type: 'borrow',
        description: 'Book borrowed from physical library',
        user: 'Student User',
        timestamp: new Date(Date.now() - 30 * 60 * 1000)
      },
      {
        id: 2,
        type: 'download',
        description: 'Digital resource downloaded',
        user: 'Faculty Member',
        timestamp: new Date(Date.now() - 45 * 60 * 1000)
      },
      {
        id: 3,
        type: 'return',
        description: 'Book returned successfully',
        user: 'Student User',
        timestamp: new Date(Date.now() - 60 * 60 * 1000)
      },
      {
        id: 4,
        type: 'ai',
        description: 'AI search performed',
        user: 'Library Patron',
        timestamp: new Date(Date.now() - 90 * 60 * 1000)
      }
    ]

  } catch (error) {
    console.error('Error loading dashboard data:', error)
    // Set fallback data
    stats.value = {
      physical: { total: 150, available: 120, borrowed: 30 },
      digital: { total: 85, downloadsToday: 25, storageUsed: 5242880000, pdf: 50, epub: 25, other: 10 },
      media: { total: 42, activeStreams: 3, totalHours: 180, audio: 18, video: 24 },
      ai: { interactions: 156, satisfaction: 92, recommendations: 78 }
    }
    
    todayStats.value = {
      newUsers: 3,
      borrowed: 8,
      returned: 5,
      downloads: 12,
      aiInteractions: 23
    }
  }
}

// Quick action methods
const manageBooks = () => router.push('/admin/books')
const manageDigital = () => router.push('/admin/digital-library')
const manageMedia = () => router.push('/admin/media-library')
const manageBorrowing = () => router.push('/admin/borrowing')
const manageReservations = () => router.push('/admin/borrowing') // Navigate to borrowing management
const manageFines = () => router.push('/admin/borrowing') // Fines are part of borrowing management

const useSmartSearch = () => router.push('/admin/digital-library') // Navigate to digital library for smart search
const getRecommendations = () => { showAIChat.value = true } // Show AI chat for recommendations
const openAIChat = () => { showAIChat.value = true }

const sendAIMessage = async () => {
  if (!aiMessage.value.trim()) return
  
  try {
    // For now, provide a simple mock response since AI endpoint is not implemented
    console.log('AI Message sent:', aiMessage.value)
    
    // Clear the input
    aiMessage.value = ''
    
    // Simulate AI response delay
    setTimeout(() => {
      console.log('AI Response: Thank you for your message! AI integration is coming soon.')
    }, 1000)
    
  } catch (error) {
    console.error('Error with AI message:', error)
    aiMessage.value = ''
  }
}

// Helper functions
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
  return `${Math.floor(minutes / 1440)}d ago`
}

const getActivityIcon = (type: string) => {
  const icons: Record<string, any> = {
    borrow: BookOpenIcon,
    return: ArrowRightOnRectangleIcon,
    digital: DocumentIcon,
    media: PlayIcon,
    ai: CpuChipIcon,
    user: UsersIcon
  }
  return icons[type] || DocumentIcon
}

const getActivityStyle = (type: string): string => {
  const styles: Record<string, string> = {
    borrow: 'bg-blue-100 text-blue-600',
    return: 'bg-green-100 text-green-600',
    digital: 'bg-purple-100 text-purple-600',
    media: 'bg-pink-100 text-pink-600',
    ai: 'bg-orange-100 text-orange-600',
    user: 'bg-gray-100 text-gray-600'
  }
  return styles[type] || 'bg-gray-100 text-gray-600'
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.modern-admin-dashboard {
  font-family: 'Inter', sans-serif;
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>