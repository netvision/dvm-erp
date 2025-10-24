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
              placeholder="Search books by title, author, ISBN..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <select
          v-model="selectedCategory"
          class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          <option value="Fiction">Fiction</option>
          <option value="Non-Fiction">Non-Fiction</option>
          <option value="Science">Science</option>
          <option value="History">History</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Literature">Literature</option>
        </select>

        <select
          v-model="selectedStatus"
          class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="checked_out">Checked Out</option>
          <option value="reserved">Reserved</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>
    </div>

    <!-- Books Grid/List View Toggle -->
    <div class="flex justify-between items-center">
      <div class="flex items-center space-x-4">
        <span class="text-sm text-gray-700">
          {{ filteredBooks.length }} books found
        </span>
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-500">View:</span>
          <button
            @click="viewMode = 'grid'"
            :class="[
              'p-2 rounded',
              viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            ]"
          >
            <Squares2X2Icon class="w-5 h-5" />
          </button>
          <button
            @click="viewMode = 'list'"
            :class="[
              'p-2 rounded',
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            ]"
          >
            <Bars3Icon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="flex space-x-2">
        <button
          @click="showBarcodeScanner = true"
          class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <QrCodeIcon class="w-5 h-5" />
          <span>Scan ISBN</span>
        </button>
        <button
          @click="$emit('refresh')"
          class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2"
        >
          <ArrowPathIcon class="w-5 h-5" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Books Grid View -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="book in filteredBooks"
        :key="book.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 mb-1">{{ book.title }}</h3>
              <p class="text-sm text-gray-600 mb-2">by {{ book.author }}</p>
              <div class="flex items-center space-x-2 mb-3">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    getStatusColor(book.status)
                  ]"
                >
                  {{ formatStatus(book.status) }}
                </span>
                <span class="text-xs text-gray-500">{{ book.category }}</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500 mb-1">
                {{ book.copies_available }}/{{ book.copies_total }} available
              </div>
              <div class="text-xs text-gray-400">{{ book.location }}</div>
            </div>
          </div>

          <div class="border-t border-gray-100 pt-4 mt-4">
            <div class="flex justify-between items-center">
              <div class="text-xs text-gray-500">
                <div>ISBN: {{ book.isbn }}</div>
                <div>Condition: {{ book.condition }}</div>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="$emit('edit', book)"
                  class="text-blue-600 hover:text-blue-800 text-sm"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  @click="viewBookDetails(book)"
                  class="text-green-600 hover:text-green-800 text-sm"
                >
                  <EyeIcon class="w-4 h-4" />
                </button>
                <button
                  @click="$emit('delete', book)"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Books List View -->
    <div v-if="viewMode === 'list'" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="book in filteredBooks" :key="book.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ book.title }}</div>
                  <div class="text-sm text-gray-500">{{ book.author }}</div>
                  <div class="text-xs text-gray-400">ISBN: {{ book.isbn }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ book.category }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 py-1 text-xs rounded-full', getStatusColor(book.status)]">
                  {{ formatStatus(book.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ book.copies_available }}/{{ book.copies_total }}</div>
                <div class="text-xs text-gray-500">{{ book.condition }} condition</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ book.location }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-3">
                  <button @click="$emit('edit', book)" class="text-blue-600 hover:text-blue-900">
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button @click="viewBookDetails(book)" class="text-green-600 hover:text-green-900">
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button @click="$emit('delete', book)" class="text-red-600 hover:text-red-900">
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Barcode Scanner Modal -->
    <div v-if="showBarcodeScanner" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">ISBN Scanner</h3>
        </div>
        <div class="p-6">
          <div class="text-center">
            <QrCodeIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 mb-4">Position the ISBN barcode in the camera view</p>
            <input
              v-model="scannedISBN"
              type="text"
              placeholder="Or enter ISBN manually"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div class="flex space-x-3 mt-6">
            <button
              @click="processScannedISBN"
              :disabled="!scannedISBN"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Process ISBN
            </button>
            <button
              @click="showBarcodeScanner = false; scannedISBN = ''"
              class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Book Details Modal -->
    <div v-if="showBookDetails" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Book Details</h3>
        </div>
        <div class="p-6" v-if="selectedBook">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold text-lg text-gray-900 mb-2">{{ selectedBook.title }}</h4>
              <p class="text-gray-600 mb-4">by {{ selectedBook.author }}</p>
              
              <div class="space-y-2">
                <div><span class="font-medium">ISBN:</span> {{ selectedBook.isbn }}</div>
                <div><span class="font-medium">Category:</span> {{ selectedBook.category }}</div>
                <div><span class="font-medium">Location:</span> {{ selectedBook.location }}</div>
                <div><span class="font-medium">Condition:</span> {{ selectedBook.condition }}</div>
                <div><span class="font-medium">Added:</span> {{ formatDate(selectedBook.created_at) }}</div>
              </div>
            </div>
            
            <div>
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 class="font-medium text-gray-900 mb-2">Availability</h5>
                <div class="space-y-1">
                  <div>Total Copies: {{ selectedBook.copies_total }}</div>
                  <div>Available: {{ selectedBook.copies_available }}</div>
                  <div>Checked Out: {{ selectedBook.copies_total - selectedBook.copies_available }}</div>
                </div>
              </div>
              
              <div class="flex space-x-2">
                <button
                  @click="checkoutBook(selectedBook)"
                  :disabled="selectedBook.copies_available === 0"
                  class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Checkout
                </button>
                <button
                  @click="reserveBook(selectedBook)"
                  class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Reserve
                </button>
              </div>
            </div>
          </div>
          
          <div class="mt-6 pt-6 border-t border-gray-200">
            <button
              @click="showBookDetails = false"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Close
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
  PencilIcon,
  TrashIcon,
  EyeIcon,
  QrCodeIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  Bars3Icon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps<{
  books: Array<any>
}>()

