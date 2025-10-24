<template>
  <div class="p-6">
    <div class="space-y-6">
      <!-- Import Method Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">Import Method</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            @click="importMethod = 'file'"
            :class="[
              'border-2 rounded-lg p-4 cursor-pointer transition-colors',
              importMethod === 'file' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            ]"
          >
            <div class="flex items-center space-x-3">
              <DocumentArrowUpIcon class="w-8 h-8 text-blue-600" />
              <div>
                <h3 class="font-medium text-gray-900">Upload File</h3>
                <p class="text-sm text-gray-600">Import from CSV, Excel, or JSON file</p>
              </div>
            </div>
          </div>

          <div
            @click="importMethod = 'api'"
            :class="[
              'border-2 rounded-lg p-4 cursor-pointer transition-colors',
              importMethod === 'api' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            ]"
          >
            <div class="flex items-center space-x-3">
              <CloudIcon class="w-8 h-8 text-blue-600" />
              <div>
                <h3 class="font-medium text-gray-900">External API</h3>
                <p class="text-sm text-gray-600">Import from library databases or APIs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- File Upload Method -->
      <div v-if="importMethod === 'file'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
          <select
            v-model="fileImport.resourceType"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Resource Type</option>
            <option value="books">Books</option>
            <option value="digital">Digital Resources</option>
            <option value="media">Media</option>
            <option value="equipment">Equipment</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref="fileInput"
              type="file"
              @change="handleFileUpload"
              accept=".csv,.xlsx,.xls,.json"
              class="hidden"
            />
            <CloudArrowUpIcon class="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 mb-2">
              {{ selectedFile ? selectedFile.name : 'Drop your file here or click to browse' }}
            </p>
            <p class="text-xs text-gray-500 mb-4">Supported formats: CSV, Excel (.xlsx, .xls), JSON</p>
            <button
              type="button"
              @click="$refs.fileInput.click()"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Choose File
            </button>
          </div>
        </div>

        <div v-if="selectedFile" class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-2">File Information</h4>
          <div class="text-sm text-gray-600 space-y-1">
            <div>Name: {{ selectedFile.name }}</div>
            <div>Size: {{ formatFileSize(selectedFile.size) }}</div>
            <div>Type: {{ selectedFile.type }}</div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Import Options</label>
          <div class="space-y-3">
            <div class="flex items-center">
              <input
                v-model="fileImport.skipDuplicates"
                type="checkbox"
                id="skipDuplicates"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="skipDuplicates" class="ml-2 text-sm text-gray-700">
                Skip duplicate entries (based on ISBN, Serial Number, etc.)
              </label>
            </div>
            <div class="flex items-center">
              <input
                v-model="fileImport.validateData"
                type="checkbox"
                id="validateData"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="validateData" class="ml-2 text-sm text-gray-700">
                Validate data before import
              </label>
            </div>
            <div class="flex items-center">
              <input
                v-model="fileImport.createBackup"
                type="checkbox"
                id="createBackup"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="createBackup" class="ml-2 text-sm text-gray-700">
                Create backup before import
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- API Import Method -->
      <div v-if="importMethod === 'api'" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">API Source</label>
          <select
            v-model="apiImport.source"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select API Source</option>
            <option value="google_books">Google Books API</option>
            <option value="open_library">Open Library</option>
            <option value="worldcat">WorldCat</option>
            <option value="custom">Custom API</option>
          </select>
        </div>

        <div v-if="apiImport.source === 'custom'">
          <label class="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
          <input
            v-model="apiImport.endpoint"
            type="url"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://api.example.com/resources"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search Query</label>
          <input
            v-model="apiImport.query"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Computer Science, Shakespeare, Physics"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Max Results</label>
            <select
              v-model="apiImport.maxResults"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10">10 items</option>
              <option value="25">25 items</option>
              <option value="50">50 items</option>
              <option value="100">100 items</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              v-model="apiImport.language"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="any">Any Language</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">API Options</label>
          <div class="space-y-3">
            <div class="flex items-center">
              <input
                v-model="apiImport.includeMetadata"
                type="checkbox"
                id="includeMetadata"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="includeMetadata" class="ml-2 text-sm text-gray-700">
                Include extended metadata
              </label>
            </div>
            <div class="flex items-center">
              <input
                v-model="apiImport.downloadCovers"
                type="checkbox"
                id="downloadCovers"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="downloadCovers" class="ml-2 text-sm text-gray-700">
                Download cover images
              </label>
            </div>
          </div>
        </div>

        <div v-if="apiImport.source" class="bg-blue-50 rounded-lg p-4">
          <h4 class="font-medium text-blue-900 mb-2">Preview Search</h4>
          <button
            @click="previewApiResults"
            :disabled="!apiImport.query"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview Results
          </button>
        </div>
      </div>

      <!-- Preview Results -->
      <div v-if="previewResults.length > 0" class="space-y-4">
        <h3 class="text-lg font-semibold text-gray-900">Preview Results</h3>
        <div class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
          <div class="space-y-3">
            <div
              v-for="(item, index) in previewResults.slice(0, 5)"
              :key="index"
              class="bg-white rounded p-3 border border-gray-200"
            >
              <div class="flex items-center space-x-3">
                <input
                  v-model="item.selected"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">{{ item.title }}</h4>
                  <p class="text-sm text-gray-600">{{ item.author || item.description }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-if="previewResults.length > 5" class="mt-3 text-sm text-gray-500 text-center">
            And {{ previewResults.length - 5 }} more items...
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="importing" class="space-y-2">
        <div class="flex justify-between text-sm">
          <span>Importing resources...</span>
          <span>{{ importProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: importProgress + '%' }"
          ></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex space-x-3 pt-6 border-t border-gray-200">
        <button
          @click="startImport"
          :disabled="!canImport || importing"
          class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ importing ? 'Importing...' : 'Start Import' }}
        </button>
        <button
          @click="$emit('cancel')"
          :disabled="importing"
          class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  DocumentArrowUpIcon,
  CloudIcon,
  CloudArrowUpIcon
} from '@heroicons/vue/24/outline'

