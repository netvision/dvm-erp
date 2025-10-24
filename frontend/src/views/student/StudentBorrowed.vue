<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          My Borrowed Books
        </h2>
        <p class="mt-1 text-sm text-gray-500">
          View and manage your currently borrowed books
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <LoadingSpinner size="lg" text="Loading your books..." />
    </div>

    <!-- Empty State -->
    <div v-else-if="borrowedBooks.length === 0" class="text-center py-12">
      <BookOpenIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">No borrowed books</h3>
      <p class="mt-1 text-sm text-gray-500">You haven't borrowed any books yet.</p>
      <div class="mt-6">
        <router-link
          to="/student/books"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Browse Books
        </router-link>
      </div>
    </div>

    <!-- Borrowed Books List -->
    <div v-else class="space-y-4">
      <div
        v-for="record in borrowedBooks"
        :key="record.id"
        class="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
      >
        <div class="p-6">
          <div class="flex items-start space-x-4">
            <!-- Book Cover -->
            <div class="flex-shrink-0">
              <img
                v-if="record.book?.cover_image"
                :src="record.book.cover_image"
                :alt="record.book?.title"
                class="h-24 w-16 object-cover rounded"
              />
              <div
                v-else
                class="h-24 w-16 bg-gray-100 rounded flex items-center justify-center"
              >
                <BookOpenIcon class="h-8 w-8 text-gray-400" />
              </div>
            </div>

            <!-- Book Details -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h3 class="text-lg font-medium text-gray-900 truncate">
                    {{ record.book?.title || record.book_title || 'Unknown Title' }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-1">
                    by {{ record.book?.author || record.book_author || 'Unknown Author' }}
                  </p>
                  
                  <!-- Borrow Details -->
                  <div class="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                    <div>
                      <span class="font-medium">Borrowed:</span>
                      {{ formatDate(record.borrow_date) }}
                    </div>
                    <div>
                      <span class="font-medium">Due:</span>
                      {{ formatDate(record.due_date) }}
                    </div>
                    <div v-if="record.return_date">
                      <span class="font-medium">Returned:</span>
                      {{ formatDate(record.return_date) }}
                    </div>
                  </div>

                  <!-- Condition Notes -->
                  <div v-if="record.condition_notes" class="mt-2">
                    <span class="text-xs font-medium text-gray-500">Notes:</span>
                    <p class="text-sm text-gray-600 mt-1">{{ record.condition_notes }}</p>
                  </div>
                </div>

                <!-- Status and Actions -->
                <div class="flex flex-col items-end space-y-2">
                  <!-- Status Badge -->
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStatusClasses(record)
                    ]"
                  >
                    {{ getStatusText(record) }}
                  </span>

                  <!-- Due Date Warning -->
                  <div v-if="record.status === 'borrowed'" class="text-right">
                    <p v-if="isOverdue(record.due_date)" class="text-xs text-red-600 font-medium">
                      Overdue by {{ getDaysOverdue(record.due_date) }} day(s)
                    </p>
                    <p v-else-if="isDueSoon(record.due_date)" class="text-xs text-yellow-600 font-medium">
                      Due in {{ getDaysUntilDue(record.due_date) }} day(s)
                    </p>
                    <p v-else class="text-xs text-gray-500">
                      {{ getDaysUntilDue(record.due_date) }} days remaining
                    </p>
                  </div>

                  <!-- Fine Amount -->
                  <div v-if="record.fine_amount && record.fine_amount > 0" class="text-right">
                    <span class="text-xs font-medium text-red-600">
                      Fine: ${{ record.fine_amount.toFixed(2) }}
                    </span>
                  </div>

                  <!-- Return Button -->
                  <button
                    v-if="record.status === 'borrowed'"
                    @click="returnBook(record)"
                    :disabled="returnLoading[record.id]"
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <span v-if="returnLoading[record.id]">Returning...</span>
                    <span v-else>Return Book</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
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
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import type { BorrowRecord, Book } from '@/types'
import axios from 'axios'

interface BorrowRecordWithBook extends BorrowRecord {
  book?: Book
}

const loading = ref(true)
const borrowedBooks = ref<BorrowRecordWithBook[]>([])
const returnLoading = reactive<Record<number, boolean>>({})

const pagination = reactive({
  current_page: 1,
  per_page: 10,
  total: 0,
  total_pages: 0
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date()
}

const isDueSoon = (dueDate: string) => {
  const due = new Date(dueDate)
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000))
  return due <= threeDaysFromNow && due >= now
}

const getDaysOverdue = (dueDate: string) => {
  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = now.getTime() - due.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getDaysUntilDue = (dueDate: string) => {
  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getStatusClasses = (record: BorrowRecordWithBook) => {
  switch (record.status) {
    case 'returned':
      return 'bg-green-100 text-green-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    case 'lost':
      return 'bg-gray-100 text-gray-800'
    default:
      if (isOverdue(record.due_date)) {
        return 'bg-red-100 text-red-800'
      } else if (isDueSoon(record.due_date)) {
        return 'bg-yellow-100 text-yellow-800'
      }
      return 'bg-blue-100 text-blue-800'
  }
}

const getStatusText = (record: BorrowRecordWithBook) => {
  if (record.status === 'borrowed' && isOverdue(record.due_date)) {
    return 'Overdue'
  }
  
  switch (record.status) {
    case 'returned':
      return 'Returned'
    case 'overdue':
      return 'Overdue'
    case 'lost':
      return 'Lost'
    default:
      return 'Borrowed'
  }
}

const fetchBorrowedBooks = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.current_page,
      limit: pagination.per_page
    }
    
    const response = await axios.get('/borrow/current', { params })
    const data = response.data.data || response.data
    
    if (data.current_borrows) {
      borrowedBooks.value = data.current_borrows
      pagination.total = data.current_borrows.length
      pagination.total_pages = 1
    } else if (Array.isArray(data)) {
      borrowedBooks.value = data
      pagination.total = data.length
      pagination.total_pages = 1
    } else {
      borrowedBooks.value = data.items || []
      pagination.current_page = data.pagination?.current_page || 1
      pagination.per_page = data.pagination?.per_page || 10
      pagination.total = data.pagination?.total || 0
      pagination.total_pages = data.pagination?.total_pages || 1
    }
  } catch (error) {
    console.error('Error fetching borrowed books:', error)
    borrowedBooks.value = []
  } finally {
    loading.value = false
  }
}

const returnBook = async (record: BorrowRecordWithBook) => {
  returnLoading[record.id] = true
  try {
    await axios.patch(`/borrow/${record.id}/return`)
    
    // Update the record locally
    const index = borrowedBooks.value.findIndex(b => b.id === record.id)
    if (index !== -1 && borrowedBooks.value[index]) {
      borrowedBooks.value[index].status = 'returned'
      borrowedBooks.value[index].return_date = new Date().toISOString()
    }
    
    alert('Book returned successfully!')
  } catch (error) {
    console.error('Error returning book:', error)
    alert('Failed to return book. Please try again.')
  } finally {
    returnLoading[record.id] = false
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.total_pages) {
    pagination.current_page = page
    fetchBorrowedBooks()
  }
}

onMounted(() => {
  fetchBorrowedBooks()
})
</script>