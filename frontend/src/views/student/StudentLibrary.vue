<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Digital Library</h1>
            <p class="text-gray-600 mt-1">Browse and access digital resources</p>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-sm text-gray-600">{{ filteredResources.length }} resources available</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="px-6 py-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2">
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search digital resources..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            v-model="selectedType"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="e-book">E-Books</option>
            <option value="pdf">PDF Documents</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="image">Images</option>
          </select>

          <select
            v-model="selectedCategory"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Science">Science</option>
            <option value="History">History</option>
            <option value="Literature">Literature</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Arts">Arts</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Resources Grid -->
    <div class="px-6 pb-6">
      <div v-if="filteredResources.length === 0" class="text-center py-12">
        <DocumentIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
        <p class="text-gray-600">Try adjusting your search criteria</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="resource in filteredResources"
          :key="resource.id"
          class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          @click="viewResource(resource)"
        >
          <div class="p-4">
            <!-- Resource Icon -->
            <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
              <component :is="getResourceIcon(resource.format)" class="w-6 h-6 text-blue-600" />
            </div>
            
            <!-- Resource Info -->
            <h4 class="font-semibold text-gray-900 mb-1 line-clamp-2">{{ resource.title }}</h4>
            <p v-if="resource.author" class="text-sm text-gray-600 mb-2">by {{ resource.author }}</p>
            
            <!-- Metadata -->
            <div class="flex items-center justify-between text-xs text-gray-500 mb-3">
              <span class="bg-gray-100 px-2 py-1 rounded uppercase">{{ resource.format }}</span>
              <span>{{ formatFileSize(resource.file_size_bytes) }}</span>
            </div>
            
            <!-- Access Level Badge -->
            <div class="flex items-center justify-between">
              <span :class="getAccessLevelColor(resource.access_level)" class="px-2 py-1 text-xs font-medium rounded-full">
                {{ formatAccessLevel(resource.access_level) }}
              </span>
              <div class="flex items-center space-x-1">
                <EyeIcon class="w-4 h-4 text-gray-400" />
                <span class="text-xs text-gray-500">{{ resource.view_count || 0 }}</span>
              </div>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              @click.stop="viewResource(resource)"
              class="text-blue-600 hover:text-blue-800 flex items-center space-x-1 text-sm"
            >
              <EyeIcon class="w-4 h-4" />
              <span>View</span>
            </button>
            <button
              @click.stop="downloadResource(resource)"
              class="text-green-600 hover:text-green-800 flex items-center space-x-1 text-sm"
            >
              <ArrowDownTrayIcon class="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Media Viewer Modal -->
    <MediaViewer
      :resource="selectedResource"
      :showModal="showMediaViewer"
      @close="closeMediaViewer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import MediaViewer from '@/components/resources/MediaViewer.vue'
import {
  MagnifyingGlassIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  PhotoIcon,
  BookOpenIcon
} from '@heroicons/vue/24/outline'

// Reactive data
const resources = ref<any[]>([])
const searchQuery = ref('')
const selectedType = ref('')
const selectedCategory = ref('')
const showMediaViewer = ref(false)
const selectedResource = ref<any>(null)

// Computed
const filteredResources = computed(() => {
  return resources.value.filter(resource => {
    const matchesSearch = !searchQuery.value || 
      resource.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (resource.author && resource.author.toLowerCase().includes(searchQuery.value.toLowerCase()))
    
    const matchesType = !selectedType.value || resource.type === selectedType.value
    const matchesCategory = !selectedCategory.value || resource.category === selectedCategory.value
    
    return matchesSearch && matchesType && matchesCategory
  })
})

// Methods
const loadResources = async () => {
  try {
    const response = await axios.get('/library/digital-resources')
    if (response.data.success) {
      resources.value = response.data.data || []
    }
  } catch (error) {
    console.error('Error loading resources:', error)
  }
}

const viewResource = (resource: any) => {
  selectedResource.value = resource
  showMediaViewer.value = true
  
  // Track view count
  trackResourceView(resource.id)
}

const closeMediaViewer = () => {
  showMediaViewer.value = false
  selectedResource.value = null
}

const downloadResource = async (resource: any) => {
  try {
    // Use the proper API endpoint for download
    const response = await axios.get(`/library/digital-resources/${resource.id}/download`, {
      responseType: 'blob'
    })
    
    // Create blob URL and download
    const blob = new Blob([response.data])
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Use proper filename with extension
    const filename = resource.title.includes('.') 
      ? resource.title 
      : `${resource.title}.${resource.format || 'pdf'}`
    link.download = filename
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up blob URL
    window.URL.revokeObjectURL(url)
    
    // Track download
    trackResourceDownload(resource.id)
  } catch (error: any) {
    console.error('Error downloading resource:', error)
    alert(`Cannot download "${resource.title}". ${error.response?.data?.message || 'Download failed.'}`)
  }
}

const trackResourceView = async (resourceId: number) => {
  try {
    await axios.post(`/library/digital-resources/${resourceId}/view`)
  } catch (error) {
    console.error('Error tracking view:', error)
  }
}

const trackResourceDownload = async (resourceId: number) => {
  try {
    await axios.post(`/library/digital-resources/${resourceId}/download`)
  } catch (error) {
    console.error('Error tracking download:', error)
  }
}

const getResourceIcon = (format: string) => {
  switch (format?.toLowerCase()) {
    case 'pdf':
    case 'doc':
    case 'docx':
      return DocumentIcon
    case 'mp4':
    case 'avi':
    case 'mov':
      return VideoCameraIcon
    case 'mp3':
    case 'wav':
    case 'ogg':
      return MusicalNoteIcon
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return PhotoIcon
    case 'epub':
    case 'mobi':
      return BookOpenIcon
    default:
      return DocumentIcon
  }
}

const getAccessLevelColor = (level: string) => {
  switch (level) {
    case 'public': return 'bg-green-100 text-green-800'
    case 'student': return 'bg-blue-100 text-blue-800'
    case 'faculty': return 'bg-purple-100 text-purple-800'
    case 'admin': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatAccessLevel = (level: string) => {
  return level.charAt(0).toUpperCase() + level.slice(1)
}

const formatFileSize = (bytes: number | string) => {
  if (!bytes) return 'Unknown size'
  const size = typeof bytes === 'string' ? parseInt(bytes) : bytes
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  let fileSize = size
  
  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024
    index++
  }
  
  return `${fileSize.toFixed(1)} ${units[index]}`
}

// Lifecycle
onMounted(() => {
  loadResources()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>