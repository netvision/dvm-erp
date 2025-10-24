<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          My Bookmarks
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          Books you've saved for later
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingSpinner size="lg" text="Loading your bookmarks..." />
    </div>

    <!-- Empty State -->
    <div v-else-if="bookmarks.length === 0" class="text-center py-12">
      <HeartIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No bookmarks yet</h3>
      <p class="mt-1 text-sm text-gray-500">Save books you're interested in for easy access later.</p>
      <div class="mt-6">
        <router-link
          to="/student/books"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Browse Books
        </router-link>
      </div>
    </div>

    <!-- Bookmarks Grid -->
    <div v-else>
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="bookmark in bookmarks"
          :key="bookmark.id"
          class="group relative bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
        >
          <div class="aspect-w-3 aspect-h-4">
            <img
              v-if="bookmark.book?.cover_image"
              :src="bookmark.book.cover_image"
              :alt="bookmark.book?.title"
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
              {{ bookmark.book?.title || bookmark.book_title || 'Unknown Title' }}
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ bookmark.book?.author || bookmark.book_author || 'Unknown Author' }}
            </p>
            <p v-if="bookmark.book?.genre" class="mt-1 text-xs text-gray-400">
              {{ bookmark.book.genre }}
            </p>
            
            <!-- Bookmark Date -->
            <p class="mt-2 text-xs text-gray-400">
              Bookmarked {{ formatDate(bookmark.created_at) }}
            </p>

            <!-- Notes -->
            <div v-if="bookmark.notes" class="mt-2">
              <p class="text-xs font-medium text-gray-500">Notes:</p>
              <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ bookmark.notes }}</p>
            </div>
            
            <div class="mt-4 flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span
                  v-if="bookmark.book"
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    bookmark.book.available_copies > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ bookmark.book.available_copies > 0 ? 'Available' : 'Unavailable' }}
                </span>
                <span v-if="bookmark.book" class="text-xs text-gray-500">
                  {{ bookmark.book.available_copies }}/{{ bookmark.book.total_copies }}
                </span>
              </div>
              
              <div class="flex items-center space-x-2">
                <button
                  @click="removeBookmark(bookmark)"
                  :disabled="removeLoading[bookmark.id]"
                  class="text-red-400 hover:text-red-500 transition-colors"
                >
                  <HeartIcon class="h-5 w-5 fill-red-400" />
                </button>
                
                <button
                  v-if="bookmark.book && bookmark.book.available_copies > 0"
                  @click="borrowBook(bookmark.book)"
                  :disabled="borrowLoading[bookmark.book.id]"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <span v-if="borrowLoading[bookmark.book.id]">Borrowing...</span>
                  <span v-else>Borrow</span>
                </button>
                
                <button
                  v-else-if="bookmark.book"
                  disabled
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-500 bg-gray-100 cursor-not-allowed"
                >
                  Unavailable
                </button>
              </div>
            </div>
            
            <button
              @click="viewBookDetails(bookmark.book || bookmark)"
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
import { ref, reactive, onMounted } from 'vue'
import { BookOpenIcon, HeartIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import type { Bookmark, Book } from '@/types'
import axios from 'axios'

interface BookmarkWithBook extends Bookmark {
  book?: Book
}

const loading = ref(true)
const bookmarks = ref<BookmarkWithBook[]>([])
const removeLoading = reactive<Record<number, boolean>>({})
const borrowLoading = reactive<Record<number, boolean>>({})

const pagination = reactive({
  current_page: 1,
  per_page: 12,
  total: 0,
  total_pages: 0
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const fetchBookmarks = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current_page,
      limit: pagination.per_page
    }
    
    const response = await axios.get('/bookmarks', { params })
    const data = response.data.data || response.data
    
    if (Array.isArray(data)) {
      bookmarks.value = data
      pagination.total = data.length
      pagination.total_pages = 1
    } else {
      bookmarks.value = data.items || []
      pagination.current_page = data.pagination?.current_page || 1
      pagination.per_page = data.pagination?.per_page || 12
      pagination.total = data.pagination?.total || 0
      pagination.total_pages = data.pagination?.total_pages || 1
    }
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    bookmarks.value = []
  } finally {
    loading.value = false
  }
}

const removeBookmark = async (bookmark: BookmarkWithBook) => {
  removeLoading[bookmark.id] = true
  try {
    await axios.delete(`/bookmarks/${bookmark.id}`)
    
    // Remove from local list
    bookmarks.value = bookmarks.value.filter(b => b.id !== bookmark.id)
    
    alert('Bookmark removed successfully!')
  } catch (error) {
    console.error('Error removing bookmark:', error)
    alert('Failed to remove bookmark. Please try again.')
  } finally {
    removeLoading[bookmark.id] = false
  }
}

const borrowBook = async (book: Book) => {
  if (book.available_copies <= 0) return
  
  borrowLoading[book.id] = true
  try {
    await axios.post('/borrow', { book_id: book.id })
    
    // Update book availability locally
    const bookmarkIndex = bookmarks.value.findIndex(b => b.book?.id === book.id)
    if (bookmarkIndex !== -1 && bookmarks.value[bookmarkIndex]?.book) {
      bookmarks.value[bookmarkIndex].book!.available_copies--
    }
    
    alert('Book borrowed successfully!')
  } catch (error) {
    console.error('Error borrowing book:', error)
    alert('Failed to borrow book. Please try again.')
  } finally {
    borrowLoading[book.id] = false
  }
}

const viewBookDetails = (book: Book | BookmarkWithBook) => {
  const isBookmark = 'book_title' in book
  const title = isBookmark ? book.book_title : (book as Book).title
  const author = isBookmark ? book.book_author : (book as Book).author
  const bookData = isBookmark ? book.book : book as Book
  
  const details = `
Title: ${title || 'Unknown'}
Author: ${author || 'Unknown'}
${bookData?.isbn ? `ISBN: ${bookData.isbn}` : ''}
${bookData?.genre ? `Genre: ${bookData.genre}` : ''}
${bookData?.description ? `\nDescription: ${bookData.description}` : ''}
${bookData?.available_copies !== undefined ? `Available: ${bookData.available_copies}/${bookData.total_copies} copies` : ''}
  `.trim()
  
  alert(details)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.total_pages) {
    pagination.current_page = page
    fetchBookmarks()
  }
}

onMounted(() => {
  fetchBookmarks()
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