<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header - Same as Dashboard -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.754 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h1 class="ml-3 text-2xl font-bold text-gray-900">School Library</h1>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm font-medium text-gray-900">{{ user?.first_name }} {{ user?.last_name }}</p>
              <p class="text-xs text-gray-500">Student</p>
            </div>
            <AppButton variant="outline" size="sm" @click="handleLogout">
              Logout
            </AppButton>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8">
          <router-link
            to="/student/dashboard"
            class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Dashboard
          </router-link>
          <router-link
            to="/student/books"
            class="border-b-2 border-blue-500 text-blue-600 py-4 px-1 text-sm font-medium"
          >
            Browse Books
          </router-link>
          <router-link
            to="/student/borrowed"
            class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            My Books
          </router-link>
          <router-link
            to="/student/profile"
            class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Profile
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Page Header -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Browse Books</h2>
          <p class="text-gray-600">Discover and borrow books from our collection.</p>
        </div>

        <!-- Search and Filters -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Search Input -->
            <div class="flex-1">
              <AppInput
                v-model="searchQuery"
                placeholder="Search by title, author, ISBN..."
                @input="handleSearch"
              >
                <template #prepend>
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </template>
              </AppInput>
            </div>

            <!-- Genre Filter -->
            <div class="w-full sm:w-48">
              <select
                v-model="selectedGenre"
                @change="handleSearch"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Genres</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="History">History</option>
                <option value="Biography">Biography</option>
                <option value="Mystery">Mystery</option>
                <option value="Romance">Romance</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Educational">Educational</option>
              </select>
            </div>

            <!-- Availability Filter -->
            <div class="flex items-center">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  v-model="showAvailableOnly"
                  @change="handleSearch"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">Available only</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="booksStore.loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- No Results -->
        <div v-else-if="books.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.754 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No books found</h3>
          <p class="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
        </div>

        <!-- Books Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="book in books"
            :key="book.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
            @click="openBookDetails(book)"
          >
            <div class="p-6">
              <!-- Book Icon -->
              <div class="w-full h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4">
                <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.754 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>

              <!-- Book Info -->
              <h3 class="font-semibold text-gray-900 mb-1 line-clamp-2">{{ book.title }}</h3>
              <p class="text-sm text-gray-600 mb-2">{{ book.author }}</p>
              <p v-if="book.genre" class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block mb-3">
                {{ book.genre }}
              </p>

              <!-- Availability -->
              <div class="flex items-center justify-between">
                <div class="text-xs text-gray-500">
                  {{ book.available_copies }}/{{ book.total_copies }} available
                </div>
                <div class="flex items-center">
                  <div
                    :class="[
                      'w-2 h-2 rounded-full mr-2',
                      book.available_copies > 0 ? 'bg-green-400' : 'bg-red-400'
                    ]"
                  ></div>
                  <span class="text-xs font-medium" :class="book.available_copies > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ book.available_copies > 0 ? 'Available' : 'Unavailable' }}
                  </span>
                </div>
              </div>

              <!-- Action Button -->
              <div class="mt-4">
                <AppButton
                  v-if="book.available_copies > 0"
                  size="sm"
                  full-width
                  @click.stop="borrowBook(book)"
                >
                  Borrow Book
                </AppButton>
                <AppButton
                  v-else
                  size="sm"
                  variant="outline"
                  full-width
                  disabled
                >
                  Not Available
                </AppButton>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.total_pages > 1" class="mt-8 flex justify-center">
          <nav class="flex items-center space-x-2">
            <button
              @click="goToPage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div class="flex space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-3 py-2 text-sm font-medium border rounded-md',
                  page === pagination.current_page
                    ? 'text-blue-600 bg-blue-50 border-blue-500'
                    : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
            </div>
            
            <button
              @click="goToPage(pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.total_pages"
              class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </main>

    <!-- Book Details Modal -->
    <AppModal
      :show="showBookModal"
      :title="selectedBook?.title"
      size="lg"
      @close="showBookModal = false"
    >
      <div v-if="selectedBook" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Book Cover -->
          <div class="w-full h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <svg class="w-20 h-20 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.754 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>

          <!-- Book Details -->
          <div class="space-y-3">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ selectedBook.title }}</h3>
              <p class="text-gray-600">by {{ selectedBook.author }}</p>
            </div>

            <div class="space-y-2 text-sm">
              <div v-if="selectedBook.isbn">
                <span class="font-medium text-gray-700">ISBN:</span>
                <span class="ml-2 text-gray-600">{{ selectedBook.isbn }}</span>
              </div>
              <div v-if="selectedBook.publisher">
                <span class="font-medium text-gray-700">Publisher:</span>
                <span class="ml-2 text-gray-600">{{ selectedBook.publisher }}</span>
              </div>
              <div v-if="selectedBook.publication_year">
                <span class="font-medium text-gray-700">Year:</span>
                <span class="ml-2 text-gray-600">{{ selectedBook.publication_year }}</span>
              </div>
              <div v-if="selectedBook.genre">
                <span class="font-medium text-gray-700">Genre:</span>
                <span class="ml-2 text-blue-600">{{ selectedBook.genre }}</span>
              </div>
              <div v-if="selectedBook.language">
                <span class="font-medium text-gray-700">Language:</span>
                <span class="ml-2 text-gray-600">{{ selectedBook.language }}</span>
              </div>
            </div>

            <!-- Availability Status -->
            <div class="pt-3 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Availability:</span>
                <div class="flex items-center">
                  <div
                    :class="[
                      'w-2 h-2 rounded-full mr-2',
                      selectedBook.available_copies > 0 ? 'bg-green-400' : 'bg-red-400'
                    ]"
                  ></div>
                  <span class="text-sm font-medium" :class="selectedBook.available_copies > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ selectedBook.available_copies }}/{{ selectedBook.total_copies }} available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div v-if="selectedBook.description" class="pt-4 border-t border-gray-200">
          <h4 class="font-medium text-gray-900 mb-2">Description</h4>
          <p class="text-gray-600 text-sm leading-relaxed">{{ selectedBook.description }}</p>
        </div>
      </div>

      <template #footer>
        <AppButton variant="outline" @click="showBookModal = false">
          Close
        </AppButton>
        <AppButton
          v-if="selectedBook?.available_copies && selectedBook.available_copies > 0"
          class="ml-3"
          @click="borrowSelectedBook"
        >
          Borrow Book
        </AppButton>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBooksStore } from '@/stores/books'
