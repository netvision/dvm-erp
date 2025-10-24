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
              placeholder="Search media resources..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <select
          v-model="selectedType"
          class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          <option value="video">Videos</option>
          <option value="audio">Audio</option>
          <option value="documentary">Documentaries</option>
          <option value="educational_series">Educational Series</option>
          <option value="podcast">Podcasts</option>
        </select>

        <select
          v-model="selectedCategory"
          class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          <option value="Science">Science</option>
          <option value="Literature">Literature</option>
          <option value="History">History</option>
          <option value="Arts">Arts</option>
          <option value="Technology">Technology</option>
        </select>
      </div>
    </div>

    <!-- Media Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Media</p>
            <p class="text-2xl font-bold text-gray-900">{{ media.length }}</p>
          </div>
          <FilmIcon class="w-8 h-8 text-purple-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Duration</p>
            <p class="text-2xl font-bold text-blue-600">{{ totalDuration }}</p>
          </div>
          <ClockIcon class="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Views</p>
            <p class="text-2xl font-bold text-green-600">{{ totalViews }}</p>
          </div>
          <EyeIcon class="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Storage Used</p>
            <p class="text-2xl font-bold text-orange-600">{{ storageUsed }}</p>
          </div>
          <ServerIcon class="w-8 h-8 text-orange-600" />
        </div>
      </div>
    </div>

    <!-- Media Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in filteredMedia"
        :key="item.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        <!-- Thumbnail -->
        <div class="relative aspect-video bg-gray-100 overflow-hidden">
          <div class="absolute inset-0 flex items-center justify-center">
            <component :is="getMediaIcon(item.type)" class="w-16 h-16 text-gray-400" />
          </div>
          <div class="absolute top-2 left-2">
            <span :class="['px-2 py-1 text-xs rounded-full', getTypeColor(item.type)]">
              {{ formatType(item.type) }}
            </span>
          </div>
          <div class="absolute top-2 right-2">
            <span class="bg-black bg-opacity-75 text-white px-2 py-1 text-xs rounded">
              {{ item.duration || 'N/A' }}
            </span>
          </div>
          <div class="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              @click="playMedia(item)"
              class="bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100 transition-all"
            >
              <PlayIcon class="w-8 h-8 text-gray-900" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-4">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2">{{ item.title }}</h3>
              <p class="text-sm text-gray-600">{{ item.category }}</p>
            </div>
          </div>

          <div class="space-y-2 text-sm text-gray-600 mb-4">
            <div class="flex justify-between" v-if="item.format">
              <span>Format:</span>
              <span class="font-medium">{{ item.format }}</span>
            </div>
            <div class="flex justify-between" v-if="item.quality">
              <span>Quality:</span>
              <span class="font-medium">{{ item.quality }}</span>
            </div>
            <div class="flex justify-between" v-if="item.language">
              <span>Language:</span>
              <span class="font-medium">{{ item.language }}</span>
            </div>
            <div class="flex justify-between" v-if="item.size">
              <span>Size:</span>
              <span class="font-medium">{{ item.size }}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-gray-100">
            <div class="flex items-center space-x-3">
              <button
                @click="playMedia(item)"
                class="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <PlayIcon class="w-4 h-4" />
                <span class="text-sm">Play</span>
              </button>
              <button
                @click="downloadMedia(item)"
                class="text-green-600 hover:text-green-800 flex items-center space-x-1"
              >
                <ArrowDownTrayIcon class="w-4 h-4" />
                <span class="text-sm">Download</span>
              </button>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="$emit('edit', item)"
                class="text-gray-600 hover:text-gray-800"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
              <button
                @click="shareMedia(item)"
                class="text-gray-600 hover:text-gray-800"
              >
                <ShareIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Media Player Modal -->
    <div v-if="showPlayerModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedMedia?.title }}</h3>
          <button @click="showPlayerModal = false" class="text-gray-500 hover:text-gray-700">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        
        <div class="p-6">
          <div class="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
            <div class="text-white text-center">
              <PlayIcon class="w-16 h-16 mx-auto mb-4" />
              <p class="text-lg">Media Player</p>
              <p class="text-sm text-gray-300">{{ selectedMedia?.format }} - {{ selectedMedia?.quality }}</p>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">Details</h4>
              <div class="space-y-2 text-sm">
                <div><span class="font-medium">Duration:</span> {{ selectedMedia?.duration }}</div>
                <div><span class="font-medium">Language:</span> {{ selectedMedia?.language }}</div>
                <div v-if="selectedMedia?.subtitles"><span class="font-medium">Subtitles:</span> Available</div>
                <div><span class="font-medium">Category:</span> {{ selectedMedia?.category }}</div>
              </div>
            </div>
            
            <div>
              <h4 class="font-semibold text-gray-900 mb-2">Controls</h4>
              <div class="space-y-2">
                <button class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Play/Pause
                </button>
                <button class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                  Fullscreen
                </button>
                <button class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Media Modal -->
    <div v-if="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Upload Media</h3>
        </div>
        
        <div class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                v-model="newMedia.title"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  v-model="newMedia.type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="documentary">Documentary</option>
                  <option value="educational_series">Educational Series</option>
                  <option value="podcast">Podcast</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  v-model="newMedia.category"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Science">Science</option>
                  <option value="Literature">Literature</option>
                  <option value="History">History</option>
                  <option value="Arts">Arts</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <input
                  v-model="newMedia.duration"
                  type="text"
                  placeholder="e.g., 45 minutes"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  v-model="newMedia.language"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Media Upload</label>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <CloudArrowUpIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p class="text-gray-600">Drop media files here or click to browse</p>
                <p class="text-xs text-gray-500 mt-2">Supported formats: MP4, MP3, MOV, AVI</p>
                <input type="file" class="hidden" accept="video/*,audio/*" @change="handleMediaUpload" />
              </div>
            </div>
          </div>

          <div class="flex space-x-3 mt-6">
            <button
              @click="saveMedia"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Upload Media
            </button>
            <button
              @click="showUploadModal = false"
              class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  MagnifyingGlassIcon,
  FilmIcon,
  ClockIcon,
  EyeIcon,
  ServerIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  ShareIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  SpeakerWaveIcon,
  VideoCameraIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps<{
  media: Array<any>
}>()

