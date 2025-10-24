<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Modern Gradient Header -->
    <div class="bg-gradient-to-r from-green-600 to-teal-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold">Media Library</h1>
            <p class="text-green-100 mt-2">Manage audio, video, and multimedia resources</p>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="showAddModal = true"
              class="bg-white text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium flex items-center space-x-2"
            >
              <PlusIcon class="w-5 h-5" />
              <span>Add Media Resource</span>
            </button>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm">Total Media Items</p>
                <p class="text-2xl font-bold text-white">{{ totalMediaResources }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <PlayCircleIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm">Video Content</p>
                <p class="text-2xl font-bold text-white">{{ videoCount }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <VideoCameraIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm">Audio Content</p>
                <p class="text-2xl font-bold text-white">{{ audioCount }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <SpeakerWaveIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm">Interactive Media</p>
                <p class="text-2xl font-bold text-white">{{ interactiveCount }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <CursorArrowRaysIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Bar -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="showAddModal = true"
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon class="w-4 h-4" />
              <span>Add Media</span>
            </button>
            <button
              @click="refreshResources"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <ArrowPathIcon class="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
          <div class="text-sm text-gray-600">
            Showing {{ filteredResources.length }} of {{ mediaResources.length }} resources
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search media resources..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <select
            v-model="selectedType"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Types</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="interactive">Interactive Media</option>
            <option value="presentation">Presentation</option>
          </select>

          <select
            v-model="selectedCategory"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Categories</option>
            <option value="Educational">Educational</option>
            <option value="Documentary">Documentary</option>
            <option value="Training">Training</option>
            <option value="Lecture">Lecture</option>
          </select>
        </div>
      </div>

      <!-- Resources Grid -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div v-if="loading" class="p-12 text-center">
          <LoadingSpinner />
        </div>
        <div v-else-if="filteredResources.length === 0" class="p-12 text-center text-gray-500">
          <PlayCircleIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p>No media resources found</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
          <div v-for="resource in paginatedResources" :key="resource.id" class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <!-- Media Preview -->
            <div class="aspect-video bg-gray-100 relative">
              <div v-if="resource.thumbnail_url" class="w-full h-full">
                <img :src="resource.thumbnail_url" :alt="resource.title" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-teal-100">
                <component :is="getMediaIcon(resource.media_type)" class="w-12 h-12 text-green-600" />
              </div>
              
              <!-- Play/Action Button -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                <button
                  @click="playMedia(resource)"
                  class="bg-white/90 text-green-600 p-3 rounded-full hover:bg-white transition-colors"
                >
                  <PlayIcon class="w-6 h-6" />
                </button>
              </div>

              <!-- Type Badge -->
              <div class="absolute top-2 left-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getTypeColorClass(resource.media_type)">
                  {{ resource.media_type }}
                </span>
              </div>

              <!-- Duration -->
              <div v-if="resource.duration" class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {{ resource.duration }}
              </div>
            </div>

            <!-- Media Info -->
            <div class="p-4">
              <h3 class="font-medium text-gray-900 truncate">{{ resource.title }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ resource.author || 'Unknown Author' }}</p>
              <p class="text-sm text-gray-500">{{ resource.category }}</p>
              
              <!-- Metadata -->
              <div class="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>{{ formatDate(resource.created_at) }}</span>
                <span>{{ resource.file_size || 'N/A' }}</span>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between mt-4">
                <div class="flex space-x-2">
                  <button
                    @click="editResource(resource)"
                    class="text-green-600 hover:text-green-800 p-1 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteResource(resource)"
                    class="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ showAddModal ? 'Add Media Resource' : 'Edit Media Resource' }}
            </h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="saveResource" class="space-y-6">
            <!-- Basic Information Section -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    v-model="resourceForm.title"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter media title"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Author/Creator</label>
                  <input
                    v-model="resourceForm.author"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter creator name"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    v-model="resourceForm.media_type"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Type</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="interactive">Interactive Media</option>
                    <option value="presentation">Presentation</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    v-model="resourceForm.category"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Educational">Educational</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Training">Training</option>
                    <option value="Lecture">Lecture</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Description Section -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="resourceForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Brief description of the media resource"
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="closeModal"
                class="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {{ showAddModal ? 'Add Media' : 'Update Media' }}
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
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlayCircleIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  CursorArrowRaysIcon,
  PlayIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import axios from 'axios'

// Type definition
interface MediaResource {
  id: number
  title: string
  author?: string
  media_type: string
  category?: string
  url?: string
  thumbnail_url?: string
  file_path?: string
  file_size?: string
  duration?: string
  description?: string
  created_at: string
  is_active?: boolean
}

// Reactive data
const mediaResources = ref<MediaResource[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedType = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const showAddModal = ref(false)
const showEditModal = ref(false)

// Form data
const resourceForm = ref({
  id: null as number | null,
  title: '',
  author: '',
  media_type: '',
  category: '',
  description: ''
})

// Computed properties
const totalMediaResources = computed(() => mediaResources.value.length)
const videoCount = computed(() => mediaResources.value.filter(r => r.media_type === 'video').length)
const audioCount = computed(() => mediaResources.value.filter(r => r.media_type === 'audio').length)
const interactiveCount = computed(() => mediaResources.value.filter(r => r.media_type === 'interactive').length)

const filteredResources = computed(() => {
  let filtered = mediaResources.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(resource => 
      resource.title.toLowerCase().includes(query) ||
      resource.author?.toLowerCase().includes(query) ||
      resource.category?.toLowerCase().includes(query)
    )
  }

  if (selectedType.value) {
    filtered = filtered.filter(resource => resource.media_type === selectedType.value)
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(resource => resource.category === selectedCategory.value)
  }

  return filtered
})

const paginatedResources = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredResources.value.slice(start, end)
})

// Methods
const refreshResources = async () => {
  loading.value = true
  try {
    const response = await axios.get('/library/media-resources')
    mediaResources.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Error fetching media resources:', error)
    mediaResources.value = []
  } finally {
    loading.value = false
  }
}

const getMediaIcon = (type: string) => {
  switch (type) {
    case 'video': return VideoCameraIcon
    case 'audio': return SpeakerWaveIcon
    case 'interactive': return CursorArrowRaysIcon
    case 'presentation': return PlayCircleIcon
    default: return PlayCircleIcon
  }
}

const getTypeColorClass = (type: string) => {
  switch (type) {
    case 'video': return 'bg-blue-100 text-blue-800'
    case 'audio': return 'bg-green-100 text-green-800'
    case 'interactive': return 'bg-purple-100 text-purple-800'
    case 'presentation': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const playMedia = (resource: MediaResource) => {
  if (resource.url) {
    window.open(resource.url, '_blank')
  } else if (resource.file_path) {
    window.open(`/media/${resource.file_path}`, '_blank')
  }
}

const editResource = (resource: MediaResource) => {
  resourceForm.value = {
    id: resource.id,
    title: resource.title,
    author: resource.author || '',
    media_type: resource.media_type,
    category: resource.category || '',
    description: resource.description || ''
  }
  showEditModal.value = true
}

const deleteResource = async (resource: MediaResource) => {
  if (confirm(`Are you sure you want to delete "${resource.title}"?`)) {
    try {
      await axios.delete(`/library/media-resources/${resource.id}`)
      await refreshResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Error deleting resource')
    }
  }
}

const saveResource = async () => {
  try {
    if (showAddModal.value) {
      const { id, ...resourceData } = resourceForm.value
      await axios.post('/library/media-resources', resourceData)
    } else {
      const { id, ...resourceData } = resourceForm.value
      await axios.put(`/library/media-resources/${id}`, resourceData)
    }
    
    closeModal()
    await refreshResources()
  } catch (error) {
    console.error('Error saving resource:', error)
    alert('Error saving resource')
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  resourceForm.value = {
    id: null,
    title: '',
    author: '',
    media_type: '',
    category: '',
    description: ''
  }
}

// Initialize
onMounted(() => {
  refreshResources()
})
</script>