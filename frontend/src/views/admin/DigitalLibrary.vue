<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Modern Gradient Header -->
    <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold">Digital Library</h1>
            <p class="text-purple-100 mt-2">Manage eBooks, PDFs, databases, and digital resources</p>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="showAddModal = true"
              class="bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-purple-50 transition-colors font-medium flex items-center space-x-2"
            >
              <PlusIcon class="w-5 h-5" />
              <span>Add Digital Resource</span>
            </button>
          </div>
        </div>

        <!-- Enhanced Digital Library Statistics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm">Total Digital Items</p>
                <p class="text-2xl font-bold text-white">{{ totalDigitalResources }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <DocumentIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm">E-Books</p>
                <p class="text-2xl font-bold text-white">{{ eBookCount }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <BookOpenIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm">PDF Documents</p>
                <p class="text-2xl font-bold text-white">{{ pdfCount }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <DocumentTextIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm">Journals & Articles</p>
                <p class="text-2xl font-bold text-white">{{ journalCount }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <DocumentIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-purple-100 text-sm">Research & Thesis</p>
                <p class="text-2xl font-bold text-white">{{ researchCount }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <DocumentIcon class="w-6 h-6 text-white" />
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
              class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon class="w-4 h-4" />
              <span>Add Resource</span>
            </button>
            <button
              @click="refreshResources"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <ArrowPathIcon class="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <DocumentArrowDownIcon class="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
          <div class="text-sm text-gray-600">
            Showing {{ filteredResources.length }} of {{ digitalResources.length }} resources
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2">
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search digital resources..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          <select
            v-model="selectedType"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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

      <!-- Resources Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="loading" class="animate-pulse">
                <td colspan="7" class="px-6 py-12 text-center">
                  <LoadingSpinner />
                </td>
              </tr>
              <tr v-else-if="filteredResources.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                  <DocumentIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No digital resources found</p>
                </td>
              </tr>
              <tr v-else v-for="resource in paginatedResources" :key="resource.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <component :is="getResourceIcon(resource.type)" class="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ resource.title }}</div>
                      <div class="text-sm text-gray-500">{{ resource.author || 'Unknown Author' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getTypeColorClass(resource.type)">
                    {{ resource.type }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ resource.category }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div v-if="resource.url" class="flex space-x-2">
                    <span class="text-purple-600 hover:text-purple-800 cursor-pointer" @click="openResource(resource)">
                      <GlobeAltIcon class="w-4 h-4 inline mr-1" />
                      Open
                    </span>
                  </div>
                  <div v-else-if="resource.file_path" class="flex space-x-2">
                    <span v-if="resource.type === 'pdf'" class="text-green-600 hover:text-green-800 cursor-pointer" @click="viewResource(resource)">
                      <DocumentTextIcon class="w-4 h-4 inline mr-1" />
                      View
                    </span>
                    <span class="text-blue-600 hover:text-blue-800 cursor-pointer" @click="downloadResource(resource)">
                      <DocumentArrowDownIcon class="w-4 h-4 inline mr-1" />
                      Download
                    </span>
                  </div>
                  <span v-else class="text-gray-400">No Access</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatFileSize(resource.file_size) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(resource.created_at) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center space-x-2">
                    <button
                      @click="editResource(resource)"
                      class="text-purple-600 hover:text-purple-800 p-1 rounded-lg hover:bg-purple-50 transition-colors"
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="changePage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                @click="changePage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, filteredResources.length) }} of {{ filteredResources.length }} results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    @click="changePage(currentPage - 1)"
                    :disabled="currentPage === 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="changePage(page)"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                      page === currentPage
                        ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>
                  <button
                    @click="changePage(currentPage + 1)"
                    :disabled="currentPage === totalPages"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
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
              {{ showAddModal ? 'Add Digital Resource' : 'Edit Digital Resource' }}
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
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter resource title"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Author</label>
                  <input
                    v-model="resourceForm.author"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Enter author name"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    v-model="resourceForm.type"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select Type</option>
                    <option value="ebook">E-Book</option>
                    <option value="pdf">PDF Document</option>
                    <option value="journal">Digital Journal</option>
                    <option value="article">Article</option>
                    <option value="research_paper">Research Paper</option>
                    <option value="thesis">Thesis</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Format *</label>
                  <select
                    v-model="resourceForm.format"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select Format</option>
                    <option value="pdf">PDF</option>
                    <option value="epub">EPUB</option>
                    <option value="mobi">MOBI</option>
                    <option value="docx">DOCX</option>
                    <option value="html">HTML</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    v-model="resourceForm.category"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Science">Science</option>
                    <option value="History">History</option>
                    <option value="Literature">Literature</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Access Information Section -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Access Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">URL (for online resources)</label>
                  <input
                    v-model="resourceForm.url"
                    type="url"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="https://example.com/resource"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">File Size</label>
                  <input
                    v-model="resourceForm.file_size"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., 5.2 MB"
                  />
                </div>
              </div>
            </div>

            <!-- Description Section -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="resourceForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Brief description of the resource"
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
                :disabled="savingResource"
                class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <LoadingSpinner v-if="savingResource" class="w-4 h-4 mr-2" />
                {{ savingResource ? 'Saving...' : (showAddModal ? 'Add Resource' : 'Update Resource') }}
              </button>
            </div>
          </form>
      </div>
    </div>
  </div>

  <!-- Debug Environment Info -->
  <EnvironmentDebug />
</div>
</template><script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentArrowDownIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  DocumentIcon,
  BookOpenIcon,
  DocumentTextIcon,
  GlobeAltIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import EnvironmentDebug from '@/components/debug/EnvironmentDebug.vue'
import axios from 'axios'

// Type definition
interface DigitalResource {
  id: number
  title: string
  author?: string
  type: string
  format: string
  category?: string
  url?: string
  file_path?: string
  file_size?: string
  description?: string
  created_at: string
  is_active?: boolean
}

// Reactive data
const digitalResources = ref<DigitalResource[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedType = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showAddModal = ref(false)
const showEditModal = ref(false)
const savingResource = ref(false)

// Form data
const resourceForm = ref({
  id: null as number | null,
  title: '',
  author: '',
  type: '',
  format: '',
  category: '',
  url: '',
  file_size: '',
  description: ''
})

// Computed properties
const totalDigitalResources = computed(() => digitalResources.value.length)
const eBookCount = computed(() => digitalResources.value.filter(r => r.type === 'ebook').length)
const pdfCount = computed(() => digitalResources.value.filter(r => r.type === 'pdf').length)
const journalCount = computed(() => digitalResources.value.filter(r => ['journal', 'article'].includes(r.type)).length)
const researchCount = computed(() => digitalResources.value.filter(r => ['research_paper', 'thesis'].includes(r.type)).length)

const filteredResources = computed(() => {
  let filtered = digitalResources.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(resource => 
      resource.title.toLowerCase().includes(query) ||
      resource.author?.toLowerCase().includes(query) ||
      resource.category?.toLowerCase().includes(query) ||
      resource.description?.toLowerCase().includes(query)
    )
  }

  if (selectedType.value) {
    filtered = filtered.filter(resource => resource.type === selectedType.value)
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(resource => resource.category === selectedCategory.value)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredResources.value.length / pageSize.value))

const paginatedResources = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredResources.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const refreshResources = async () => {
  loading.value = true
  try {
    const response = await axios.get('/library/digital-resources')
    digitalResources.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Error fetching digital resources:', error)
    digitalResources.value = []
  } finally {
    loading.value = false
  }
}

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'ebook': return BookOpenIcon
    case 'pdf': return DocumentTextIcon
    case 'journal': return DocumentIcon
    case 'article': return DocumentIcon
    case 'research_paper': return DocumentIcon
    case 'thesis': return DocumentIcon
    default: return DocumentIcon
  }
}

const getTypeColorClass = (type: string) => {
  switch (type) {
    case 'ebook': return 'bg-blue-100 text-blue-800'
    case 'pdf': return 'bg-red-100 text-red-800'
    case 'journal': return 'bg-purple-100 text-purple-800'
    case 'article': return 'bg-green-100 text-green-800'
    case 'research_paper': return 'bg-orange-100 text-orange-800'
    case 'thesis': return 'bg-indigo-100 text-indigo-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatFileSize = (bytes: string | null | undefined) => {
  if (!bytes) return 'N/A'
  const size = parseInt(bytes)
  if (isNaN(size)) return 'N/A'
  
  const units = ['B', 'KB', 'MB', 'GB']
  let unitIndex = 0
  let fileSize = size
  
  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024
    unitIndex++
  }
  
  return `${fileSize.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

const openResource = (resource: DigitalResource) => {
  if (resource.url) {
    window.open(resource.url, '_blank')
  }
}

const viewResource = (resource: DigitalResource) => {
  if (resource.type === 'pdf' && resource.file_path) {
    // Open PDF in new tab for viewing
    window.open(`/api/library/digital-resources/${resource.id}/view`, '_blank')
  } else if (resource.url) {
    window.open(resource.url, '_blank')
  }
}

const downloadResource = async (resource: DigitalResource) => {
  try {
    // Use the proper API endpoint for downloading
    const response = await axios.get(`/library/digital-resources/${resource.id}/download`, {
      responseType: 'blob'
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = resource.title || `resource-${resource.id}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading resource:', error)
    alert('Failed to download resource. Please try again.')
  }
}