// Emits
defineEmits<{
  refresh: []
  edit: [media: any]
  delete: [media: any]
}>()

// Reactive data
const searchQuery = ref('')
const selectedType = ref('')
const selectedCategory = ref('')
const showPlayerModal = ref(false)
const showUploadModal = ref(false)
const selectedMedia = ref(null)

const newMedia = ref({
  title: '',
  type: 'video',
  category: 'Science',
  duration: '',
  language: 'English'
})

// Computed
const filteredMedia = computed(() => {
  return props.media.filter(item => {
    const matchesSearch = !searchQuery.value || 
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesType = !selectedType.value || item.type === selectedType.value
    const matchesCategory = !selectedCategory.value || item.category === selectedCategory.value
    
    return matchesSearch && matchesType && matchesCategory
  })
})

const totalDuration = computed(() => {
  return '240 hrs' // Demo calculation
})

const totalViews = computed(() => {
  return '12.5K' // Demo data
})

const storageUsed = computed(() => {
  return '156 GB' // Demo calculation
})

// Methods
const getMediaIcon = (type: string) => {
  switch (type) {
    case 'video':
    case 'documentary':
    case 'educational_series':
      return VideoCameraIcon
    case 'audio':
    case 'podcast':
      return SpeakerWaveIcon
    default:
      return FilmIcon
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'video': return 'bg-blue-100 text-blue-800'
    case 'audio': return 'bg-green-100 text-green-800'
    case 'documentary': return 'bg-purple-100 text-purple-800'
    case 'educational_series': return 'bg-orange-100 text-orange-800'
    case 'podcast': return 'bg-indigo-100 text-indigo-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const playMedia = (media: any) => {
  selectedMedia.value = media
  showPlayerModal.value = true
}

const downloadMedia = (media: any) => {
  console.log('Downloading media:', media.title)
  // Implement download logic
}

const shareMedia = (media: any) => {
  console.log('Sharing media:', media.title)
  // Implement share logic
}

const handleMediaUpload = (event: any) => {
  const file = event.target.files[0]
  if (file) {
    console.log('Uploading media file:', file.name)
    // Implement file upload logic
  }
}

const saveMedia = () => {
  console.log('Saving media:', newMedia.value)
  showUploadModal.value = false
  // Reset form
  newMedia.value = {
    title: '',
    type: 'video',
    category: 'Science',
    duration: '',
    language: 'English'
  }
}
</script>