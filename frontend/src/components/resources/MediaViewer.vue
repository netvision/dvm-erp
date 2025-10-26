<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[95vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">{{ resource?.title }}</h3>
          <p class="text-sm text-gray-600">{{ resource?.format?.toUpperCase() }} • {{ formatFileSize(resource?.file_size_bytes) }}</p>
        </div>
        <div class="flex items-center space-x-2">
          <button
            @click="testFileAccess"
            class="bg-yellow-600 text-white px-3 py-1.5 rounded hover:bg-yellow-700 flex items-center space-x-1 text-sm"
            v-if="(isVideo || isAudio) && fileUrl"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Test Access</span>
          </button>
          <button
            @click="downloadResource"
            class="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 flex items-center space-x-1 text-sm"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            @click="closeViewer"
            class="text-gray-500 hover:text-gray-700 p-1"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
      </div>
      
      <!-- Content Area -->
      <div class="flex-1 p-6 overflow-auto">
        <!-- PDF Viewer -->
        <div v-if="isPDF" class="h-full">
          <div class="mb-2 text-sm text-gray-600">PDF Document: {{ props.resource?.title }}</div>
          
          <!-- Try iframe first (works in production) -->
          <div v-if="!showFallback" class="mb-4">
            <iframe
              :key="props.resource?.id"
              :src="fileUrl + '#toolbar=1&navpanes=1&scrollbar=1'"
              class="w-full h-[70vh] border rounded bg-white"
              frameborder="0"
              @load="onPdfLoad"
              @error="onPdfError"
            />
          </div>
          
          <!-- Fallback for development/CSP issues -->
          <div v-if="showFallback" class="bg-gray-100 p-4 rounded-lg">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-semibold flex items-center">
                <DocumentIcon class="w-5 h-5 mr-2" />
                PDF Preview
              </h4>
              <div class="space-x-2">
                <button
                  @click="openInNewTab"
                  class="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm flex items-center space-x-1"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  <span>Open in Browser</span>
                </button>
                <button
                  @click="downloadResource"
                  class="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm flex items-center space-x-1"
                >
                  <ArrowDownTrayIcon class="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
            
            <!-- PDF Info and Preview -->
            <div class="bg-white rounded-lg p-6 text-center">
              <div class="mb-6">
                <div class="mx-auto w-24 h-32 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg class="w-12 h-16 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    <text x="12" y="17" font-family="Arial" font-size="3" text-anchor="middle" fill="white">PDF</text>
                  </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ props.resource?.title }}</h3>
                <p class="text-gray-600 mb-1">{{ props.resource?.author || 'Unknown Author' }}</p>
                <p class="text-sm text-gray-500">{{ formatFileSize(props.resource?.file_size_bytes) }}</p>
              </div>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div class="flex items-center justify-center mb-2">
                  <svg class="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                  <span class="text-blue-800 font-medium">Development Mode</span>
                </div>
                <p class="text-blue-700 text-sm">
                  PDF embedding restricted in development. This will work normally when deployed to production.
                </p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  @click="openInNewTab"
                  class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  <span>View in Browser</span>
                </button>
                <button
                  @click="downloadResource"
                  class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <ArrowDownTrayIcon class="w-5 h-5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Always show action buttons -->
          <div class="flex justify-center space-x-4 mt-4">
            <button
              @click="openInNewTab"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
              <span>Open in New Tab</span>
            </button>
            <button
              @click="downloadResource"
              class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2"
            >
              <ArrowDownTrayIcon class="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>
        
        <!-- Video Player -->
        <div v-else-if="isVideo" class="h-full flex items-center justify-center">
          <div class="w-full max-w-4xl">
            <!-- External Video (YouTube, Vimeo, etc.) -->
            <div v-if="isExternalVideo" class="space-y-4">
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div class="flex items-center">
                  <svg class="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5z"></path>
                    <path d="M7.414 15.414a2 2 0 01-2.828-2.828l3-3a2 2 0 012.828 0 1 1 0 001.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5z"></path>
                  </svg>
                  <span class="text-blue-800 font-medium">External Video Source</span>
                </div>
                <p class="text-blue-700 text-sm mt-1">This video is hosted externally. Click below to view it.</p>
              </div>
              
              <div class="text-center space-y-3">
                <button
                  @click="openInNewTab"
                  class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  <span>Watch Video</span>
                </button>
                <p class="text-gray-600 text-sm">Opens in a new tab</p>
              </div>
            </div>
            
            <!-- Local Video File -->
            <div v-else>
              <video
                :src="fileUrl"
                controls
                class="w-full max-h-[70vh] rounded shadow-lg"
                preload="metadata"
                crossorigin="anonymous"
                @error="onMediaError"
                @loadstart="onMediaLoadStart"
                @canplay="onMediaCanPlay"
              >
                Your browser does not support the video tag.
              </video>
              <div v-if="mediaError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 class="text-red-800 font-medium mb-2">Video Playback Error</h4>
                <p class="text-red-700 text-sm mb-3">{{ mediaError }}</p>
                <div class="flex space-x-2">
                  <button
                    @click="downloadResource"
                    class="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm"
                  >
                    Download Video
                  </button>
                  <button
                    @click="openInNewTab"
                    class="bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700 text-sm"
                  >
                    Open in New Tab
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Audio Player -->
        <div v-else-if="isAudio" class="h-full flex flex-col items-center justify-center space-y-4">
          <div class="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-8 text-white text-center">
            <MusicalNoteIcon class="w-16 h-16 mx-auto mb-4" />
            <h4 class="text-xl font-semibold">{{ resource?.title }}</h4>
            <p class="text-blue-100">{{ resource?.author || 'Unknown Artist' }}</p>
          </div>
          
          <!-- External Audio (Spotify, SoundCloud, etc.) -->
          <div v-if="isExternalAudio" class="w-full max-w-lg">
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div class="flex items-center">
                <svg class="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5z"></path>
                  <path d="M7.414 15.414a2 2 0 01-2.828-2.828l3-3a2 2 0 012.828 0 1 1 0 001.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5z"></path>
                </svg>
                <span class="text-purple-800 font-medium">External Audio Source</span>
              </div>
              <p class="text-purple-700 text-sm mt-1">This audio is hosted externally. Click below to listen.</p>
            </div>
            
            <button
              @click="openInNewTab"
              class="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>Listen to Audio</span>
            </button>
          </div>
          
          <!-- Local Audio File -->
          <div v-else class="w-full max-w-lg">
            <audio
              :src="fileUrl"
              controls
              class="w-full"
              preload="metadata"
              crossorigin="anonymous"
              @error="onMediaError"
              @loadstart="onMediaLoadStart"
              @canplay="onMediaCanPlay"
            >
              Your browser does not support the audio tag.
            </audio>
            <div v-if="mediaError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 class="text-red-800 font-medium mb-2">Audio Playback Error</h4>
              <p class="text-red-700 text-sm mb-3">{{ mediaError }}</p>
              <div class="flex space-x-2">
                <button
                  @click="downloadResource"
                  class="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm"
                >
                  Download Audio
                </button>
                <button
                  @click="openInNewTab"
                  class="bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700 text-sm"
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Image Viewer -->
        <div v-else-if="isImage" class="h-full flex items-center justify-center">
          <img
            :src="fileUrl"
            :alt="resource?.title"
            class="max-w-full max-h-[70vh] object-contain rounded"
          />
        </div>
        
        <!-- eBook Reader (EPUB) -->
        <div v-else-if="isEbook" class="h-full">
          <div class="bg-gray-100 p-8 rounded-lg text-center">
            <BookOpenIcon class="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h4 class="text-xl font-semibold text-gray-800 mb-2">eBook Reader</h4>
            <p class="text-gray-600 mb-4">EPUB files require a specialized reader.</p>
            <div class="space-y-2">
              <button
                @click="downloadResource"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
              >
                Download EPUB
              </button>
              <button
                @click="openInNewTab"
                class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Open in Browser
              </button>
            </div>
          </div>
        </div>
        
        <!-- Text/Document Viewer -->
        <div v-else-if="isText" class="h-full">
          <div class="bg-white border rounded p-4 h-[70vh] overflow-auto">
            <pre v-if="textContent" class="whitespace-pre-wrap font-mono text-sm">{{ textContent }}</pre>
            <div v-else class="flex items-center justify-center h-full">
              <div class="text-center">
                <DocumentIcon class="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p class="text-gray-600">Loading document...</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Unsupported File Type -->
        <div v-else class="h-full flex items-center justify-center">
          <div class="text-center">
            <DocumentIcon class="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h4 class="text-xl font-semibold text-gray-800 mb-2">Preview Not Available</h4>
            <p class="text-gray-600 mb-4">This file type ({{ resource?.format }}) cannot be previewed in the browser.</p>
            <div class="space-y-2">
              <button
                @click="downloadResource"
                class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
              >
                <ArrowDownTrayIcon class="w-4 h-4 inline mr-1" />
                Download File
              </button>
              <button
                @click="openInNewTab"
                class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Open in New Tab
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
  DocumentIcon,
  MusicalNoteIcon
} from '@heroicons/vue/24/outline'
import axios from 'axios'