import { useBorrowingStore } from '@/stores/borrowing'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppModal from '@/components/ui/AppModal.vue'

const router = useRouter()
const authStore = useAuthStore()
const booksStore = useBooksStore()
const borrowingStore = useBorrowingStore()

const user = computed(() => authStore.user)
const books = computed(() => booksStore.books)
const pagination = computed(() => booksStore.pagination)

const searchQuery = ref('')
const selectedGenre = ref('')
const showAvailableOnly = ref(false)
const currentPage = ref(1)

const showBookModal = ref(false)
const selectedBook = ref<any>(null)

const visiblePages = computed(() => {
  if (!pagination.value) return []
  
  const total = pagination.value.total_pages
  const current = pagination.value.current_page
  const pages = []
  
  // Show up to 5 pages around current page
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

let searchTimeout: number | null = null

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = window.setTimeout(() => {
    currentPage.value = 1
    fetchBooks()
  }, 300)
}

const fetchBooks = async () => {
  const params: any = {
    page: currentPage.value,
    limit: 12
  }
  
  if (searchQuery.value.trim()) {
    params.search = searchQuery.value.trim()
  }
  
  if (selectedGenre.value) {
    params.genre = selectedGenre.value
  }
  
  if (showAvailableOnly.value) {
    params.available = true
  }
  
  await booksStore.fetchBooks(params)
}

const goToPage = (page: number) => {
  currentPage.value = page
  fetchBooks()
}

const openBookDetails = (book: any) => {
  selectedBook.value = book
  showBookModal.value = true
}

const borrowBook = async (book: any) => {
  const result = await borrowingStore.borrowBook(book.id)
  
  if (result.success) {
    // Update book's available copies
    book.available_copies--
    alert('Book borrowed successfully!')
  } else {
    alert(result.message || 'Failed to borrow book')
  }
}

const borrowSelectedBook = async () => {
  if (selectedBook.value) {
    await borrowBook(selectedBook.value)
    showBookModal.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  fetchBooks()
})

watch([selectedGenre, showAvailableOnly], () => {
  currentPage.value = 1
  fetchBooks()
})
</script>