const editResource = (resource: DigitalResource) => {
  resourceForm.value = {
    id: resource.id,
    title: resource.title,
    author: resource.author || '',
    type: resource.type,
    format: resource.format || 'pdf',
    category: resource.category || '',
    url: resource.url || '',
    file_size: resource.file_size || '',
    description: resource.description || ''
  }
  showEditModal.value = true
}

const deleteResource = async (resource: DigitalResource) => {
  const confirmed = confirm(`Are you sure you want to delete "${resource.title}"?\n\nThis action cannot be undone.`)
  if (confirmed) {
    try {
      await axios.delete(`/library/digital-resources/${resource.id}`)
      await refreshResources()
      alert('Resource deleted successfully!')
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Failed to delete resource. Please try again.')
    }
  }
}

const saveResource = async () => {
  try {
    savingResource.value = true
    if (showAddModal.value) {
      const { id, ...resourceData } = resourceForm.value
      await axios.post('/library/digital-resources', resourceData)
    } else {
      const { id, ...resourceData } = resourceForm.value
      await axios.put(`/library/digital-resources/${id}`, resourceData)
    }
    
    closeModal()
    await refreshResources()
  } catch (error) {
    console.error('Error saving resource:', error)
    alert('Error saving resource. Please try again.')
  } finally {
    savingResource.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  resourceForm.value = {
    id: null,
    title: '',
    author: '',
    type: '',
    format: '',
    category: '',
    url: '',
    file_size: '',
    description: ''
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Initialize
onMounted(() => {
  refreshResources()
})
</script>