// Emits
defineEmits<{
  import: [data: any]
  cancel: []
}>()

// Reactive data
const importMethod = ref('file')
const selectedFile = ref<File | null>(null)
const importing = ref(false)
const importProgress = ref(0)
const previewResults = ref([])

const fileImport = ref({
  resourceType: '',
  skipDuplicates: true,
  validateData: true,
  createBackup: true
})

const apiImport = ref({
  source: '',
  endpoint: '',
  query: '',
  maxResults: '25',
  language: 'en',
  includeMetadata: true,
  downloadCovers: false
})

// Computed
const canImport = computed(() => {
  if (importMethod.value === 'file') {
    return selectedFile.value && fileImport.value.resourceType
  } else if (importMethod.value === 'api') {
    return apiImport.value.source && apiImport.value.query
  }
  return false
})

// Methods
const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const previewApiResults = async () => {
  // Simulate API call
  previewResults.value = [
    {
      title: 'Introduction to Computer Science',
      author: 'John Smith',
      selected: true
    },
    {
      title: 'Advanced Algorithms',
      author: 'Jane Doe',
      selected: true
    },
    {
      title: 'Data Structures and Programming',
      author: 'Bob Johnson',
      selected: false
    }
  ]
}

const startImport = async () => {
  importing.value = true
  importProgress.value = 0

  // Simulate import progress
  const interval = setInterval(() => {
    importProgress.value += 10
    if (importProgress.value >= 100) {
      clearInterval(interval)
      importing.value = false
      
      // Emit import completion
      if (importMethod.value === 'file') {
        emit('import', {
          method: 'file',
          file: selectedFile.value,
          options: fileImport.value
        })
      } else {
        emit('import', {
          method: 'api',
          source: apiImport.value.source,
          query: apiImport.value.query,
          selectedItems: previewResults.value.filter(item => item.selected),
          options: apiImport.value
        })
      }
    }
  }, 200)
}
</script>