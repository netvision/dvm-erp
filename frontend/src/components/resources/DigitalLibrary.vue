<template>
  <div class="space-y-6">
    <!-- Search and Filters -->
    <div class="bg-gray-50 rounded-lg p-4">
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
          <option value="database">Online Database</option>
          <option value="journal">Digital Journal</option>
          <option value="research">Research Paper</option>
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
        </select>
      </div>
    </div>

    <!-- Statistics Row -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Digital Items</p>
            <p class="text-2xl font-bold text-gray-900">{{ resources.length }}</p>
          </div>
          <DocumentIcon class="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Downloads</p>
            <p class="text-2xl font-bold text-green-600">{{ totalDownloads }}</p>
          </div>
          <ArrowDownTrayIcon class="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Storage Used</p>
            <p class="text-2xl font-bold text-purple-600">{{ totalStorage }}</p>
          </div>
          <CloudIcon class="w-8 h-8 text-purple-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Users</p>
            <p class="text-2xl font-bold text-orange-600">{{ activeUsers }}</p>
          </div>
          <UsersIcon class="w-8 h-8 text-orange-600" />
        </div>
      </div>
    </div>

    <!-- Resources Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="resource in filteredResources"
        :key="resource.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <component :is="getResourceIcon(resource.type)" class="w-5 h-5 text-blue-600" />
                <span class="text-xs font-medium text-gray-500 uppercase">{{ resource.type }}</span>
              </div>
              <h3 class="font-semibold text-gray-900 mb-1">{{ resource.title }}</h3>
              <p class="text-sm text-gray-600 mb-2">{{ resource.category }}</p>
            </div>
            <div class="flex space-x-1">
              <button
                @click="viewResource(resource)"
                class="text-green-600 hover:text-green-800 p-1"
                title="View"
              >
                <EyeIcon class="w-4 h-4" />
              </button>
              <button
                @click="downloadResource(resource)"
                class="text-blue-600 hover:text-blue-800 p-1"
                title="Download"
              >
                <ArrowDownTrayIcon class="w-4 h-4" />
              </button>
              <!-- Admin Only Actions -->
              <template v-if="isAdmin">
                <button
                  @click="editResource(resource)"
                  class="text-yellow-600 hover:text-yellow-800 p-1"
                  title="Edit"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  @click="deleteResource(resource)"
                  class="text-red-600 hover:text-red-800 p-1"
                  title="Delete"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </template>
            </div>
          </div>

          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>Format:</span>
              <span class="font-medium">{{ resource.format }}</span>
            </div>
            <div class="flex justify-between" v-if="resource.size">
              <span>Size:</span>
              <span class="font-medium">{{ resource.size }}</span>
            </div>
            <div class="flex justify-between" v-if="resource.downloads">
              <span>Downloads:</span>
              <span class="font-medium">{{ resource.downloads }}</span>
            </div>
            <div class="flex justify-between" v-if="resource.views">
              <span>Views:</span>
              <span class="font-medium">{{ resource.views }}</span>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-100">
            <div class="flex items-center justify-between">
              <span
                :class="[
                  'px-2 py-1 text-xs rounded-full',
                  getAccessLevelColor(resource.access_level)
                ]"
              >
                {{ formatAccessLevel(resource.access_level) }}
              </span>
              <span class="text-xs text-gray-500">
                {{ formatDate(resource.created_at) }}
              </span>
            </div>
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

    <!-- Preview Modal -->
    <div v-if="showPreviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedResource?.title }}</h3>
          <button @click="showPreviewModal = false" class="text-gray-500 hover:text-gray-700">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <div class="p-6">
          <div v-if="selectedResource?.format === 'PDF'" class="text-center">
            <DocumentIcon class="w-24 h-24 text-blue-600 mx-auto mb-4" />
            <p class="text-gray-600 mb-4">PDF Preview</p>
            <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Open Full PDF
            </button>
          </div>
          
          <div v-else class="text-center">
            <EyeSlashIcon class="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600">Preview not available for this file type</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import MediaViewer from './MediaViewer.vue'
import {
  MagnifyingGlassIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  CloudIcon,
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  EyeSlashIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps<{
  resources: Array<any>
}>()

// Emits
const emit = defineEmits<{
  refresh: []
  edit: [resource: any]
  delete: [resource: any]
}>()

// Reactive data
const searchQuery = ref('')
const selectedType = ref('')
const selectedCategory = ref('')
const showPreviewModal = ref(false)
const showMediaViewer = ref(false)
const selectedResource = ref<any>(null)

// Computed
const filteredResources = computed(() => {
  return props.resources.filter(resource => {
    const matchesSearch = !searchQuery.value || 
      resource.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesType = !selectedType.value || resource.type === selectedType.value
    const matchesCategory = !selectedCategory.value || resource.category === selectedCategory.value
    
    return matchesSearch && matchesType && matchesCategory
  })
})

const totalDownloads = computed(() => {
  return props.resources.reduce((sum, resource) => sum + (resource.downloads || resource.views || 0), 0)
})

const totalStorage = computed(() => {
  // Calculate total storage used (simplified)
  return '2.4 GB'
})

const activeUsers = computed(() => {
  return 156 // Demo data
})

// Methods
const getResourceIcon = (type: string) => {
  switch (type) {
    case 'e-book':
    case 'pdf':
      return DocumentIcon
    case 'database':
      return CloudIcon
    default:
      return DocumentIcon
  }
}

// Admin check
const isAdmin = computed(() => {
  const authStore = useAuthStore()
  return authStore.user?.role === 'admin'
})

// Resource actions
const viewResource = (resource: any) => {
  console.log('Viewing resource:', JSON.stringify(resource, null, 2))
  selectedResource.value = resource
  showMediaViewer.value = true
}

const closeMediaViewer = () => {
  showMediaViewer.value = false
  selectedResource.value = null
}

const editResource = (resource: any) => {
  emit('edit', resource)
}

const deleteResource = async (resource: any) => {
  if (confirm(`Are you sure you want to delete "${resource.title}"?`)) {
    try {
      console.log('Deleting resource:', resource.id) // Debug log
      await axios.delete(`/library/digital-resources/${resource.id}`)
      alert(`Successfully deleted "${resource.title}"`)
      emit('refresh')
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert(`Failed to delete "${resource.title}". Please try again.`)
    }
  }
}

const getAccessLevelColor = (level: string) => {
  switch (level) {
    case 'all': return 'bg-green-100 text-green-800'
    case 'student': return 'bg-blue-100 text-blue-800'
    case 'staff': return 'bg-purple-100 text-purple-800'
    case 'admin': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatAccessLevel = (level: string) => {
  return level.charAt(0).toUpperCase() + level.slice(1)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const downloadResource = async (resource: any) => {
  console.log('Downloading:', resource.title)
  
  try {
    // Use the proper API endpoint for download
    const response = await axios.get(`/library/digital-resources/${resource.id}/download`, {
      responseType: 'blob'
    })
    
    // Create blob URL and download with correct MIME type
    const contentType = response.headers['content-type'] || 'application/pdf'
    const blob = new Blob([response.data], { type: contentType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Extract filename from Content-Disposition header or use fallback
    let filename = `${resource.title}.${resource.format || 'pdf'}`
    const contentDisposition = response.headers['content-disposition']
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }
    link.download = filename
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up blob URL
    window.URL.revokeObjectURL(url)
    
  } catch (error: any) {
    console.error('Error downloading resource:', error)
    alert(`Cannot download "${resource.title}". ${error.response?.data?.message || 'Download failed.'}`)
  }
}

</script>