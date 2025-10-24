<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Browse Books
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Discover and borrow books from our collection
        </p>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white shadow rounded-lg">
      <div class="p-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label for="search" class="block text-sm font-medium text-gray-700">Search</label>
            <input
              id="search"
              v-model="filters.search"
              type="text"
              placeholder="Search books, authors..."
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              @input="debouncedSearch"
            />
          </div>
          <div>
            <label for="genre" class="block text-sm font-medium text-gray-700">Genre</label>
            <select
              id="genre"
              v-model="filters.genre"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              @change="searchBooks"
            >
              <option value="">All Genres</option>
              <option value="Fiction">Fiction</option>
              <option value="Non-Fiction">Non-Fiction</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Biography">Biography</option>
              <option value="Technology">Technology</option>
              <option value="Arts">Arts</option>
              <option value="Business">Business</option>
            </select>
          </div>
          <div>
            <label for="language" class="block text-sm font-medium text-gray-700">Language</label>
            <select
              id="language"
              v-model="filters.language"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              @change="searchBooks"
            >
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
          </div>
          <div class="flex items-end">
            <label class="flex items-center">
              <input
                v-model="filters.available_only"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                @change="searchBooks"
              />
              <span class="ml-2 text-sm text-gray-700">Available only</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Books Grid -->
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingSpinner size="lg" text="Loading books..." />
    </div>

    <div v-else-if="books.length === 0" class="text-center py-12">
      <BookOpenIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No books found</h3>
      <p class="mt-1 text-sm text-gray-500">Try adjusting your search criteria</p>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="book in books"
          :key="book.id"
          class="group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
        >
          <div class="aspect-w-3 aspect-h-4">
            <img
              v-if="book.cover_image"
              :src="book.cover_image"
              :alt="book.title"
              class="w-full h-48 object-cover rounded-t-lg"
            />
            <div
              v-else
              class="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center"
            >
              <BookOpenIcon class="h-16 w-16 text-gray-400" />
            </div>
          </div>
          
          <div class="p-4">
            <h3 class="text-lg font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
              {{ book.title }}
            </h3>
            <p class="mt-1 text-sm text-gray-500">{{ book.author }}</p>
            <p v-if="book.genre" class="mt-1 text-xs text-gray-400">{{ book.genre }}</p>
            
            <div class="mt-3 flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    book.available_copies > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ book.available_copies > 0 ? 'Available' : 'Unavailable' }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ book.available_copies }}/{{ book.total_copies }}
                </span>
              </div>
              
              <div class="flex items-center space-x-2">
                <button
                  @click="toggleBookmark(book)"
                  :disabled="bookmarkLoading[book.id]"
                  class="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <HeartIcon
                    :class="[
                      'h-5 w-5',
                      isBookmarked(book.id) ? 'text-red-500 fill-red-500' : ''
                    ]"
                  />
                </button>
                
                <button
                  v-if="book.available_copies > 0"
                  @click="borrowBook(book)"
                  :disabled="borrowLoading[book.id]"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <span v-if="borrowLoading[book.id]">Borrowing...</span>
                  <span v-else>Borrow</span>
                </button>
                
                <button
                  v-else
                  disabled
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-500 bg-gray-100 cursor-not-allowed"
                >
                  Unavailable
                </button>
              </div>
            </div>
            
            <button
              @click="showBookDetails(book)"
              class="mt-3 w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <nav
        v-if="pagination.total_pages > 1"
        class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8"
      >
        <div class="flex flex-1 justify-between sm:hidden">
          <button
            @click="goToPage(pagination.current_page - 1)"
            :disabled="pagination.current_page <= 1"
            class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="goToPage(pagination.current_page + 1)"
            :disabled="pagination.current_page >= pagination.total_pages"
            class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing {{ (pagination.current_page - 1) * pagination.per_page + 1 }} to 
              {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} of 
              {{ pagination.total }} results
            </p>
          </div>
          <div>
            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm">
              <button
                @click="goToPage(pagination.current_page - 1)"
                :disabled="pagination.current_page <= 1"
                class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  page === pagination.current_page
                    ? 'relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                    : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                ]"
              >
                {{ page }}
              </button>
              <button
                @click="goToPage(pagination.current_page + 1)"
                :disabled="pagination.current_page >= pagination.total_pages"
                class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { BookOpenIcon, HeartIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import type { Book, BookFilters, PaginatedResponse } from '@/types'
import axios from 'axios'

// Simple debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const loading = ref(true)
const books = ref<Book[]>([])
const bookmarks = ref<number[]>([])
const borrowLoading = reactive<Record<number, boolean>>({})
const bookmarkLoading = reactive<Record<number, boolean>>({})

const filters = reactive<BookFilters>({
  search: '',
  genre: '',
  language: '',
  available_only: false,
  sort_by: 'title',
  sort_order: 'ASC'
})

const pagination = reactive({
  current_page: 1,
  per_page: 12,
  total: 0,
  total_pages: 0
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, pagination.current_page - 2)
  const end = Math.min(pagination.total_pages, pagination.current_page + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

const isBookmarked = (bookId: number) => {
  return bookmarks.value.includes(bookId)
}

const searchBooks = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      ...filters,
      page: pagination.current_page,
      limit: pagination.per_page
    }
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await axios.get('/books', { params })
    const data: PaginatedResponse<Book> = response.data.data || response.data
    
    books.value = data.items || []
    pagination.current_page = data.pagination.current_page
    pagination.per_page = data.pagination.per_page
    pagination.total = data.pagination.total
    pagination.total_pages = data.pagination.total_pages
  } catch (error) {
    console.error('Error fetching books:', error)
    books.value = []
  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce(searchBooks, 300)

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.total_pages) {
    pagination.current_page = page
    searchBooks()
  }
}

const borrowBook = async (book: Book) => {
  if (book.available_copies <= 0) return
  
  borrowLoading[book.id] = true
  try {
    await axios.post('/borrow', { book_id: book.id })
    
    // Update book availability
    const bookIndex = books.value.findIndex(b => b.id === book.id)
    if (bookIndex !== -1 && books.value[bookIndex]) {
      books.value[bookIndex].available_copies--
    }
    
    // Show success message
    alert('Book borrowed successfully!')
  } catch (error) {
    console.error('Error borrowing book:', error)
    alert('Failed to borrow book. Please try again.')
  } finally {
    borrowLoading[book.id] = false
  }
}

const toggleBookmark = async (book: Book) => {
  bookmarkLoading[book.id] = true
  try {
    if (isBookmarked(book.id)) {
      await axios.delete(`/bookmarks/${book.id}`)
      bookmarks.value = bookmarks.value.filter(id => id !== book.id)
    } else {
      await axios.post('/bookmarks', { book_id: book.id })
      bookmarks.value.push(book.id)
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    alert('Failed to update bookmark. Please try again.')
  } finally {
    bookmarkLoading[book.id] = false
  }
}

const showBookDetails = (book: Book) => {
  const details = `
Title: ${book.title}
Author: ${book.author}
${book.isbn ? `ISBN: ${book.isbn}` : ''}
${book.genre ? `Genre: ${book.genre}` : ''}
${book.description ? `\nDescription: ${book.description}` : ''}
Available: ${book.available_copies}/${book.total_copies} copies
  `.trim()
  
  alert(details)
}

const fetchBookmarks = async () => {
  try {
    const response = await axios.get('/bookmarks')
    const bookmarkData = response.data.data || response.data
    bookmarks.value = bookmarkData.map((bookmark: any) => bookmark.book_id)
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
  }
}

onMounted(async () => {
  await Promise.all([
    searchBooks(),
    fetchBookmarks()
  ])
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