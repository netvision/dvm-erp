<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Modern Header with Gradient -->
    <div class="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold mb-2">Physical Books Library</h1>
            <p class="text-lg text-blue-100">
              Complete Book Management • Inventory Control • Smart Analytics
            </p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">{{ totalBooks.toLocaleString() }}</div>
            <div class="text-sm text-blue-200">Total Books</div>
            <div class="text-xs text-blue-300 mt-1">{{ availableBooks }} available</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Bar -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center space-x-4 overflow-x-auto">
          <button 
            @click="showAddModal = true"
            class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
            <PlusIcon class="w-5 h-5" />
            <span>Add Book</span>
          </button>
          <button 
            @click="exportBooks" 
            class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
            <DocumentArrowDownIcon class="w-5 h-5" />
            <span>Export Data</span>
          </button>
          <button 
            @click="bulkImport" 
            class="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap">
            <DocumentArrowUpIcon class="w-5 h-5" />
            <span>Bulk Import</span>
          </button>
          <button 
            @click="scanBarcode" 
            class="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap">
            <QrCodeIcon class="w-5 h-5" />
            <span>Scan Barcode</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <!-- Search and Filters -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Search & Filters</h3>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search books..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Genre</label>
          <select
            v-model="selectedGenre"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Genres</option>
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Science">Science</option>
            <option value="History">History</option>
            <option value="Biography">Biography</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="borrowed">All Borrowed</option>
            <option value="low-stock">Low Stock</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="searchBooks"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Search
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <LoadingSpinner />
    </div>

    <!-- Books Table -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book Details
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ISBN
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Genre
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Copies
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="book in books" :key="book.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ book.title }}</div>
                  <div class="text-sm text-gray-500">by {{ book.author }}</div>
                  <div class="text-xs text-gray-400">{{ book.publisher }} ({{ book.publication_year }})</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ book.isbn || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ book.genre }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>{{ book.available_copies }}/{{ book.total_copies }}</div>
                <div class="text-xs text-gray-500">Available/Total</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  getStatusColor(book)
                ]">
                  {{ getStatusText(book) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  @click="editBook(book)"
                  class="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                >
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button
                  @click="deleteBook(book)"
                  class="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                >
                  <TrashIcon class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalBooks) }} of {{ totalBooks }} books
          </div>
          <div class="flex space-x-2">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="px-3 py-1 text-sm bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Book Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ showAddModal ? 'Add New Book' : 'Edit Book' }}
            </h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="saveBook" class="space-y-6">
            <!-- Book Details Section -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Book Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    v-model="bookForm.title"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter book title"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                  <input
                    v-model="bookForm.author"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter author name"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
                  <input
                    v-model="bookForm.isbn"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="978-0-123456-78-9"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Category/Genre</label>
                  <select
                    v-model="bookForm.genre"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Science">Science & Technology</option>
                    <option value="History">History</option>
                    <option value="Biography">Biography</option>
                    <option value="Education">Educational</option>
                    <option value="Reference">Reference</option>
                    <option value="Literature">Literature</option>
                    <option value="Philosophy">Philosophy</option>
                    <option value="Arts">Arts & Culture</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Publication Details Section -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Publication Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Publisher</label>
                  <input
                    v-model="bookForm.publisher"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Publisher name"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Publication Year</label>
                  <input
                    v-model="bookForm.publication_year"
                    type="number"
                    min="1000"
                    max="2030"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="YYYY"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    v-model="bookForm.language"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Inventory Management Section -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Inventory Management</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Total Copies *</label>
                  <input
                    v-model.number="bookForm.total_copies"
                    type="number"
                    min="1"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Number of copies"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Available Copies *</label>
                  <input
                    v-model.number="bookForm.available_copies"
                    type="number"
                    min="0"
                    :max="bookForm.total_copies"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Available copies"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    v-model="bookForm.location"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., A-Fiction-01"
                  />
                </div>
              </div>
            </div>

            <!-- Description Section -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-model="bookForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of the book"
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
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {{ showAddModal ? 'Add Book' : 'Update Book' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon, DocumentArrowDownIcon, DocumentArrowUpIcon, QrCodeIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useBooksStore } from '@/stores/books'

// Type definition that matches the store
interface Book {
  id: number
  title: string
  author: string
  isbn?: string
  publisher?: string
  publication_year?: number
  genre?: string
  description?: string
  total_copies: number
  available_copies: number
  location?: string
  language?: string
  is_active?: boolean
  created_at: string
  updated_at?: string
}

// Store
const booksStore = useBooksStore()

// Reactive data
const loading = ref(false)
const books = ref<Book[]>([])
const searchQuery = ref('')
const selectedGenre = ref('')
const selectedStatus = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalBooks = ref(0)

// Book form
const bookForm = ref({
  id: null as number | null,
  title: '',
  author: '',
  isbn: '',
  genre: 'Fiction',
  publisher: '',
  publication_year: new Date().getFullYear(),
  language: 'English',
  total_copies: 1,
  available_copies: 1,
  location: '',
  description: ''
})

// Computed
const totalPages = computed(() => Math.ceil(totalBooks.value / pageSize.value))
const availableBooks = computed(() => books.value.reduce((sum, book) => sum + book.available_copies, 0))

// Methods
const fetchBooks = async () => {
  try {
    loading.value = true
    await booksStore.fetchBooks()
    books.value = booksStore.books
    totalBooks.value = booksStore.books.length
  } catch (error) {
    console.error('Error fetching books:', error)
  } finally {
    loading.value = false
  }
}

const searchBooks = async () => {
  try {
    loading.value = true
    const filters: any = {}
    
    if (selectedGenre.value) filters.genre = selectedGenre.value
    if (selectedStatus.value) filters.status = selectedStatus.value
    
    const result = await booksStore.searchBooks(searchQuery.value, filters)
    if (result.success) {
      books.value = booksStore.books
      totalBooks.value = booksStore.books.length
    }
  } catch (error) {
    console.error('Error searching books:', error)
  } finally {
    loading.value = false
  }
}

const getStatusColor = (book: Book) => {
  if (book.available_copies === 0) {
    return 'bg-red-100 text-red-800'
  } else if (book.available_copies <= 2) {
    return 'bg-yellow-100 text-yellow-800'
  } else {
    return 'bg-green-100 text-green-800'
  }
}

const getStatusText = (book: Book) => {
  if (book.available_copies === 0) {
    return 'Out of Stock'
  } else if (book.available_copies <= 2) {
    return 'Low Stock'
  } else {
    return 'Available'
  }
}

const editBook = (book: Book) => {
  bookForm.value = {
    id: book.id,
    title: book.title,
    author: book.author,
    isbn: book.isbn || '',
    genre: book.genre || 'Fiction',
    publisher: book.publisher || '',
    publication_year: book.publication_year || new Date().getFullYear(),
    language: book.language || 'English',
    total_copies: book.total_copies,
    available_copies: book.available_copies,
    location: book.location || '',
    description: book.description || ''
  }
  showEditModal.value = true
}

const deleteBook = async (book: Book) => {
  if (confirm(`Are you sure you want to delete "${book.title}"?`)) {
    try {
      const result = await booksStore.deleteBook(book.id)
      if (result.success) {
        await fetchBooks()
      } else {
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      console.error('Error deleting book:', error)
      alert('Failed to delete book')
    }
  }
}

const saveBook = async () => {
  try {
    let result
    if (showAddModal.value) {
      // Remove id from form data for create
      const { id, ...bookData } = bookForm.value
      result = await booksStore.createBook(bookData)
    } else {
      // For update, also remove id from the data payload
      const { id, ...bookData } = bookForm.value
      result = await booksStore.updateBook(id!, bookData)
    }
    
    if (result.success) {
      closeModal()
      await fetchBooks()
    } else {
      alert(`Error: ${result.message}`)
    }
  } catch (error) {
    console.error('Error saving book:', error)
    alert('Failed to save book')
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  bookForm.value = {
    id: null,
    title: '',
    author: '',
    isbn: '',
    genre: 'Fiction',
    publisher: '',
    publication_year: new Date().getFullYear(),
    language: 'English',
    total_copies: 1,
    available_copies: 1,
    location: '',
    description: ''
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // TODO: Implement pagination
  }
}

// Quick action methods
const exportBooks = () => {
  console.log('Exporting books data...')
  // TODO: Implement book data export
}

const bulkImport = () => {
  console.log('Opening bulk import modal...')
  // TODO: Implement bulk import functionality  
}

const scanBarcode = () => {
  console.log('Opening barcode scanner...')
  // TODO: Implement barcode scanning
}

// Lifecycle
onMounted(() => {
  fetchBooks()
})
</script>