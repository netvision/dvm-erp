<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              Welcome back, {{ authStore.user?.first_name }}!
            </h1>
            <p class="mt-1 text-sm text-gray-500">
              Manage your library books and explore new titles
            </p>
          </div>
          <div class="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
            <router-link
              to="/student/books"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse Books
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <BookOpenIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Books Borrowed</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.borrowed }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <HeartIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Bookmarks</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.bookmarks }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ClockIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Due Soon</dt>
                <dd class="text-lg font-medium text-gray-900">{{ stats.dueSoon }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ExclamationTriangleIcon class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                <dd class="text-lg font-medium text-red-600">{{ stats.overdue }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Currently Borrowed Books -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Currently Borrowed</h3>
        
        <div v-if="loading" class="flex justify-center py-4">
          <LoadingSpinner text="Loading books..." />
        </div>
        
        <div v-else-if="borrowedBooks.length === 0" class="text-center py-8">
          <BookOpenIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No borrowed books</h3>
          <p class="mt-1 text-sm text-gray-500">Start exploring our collection!</p>
          <div class="mt-6">
            <router-link
              to="/student/books"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse Books
            </router-link>
          </div>
        </div>
        
        <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="record in borrowedBooks"
            :key="record.id"
            class="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div class="flex-shrink-0">
              <!-- Note: Backend doesn't provide cover_image in current borrows, only book_title and book_author -->
              <div class="h-16 w-12 bg-gray-100 rounded flex items-center justify-center">
                <BookOpenIcon class="h-6 w-6 text-gray-400" />
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <router-link :to="`/student/books/${record.book_id}`" class="focus:outline-none">
                <span class="absolute inset-0" aria-hidden="true" />
                <p class="text-sm font-medium text-gray-900 truncate">{{ record.book_title }}</p>
                <p class="text-sm text-gray-500 truncate">{{ record.book_author }}</p>
                <p class="text-xs text-gray-400 mt-1">
                  Due: {{ formatDate(record.due_date) }}
                  <span v-if="isOverdue(record.due_date)" class="text-red-600 font-medium">
                    (Overdue)
                  </span>
                  <span v-else-if="isDueSoon(record.due_date)" class="text-yellow-600 font-medium">
                    (Due Soon)
                  </span>
                </p>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
        
        <div v-if="recentActivity.length === 0" class="text-center py-8">
          <ClockIcon class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
          <p class="mt-1 text-sm text-gray-500">Your library activity will appear here</p>
        </div>
        
        <div v-else class="flow-root">
          <ul role="list" class="-mb-8">
            <li v-for="(activity, activityIdx) in recentActivity" :key="activity.id">
              <div class="relative pb-8">
                <span
                  v-if="activityIdx !== recentActivity.length - 1"
                  class="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                      <BookOpenIcon class="h-4 w-4 text-white" />
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">
                        {{ activity.description }} 
                        <span class="font-medium text-gray-900">{{ activity.book_title }}</span>
                      </p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time :datetime="activity.created_at">{{ formatDate(activity.created_at) }}</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  BookOpenIcon, 
  HeartIcon, 
  ClockIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import type { BorrowRecord } from '@/types'
import axios from 'axios'

// The backend returns BorrowRecord with book_title and book_author, not nested book object
interface CurrentBorrowRecord extends BorrowRecord {
  book_title: string
  book_author: string
}

interface Activity {
  id: number
  description: string
  book_title: string
  created_at: string
}

const authStore = useAuthStore()
const loading = ref(true)
const borrowedBooks = ref<CurrentBorrowRecord[]>([])
const recentActivity = ref<Activity[]>([])

const stats = computed(() => ({
  borrowed: borrowedBooks.value.length,
  bookmarks: 0, // TODO: Implement bookmarks
  dueSoon: borrowedBooks.value.filter(record => isDueSoon(record.due_date)).length,
  overdue: borrowedBooks.value.filter(record => isOverdue(record.due_date)).length
}))

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

const fetchBorrowedBooks = async () => {
  try {
    const response = await axios.get('/borrow/current')
    borrowedBooks.value = response.data.data.current_borrows || response.data.data || response.data
  } catch (error) {
    console.error('Error fetching borrowed books:', error)
  }
}

const fetchRecentActivity = async () => {
  try {
    // TODO: Implement activity endpoint
    // const response = await axios.get('/activity/recent')
    // recentActivity.value = response.data.data
    recentActivity.value = []
  } catch (error) {
    console.error('Error fetching recent activity:', error)
  }
}

onMounted(async () => {
  try {
    await Promise.all([
      fetchBorrowedBooks(),
      fetchRecentActivity()
    ])
  } finally {
    loading.value = false
  }
})
</script>