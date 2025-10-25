<template>
  <div class="modern-student-dashboard min-h-screen bg-gray-50">
    <!-- Hero Header -->
    <div class="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold mb-2">Welcome back, {{ userName }}!</h1>
            <p class="text-lg text-blue-100 mb-4">
              Discover • Learn • Explore • AI-Enhanced Experience
            </p>
            <div class="flex items-center space-x-6 text-sm">
              <div class="flex items-center space-x-2">
                <BookOpenIcon class="w-5 h-5" />
                <span>{{ userStats.borrowed || 0 }} books borrowed</span>
              </div>
              <div class="flex items-center space-x-2">
                <DocumentIcon class="w-5 h-5" />
                <span>{{ userStats.downloaded || 0 }} downloads</span>
              </div>
              <div class="flex items-center space-x-2">
                <HeartIcon class="w-5 h-5" />
                <span>{{ userStats.bookmarks || 0 }} bookmarks</span>
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">{{ availableResources.toLocaleString() }}</div>
            <div class="text-sm text-blue-200">Resources Available</div>
            <div class="text-xs text-blue-300 mt-1">Across all formats</div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI-Powered Search Bar -->
    <div class="bg-white shadow-lg border-b -mt-6 mx-4 rounded-xl relative z-10">
      <div class="max-w-4xl mx-auto p-6">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon class="h-6 w-6 text-gray-400" />
          </div>
          <input
            v-model="searchQuery"
            @keyup.enter="performSmartSearch"
            type="text"
            class="block w-full pl-12 pr-32 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="Ask AI to find books, articles, videos... Try 'machine learning for beginners'"
          />
          <div class="absolute inset-y-0 right-0 pr-2 flex items-center space-x-2">
            <button @click="useVoiceSearch" class="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <MicrophoneIcon class="w-5 h-5" />
            </button>
            <button 
              @click="performSmartSearch"
              class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Search
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between mt-3">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="suggestion in searchSuggestions"
              :key="suggestion"
              @click="searchQuery = suggestion; performSmartSearch()"
              class="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-full transition-colors"
            >
              {{ suggestion }}
            </button>
          </div>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <CpuChipIcon class="w-4 h-4" />
            <span>AI-Powered Search</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button @click="browseCatalog" class="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group">
            <div class="p-3 bg-blue-100 rounded-lg mb-3 group-hover:bg-blue-200 transition-colors">
              <BookOpenIcon class="w-6 h-6 text-blue-600 mx-auto" />
            </div>
            <div class="text-sm font-medium text-gray-900">Browse Books</div>
          </button>
          
          <button @click="browseDigital" class="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group">
            <div class="p-3 bg-green-100 rounded-lg mb-3 group-hover:bg-green-200 transition-colors">
              <DocumentIcon class="w-6 h-6 text-green-600 mx-auto" />
            </div>
            <div class="text-sm font-medium text-gray-900">Digital Library</div>
          </button>
          
          <button @click="browseMedia" class="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group">
            <div class="p-3 bg-purple-100 rounded-lg mb-3 group-hover:bg-purple-200 transition-colors">
              <PlayIcon class="w-6 h-6 text-purple-600 mx-auto" />
            </div>
            <div class="text-sm font-medium text-gray-900">Media Library</div>
          </button>
          
          <button @click="viewBorrowed" class="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group">
            <div class="p-3 bg-orange-100 rounded-lg mb-3 group-hover:bg-orange-200 transition-colors">
              <ArrowRightOnRectangleIcon class="w-6 h-6 text-orange-600 mx-auto" />
            </div>
            <div class="text-sm font-medium text-gray-900">My Borrowed</div>
          </button>
          
          <button @click="viewBookmarks" class="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group">
            <div class="p-3 bg-pink-100 rounded-lg mb-3 group-hover:bg-pink-200 transition-colors">
              <HeartIcon class="w-6 h-6 text-pink-600 mx-auto" />
            </div>
            <div class="text-sm font-medium text-gray-900">Bookmarks</div>
          </button>
          
          <button @click="openAIAssistant" class="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all group">
            <div class="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg mb-3 group-hover:from-blue-200 group-hover:to-purple-200 transition-all">
              <CpuChipIcon class="w-6 h-6 text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mx-auto" />
            </div>
            <div class="text-sm font-medium text-gray-900">AI Assistant</div>
          </button>
        </div>
      </div>

      <!-- AI Recommendations -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Personalized for You</h2>
          <button @click="refreshRecommendations" class="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
            <SparklesIcon class="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Recommended Books -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Recommended Books</h3>
              <div class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">AI</div>
            </div>
            <div class="space-y-3">
              <div v-for="book in recommendedBooks" :key="book.id" 
                   class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
                <div class="w-12 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  {{ book.title.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900 truncate">{{ book.title }}</h4>
                  <p class="text-sm text-gray-600 truncate">{{ book.author }}</p>
                  <div class="flex items-center mt-1">
                    <div class="flex items-center">
                      <StarIcon v-for="i in 5" :key="i" 
                               :class="i <= book.rating ? 'text-yellow-400' : 'text-gray-300'" 
                               class="w-3 h-3" />
                    </div>
                    <span class="text-xs text-gray-500 ml-2">{{ book.rating }}/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Trending Digital Content -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Trending Digital</h3>
              <div class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">HOT</div>
            </div>
            <div class="space-y-3">
              <div v-for="digital in trendingDigital" :key="digital.id"
                   class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
                <div class="p-2 bg-green-100 rounded-lg">
                  <DocumentIcon class="w-5 h-5 text-green-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900 truncate">{{ digital.title }}</h4>
                  <p class="text-sm text-gray-600">{{ digital.format.toUpperCase() }} • {{ digital.pages }} pages</p>
                  <div class="flex items-center justify-between mt-1">
                    <span class="text-xs text-green-600">{{ digital.downloads }} downloads</span>
                    <button class="text-xs text-blue-600 hover:text-blue-800">Download</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Popular Media -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Popular Media</h3>
              <div class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">WATCH</div>
            </div>
            <div class="space-y-3">
              <div v-for="media in popularMedia" :key="media.id"
                   class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border border-gray-100">
                <div class="p-2 bg-purple-100 rounded-lg">
                  <PlayIcon class="w-5 h-5 text-purple-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900 truncate">{{ media.title }}</h4>
                  <p class="text-sm text-gray-600">{{ media.type }} • {{ formatDuration(media.duration) }}</p>
                  <div class="flex items-center justify-between mt-1">
                    <span class="text-xs text-purple-600">{{ media.views }} views</span>
                    <button class="text-xs text-blue-600 hover:text-blue-800">▶ Play</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Current Activity & Status -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- My Current Books -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Currently Borrowed</h3>
            <span class="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
              {{ currentBooks.length }} active
            </span>
          </div>
          <div class="space-y-4">
            <div v-for="book in currentBooks" :key="book.id"
                 class="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg">
              <div class="w-12 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center text-white font-bold">
                {{ book.title.charAt(0) }}
              </div>
              <div class="flex-1">
                <h4 class="font-medium text-gray-900">{{ book.title }}</h4>
                <p class="text-sm text-gray-600">{{ book.author }}</p>
                <div class="flex items-center justify-between mt-2">
                  <span class="text-xs" :class="getDueDateClass(book.dueDate)">
                    Due: {{ formatDate(book.dueDate) }}
                  </span>
                  <button class="text-xs text-blue-600 hover:text-blue-800">Renew</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reading Progress & Stats -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-6">Your Reading Journey</h3>
          
          <!-- Reading Stats -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <div class="text-2xl font-bold text-blue-600">{{ userStats.totalRead || 0 }}</div>
              <div class="text-sm text-blue-600">Books Read</div>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <div class="text-2xl font-bold text-green-600">{{ userStats.readingStreak || 0 }}</div>
              <div class="text-sm text-green-600">Day Streak</div>
            </div>
          </div>

          <!-- Current Reading Goals -->
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600">Monthly Goal</span>
                <span class="font-medium">{{ userStats.monthlyProgress || 0 }}/{{ userStats.monthlyGoal || 5 }} books</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full" 
                     :style="{ width: `${getProgressPercentage()}%` }"></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-gray-600">Favorite Genre</span>
                <span class="font-medium text-purple-600">{{ userStats.favoriteGenre || 'Not set' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Collections & Discoveries -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Featured Collections -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Featured Collections</h3>
          <div class="space-y-3">
            <div v-for="collection in featuredCollections" :key="collection.id"
                 class="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
              <h4 class="font-medium text-gray-900">{{ collection.name }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ collection.description }}</p>
              <div class="flex justify-between items-center mt-2">
                <span class="text-xs text-gray-500">{{ collection.items }} items</span>
                <span class="text-xs text-blue-600">Explore →</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div class="space-y-3">
            <div v-for="activity in recentActivity" :key="activity.id"
                 class="flex items-start space-x-3">
              <div class="p-2 rounded-lg" :class="getActivityStyle(activity.type)">
                <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
              </div>
              <div class="flex-1">
                <p class="text-sm text-gray-900">{{ activity.description }}</p>
                <p class="text-xs text-gray-500">{{ formatTimeAgo(activity.timestamp) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Links & Tools -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Learning Tools</h3>
          <div class="space-y-3">
            <button @click="openCitationGenerator" class="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
              <div class="flex items-center space-x-3">
                <DocumentTextIcon class="w-5 h-5 text-blue-600" />
                <span class="font-medium">Citation Generator</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">Generate citations for your research</p>
            </button>
            
            <button @click="openNotesTaker" class="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
              <div class="flex items-center space-x-3">
                <PencilIcon class="w-5 h-5 text-green-600" />
                <span class="font-medium">Smart Notes</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">AI-powered note taking</p>
            </button>
            
            <button @click="openTranslator" class="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50">
              <div class="flex items-center space-x-3">
                <LanguageIcon class="w-5 h-5 text-purple-600" />
                <span class="font-medium">Translator</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">Translate content instantly</p>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Assistant Modal -->
    <div v-if="showAIAssistant" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-96 m-4">
        <div class="flex items-center justify-between p-6 border-b">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <CpuChipIcon class="w-6 h-6 text-white" />
            </div>
            <h3 class="text-lg font-semibold">AI Learning Assistant</h3>
          </div>
          <button @click="showAIAssistant = false" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="p-6 space-y-4 max-h-64 overflow-y-auto">
          <div class="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <strong>AI:</strong> Hi {{ userName }}! I'm here to help you discover amazing resources, get study recommendations, and answer any questions about the library. What would you like to explore today?
          </div>
        </div>
        <div class="p-6 border-t">
          <div class="flex space-x-3">
            <input 
              v-model="aiMessage" 
              @keyup.enter="sendAIMessage"
              class="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ask me about books, research help, study tips..."
            />
            <button 
              @click="sendAIMessage"
              class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
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
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

// Import Heroicons
import {
  BookOpenIcon,
  DocumentIcon,
  PlayIcon,
  CpuChipIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  StarIcon,
  DocumentTextIcon,
  PencilIcon,
  LanguageIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const searchQuery = ref('')
const showAIAssistant = ref(false)
const aiMessage = ref('')

const searchSuggestions = ref([
  'Python programming',
  'Machine learning basics',
  'Digital marketing',
  'Academic writing',
  'Data science'
])

const userStats = ref({
  borrowed: 3,
  downloaded: 15,
  bookmarks: 8,
  totalRead: 24,
  readingStreak: 12,
  monthlyProgress: 3,
  monthlyGoal: 5,
  favoriteGenre: 'Computer Science'
})

const recommendedBooks = ref([
  { id: 1, title: 'Python Crash Course', author: 'Eric Matthes', rating: 4.8 },
  { id: 2, title: 'Clean Code', author: 'Robert Martin', rating: 4.6 },
  { id: 3, title: 'Design Patterns', author: 'Gang of Four', rating: 4.5 }
])

const trendingDigital = ref([
  { id: 1, title: 'Machine Learning Handbook', format: 'pdf', pages: 350, downloads: 1250 },
  { id: 2, title: 'Web Development Guide', format: 'epub', pages: 280, downloads: 980 },
  { id: 3, title: 'Data Science Essentials', format: 'pdf', pages: 420, downloads: 750 }
])

const popularMedia = ref([
  { id: 1, title: 'Introduction to AI', type: 'Lecture', duration: 3600, views: 1500 },
  { id: 2, title: 'History of Computing', type: 'Documentary', duration: 2700, views: 890 },
  { id: 3, title: 'Programming Basics', type: 'Tutorial', duration: 1800, views: 2100 }
])

const currentBooks = ref([
  { id: 1, title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
  { id: 2, title: 'React Native in Action', author: 'Nader Dabit', dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000) },
  { id: 3, title: 'Database Design for Mere Mortals', author: 'Michael Hernandez', dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
])

const featuredCollections = ref([
  { id: 1, name: 'Programming Fundamentals', description: 'Essential books for new programmers', items: 25 },
  { id: 2, name: 'Academic Research Tools', description: 'Resources for academic success', items: 18 },
  { id: 3, name: 'Digital Arts & Design', description: 'Creative digital resources', items: 32 }
])

const recentActivity = ref([
  { id: 1, type: 'borrow', description: 'Borrowed "Clean Code"', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 2, type: 'download', description: 'Downloaded "Python Guide PDF"', timestamp: new Date(Date.now() - 1000 * 60 * 120) },
  { id: 3, type: 'bookmark', description: 'Bookmarked "Web Dev Collection"', timestamp: new Date(Date.now() - 1000 * 60 * 180) }
])

// Computed properties
const userName = computed(() => authStore.user?.name?.split(' ')[0] || 'Student')
const availableResources = computed(() => 2850) // Simulated total

// Methods
const performSmartSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  try {
    const response = await axios.post('/library/ai/search', {
      query: searchQuery.value,
      type: 'mixed',
      user_preferences: true
    })
    console.log('Search results:', response.data)
    // Navigate to search results page
    router.push(`/student/search?q=${encodeURIComponent(searchQuery.value)}`)
  } catch (error) {
    console.error('Search error:', error)
  }
}

const useVoiceSearch = () => {
  console.log('Voice search activated...')
  // Implement voice search functionality
}

const refreshRecommendations = async () => {
  try {
    const response = await axios.post('/library/ai/recommend', {
      user_id: authStore.user?.id,
      type: 'mixed',
      algorithm: 'collaborative'
    })
    console.log('Refreshed recommendations:', response.data)
  } catch (error) {
    console.error('Recommendation error:', error)
  }
}

// Navigation methods
const browseCatalog = () => router.push('/student/books')
const browseDigital = () => router.push('/student/digital-library')
const browseMedia = () => router.push('/student/media-library')
const viewBorrowed = () => router.push('/student/borrowed')
const viewBookmarks = () => router.push('/student/bookmarks')
const openAIAssistant = () => { showAIAssistant.value = true }

// Tool methods
const openCitationGenerator = () => console.log('Opening citation generator...')
const openNotesTaker = () => console.log('Opening smart notes...')
const openTranslator = () => console.log('Opening translator...')

const sendAIMessage = async () => {
  if (!aiMessage.value.trim()) return
  
  try {
    await axios.post('/library/ai/chat', {
      message: aiMessage.value,
      context: 'student',
      user_id: authStore.user?.id
    })
    aiMessage.value = ''
  } catch (error) {
    console.error('AI chat error:', error)
  }
}

// Helper functions
const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

const getDueDateClass = (dueDate: Date): string => {
  const now = new Date()
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-red-600 font-medium'
  if (diffDays <= 3) return 'text-orange-600 font-medium'
  return 'text-gray-600'
}

const getProgressPercentage = (): number => {
  return Math.min((userStats.value.monthlyProgress / userStats.value.monthlyGoal) * 100, 100)
}

const getActivityIcon = (type: string) => {
  const icons: Record<string, any> = {
    borrow: BookOpenIcon,
    download: DocumentIcon,
    bookmark: HeartIcon,
    return: ArrowRightOnRectangleIcon
  }
  return icons[type] || BookOpenIcon
}

const getActivityStyle = (type: string): string => {
  const styles: Record<string, string> = {
    borrow: 'bg-blue-100 text-blue-600',
    download: 'bg-green-100 text-green-600',
    bookmark: 'bg-pink-100 text-pink-600',
    return: 'bg-purple-100 text-purple-600'
  }
  return styles[type] || 'bg-gray-100 text-gray-600'
}

onMounted(() => {
  // Load user-specific data
  console.log('Loading personalized dashboard for:', userName.value)
})
</script>

<style scoped>
.modern-student-dashboard {
  font-family: 'Inter', sans-serif;
}

/* Custom gradient text for AI elements */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
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

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>