// Props
const props = defineProps<{
  resource: any
  showModal: boolean
}>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// Reactive data
const textContent = ref('')
const showFallback = ref(false)
const mediaError = ref('')
const mediaLoading = ref(false)

// Computed properties
const fileUrl = computed(() => {
  // Check if resource has external URL
  if (props.resource?.external_url) {
    console.log('Using external URL:', props.resource.external_url)
    return props.resource.external_url
  }
  
  // Handle local files - use the proper API endpoint
  if (props.resource?.id) {
    console.log('Resource ID:', props.resource.id)
    // Use the same API endpoint as download but for viewing
    const url = `/api/library/digital-resources/${props.resource.id}/view`
    console.log('Generated view URL:', url)
    return url
  }
  console.log('No resource ID found')
  return ''
})

const isExternalVideo = computed(() => {
  return !!(props.resource?.external_url && isVideo.value)
})

const isExternalAudio = computed(() => {
  return !!(props.resource?.external_url && isAudio.value)
})

const isPDF = computed(() => {
  const format = props.resource?.format?.toLowerCase()
  return format === 'pdf'
})

const isVideo = computed(() => {
  const format = props.resource?.format?.toLowerCase()
  return ['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(format)
})

const isAudio = computed(() => {
  const format = props.resource?.format?.toLowerCase()
  return ['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(format)
})

const isImage = computed(() => {
  const format = props.resource?.format?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(format)
})

const isEbook = computed(() => {
  const format = props.resource?.format?.toLowerCase()
  return ['epub', 'mobi'].includes(format)
})

const isText = computed(() => {
  const format = props.resource?.format?.toLowerCase()
  return ['txt', 'md', 'doc', 'docx'].includes(format)
})

// Methods
const closeViewer = () => {
  emit('close')
}

const downloadResource = async () => {
  try {
    // Use the proper API endpoint for download
    const response = await axios.get(`/library/digital-resources/${props.resource.id}/download`, {
      responseType: 'blob'
    })
    
    // Create blob URL and download with correct MIME type
    const contentType = response.headers['content-type'] || 'application/pdf'
    const blob = new Blob([response.data], { type: contentType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // Extract filename from Content-Disposition header or use fallback
    let filename = `${props.resource.title}.${props.resource.format || 'pdf'}`
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
    
  } catch (error) {
    console.error('Error downloading resource:', error)
    alert(`Cannot download "${props.resource.title}". ${error.response?.data?.message || 'Download failed.'}`)
  }
}

const openInNewTab = () => {
  window.open(fileUrl.value, '_blank')
}

const onPdfLoad = () => {
  console.log('PDF loaded successfully in iframe')
}

const onPdfError = () => {
  console.log('PDF failed to load in iframe, showing fallback')
  showFallback.value = true
}

const onMediaError = (event: Event) => {
  console.error('Media playback error:', event)
  const target = event.target as HTMLMediaElement
  
  let errorMessage = 'Unknown media error'
  if (target.error) {
    switch (target.error.code) {
      case target.error.MEDIA_ERR_ABORTED:
        errorMessage = 'Media playback was aborted by the user'
        break
      case target.error.MEDIA_ERR_NETWORK:
        errorMessage = 'Network error occurred while loading media'
        break
      case target.error.MEDIA_ERR_DECODE:
        errorMessage = 'Media format is not supported or corrupted'
        break
      case target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        errorMessage = 'Media format or codec is not supported'
        break
      default:
        errorMessage = 'An unknown error occurred during media playback'
    }
  }
  
  mediaError.value = errorMessage
}

const onMediaLoadStart = () => {
  console.log('Media loading started')
  mediaLoading.value = true
  mediaError.value = ''
}

const onMediaCanPlay = () => {
  console.log('Media can start playing')
  mediaLoading.value = false
  mediaError.value = ''
}

const testFileAccess = async () => {
  console.log('Testing file access for:', fileUrl.value)
  
  try {
    const response = await fetch(fileUrl.value, { method: 'HEAD' })
    console.log('File access test result:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    if (response.ok) {
      alert(`File accessible! Status: ${response.status}`)
    } else {
      alert(`File access failed! Status: ${response.status} - ${response.statusText}`)
    }
  } catch (error) {
    console.error('File access test error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    alert(`File access error: ${errorMessage}`)
  }
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

const loadTextContent = async () => {
  if (isText.value && fileUrl.value) {
    try {
      const response = await fetch(fileUrl.value)
      textContent.value = await response.text()
    } catch (error) {
      textContent.value = 'Error loading file content.'
    }
  }
}

// Watch for changes
watch(() => props.resource, () => {
  // Reset error state when resource changes
  mediaError.value = ''
  mediaLoading.value = false
  
  if (isText.value) {
    loadTextContent()
  }
}, { immediate: true })

// Track view when modal opens
watch(() => props.showModal, (newValue) => {
  if (newValue && props.resource?.id) {
    // Reset media state when modal opens
    mediaError.value = ''
    mediaLoading.value = false
    
    // Log resource info for debugging
    console.log('Opening media viewer for resource:', {
      id: props.resource.id,
      title: props.resource.title,
      format: props.resource.format,
      file_path: props.resource.file_path,
      fileUrl: fileUrl.value
    })
    
    // Temporarily disabled until tracking endpoints are working
    // trackView()
    console.log('View tracking temporarily disabled')
  }
})
</script>