// Emits
defineEmits<{
  refresh: []
  edit: [book: any]
  delete: [book: any]
}>()

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const viewMode = ref('grid')
const showBarcodeScanner = ref(false)
const showBookDetails = ref(false)
const selectedBook = ref(null)
const scannedISBN = ref('')

// Computed
const filteredBooks = computed(() => {
  return props.books.filter(book => {
    const matchesSearch = !searchQuery.value || 
      book.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      book.isbn.includes(searchQuery.value)
    
    const matchesCategory = !selectedCategory.value || book.category === selectedCategory.value
    const matchesStatus = !selectedStatus.value || book.status === selectedStatus.value
    
    return matchesSearch && matchesCategory && matchesStatus
  })
})

// Methods
const getStatusColor = (status: string) => {
  if (!status || typeof status !== 'string') {
    return 'bg-gray-100 text-gray-800'
  }
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800'
    case 'checked_out': return 'bg-orange-100 text-orange-800'
    case 'reserved': return 'bg-blue-100 text-blue-800'
    case 'maintenance': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatStatus = (status: string) => {
  if (!status || typeof status !== 'string') {
    return 'Unknown'
  }
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const viewBookDetails = (book: any) => {
  selectedBook.value = book
  showBookDetails.value = true
}

const processScannedISBN = async () => {
  if (scannedISBN.value) {
    try {
      // Here you would typically call an API to get book details by ISBN
      console.log('Processing ISBN:', scannedISBN.value)
      // For demo, just search existing books
      const foundBook = props.books.find(book => book.isbn === scannedISBN.value)
      if (foundBook) {
        viewBookDetails(foundBook)
      } else {
        alert('Book not found. Would you like to add it?')
      }
      showBarcodeScanner.value = false
      scannedISBN.value = ''
    } catch (error) {
      alert('Error processing ISBN')
    }
  }
}

const checkoutBook = (book: any) => {
  // Handle book checkout
  console.log('Checking out book:', book.title)
  showBookDetails.value = false
}

const reserveBook = (book: any) => {
  // Handle book reservation
  console.log('Reserving book:', book.title)
  showBookDetails.value = false
}
</script>