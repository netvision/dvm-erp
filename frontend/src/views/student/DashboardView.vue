<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
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
            :class="{ 'border-blue-500 text-blue-600': $route.name === 'student-dashboard' }"
          >
            Dashboard
          </router-link>
          <router-link
            to="/student/books"
            class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            :class="{ 'border-blue-500 text-blue-600': $route.name === 'student-books' }"
          >
            Browse Books
          </router-link>
          <router-link
            to="/student/borrowed"
            class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            :class="{ 'border-blue-500 text-blue-600': $route.name === 'student-borrowed' }"
          >
            My Books
          </router-link>
          <router-link
            to="/student/profile"
            class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            :class="{ 'border-blue-500 text-blue-600': $route.name === 'student-profile' }"
          >
            Profile
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <!-- Welcome Section -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {{ user?.first_name }}!
          </h2>
          <p class="text-gray-600">Here's an overview of your library activity.</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <!-- Books Borrowed -->
          <AppCard>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.754 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Books Borrowed</p>
                <p class="text-2xl font-semibold text-gray-900">{{ activeBorrows.length }}</p>
              </div>
            </div>
          </AppCard>

          <!-- Overdue Books -->
          <AppCard>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Overdue Books</p>
                <p class="text-2xl font-semibold text-gray-900">{{ overdueBorrows.length }}</p>
              </div>
            </div>
          </AppCard>

          <!-- Total Fines -->
          <AppCard>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Outstanding Fines</p>
                <p class="text-2xl font-semibold text-gray-900">${{ totalFines.toFixed(2) }}</p>
              </div>
            </div>
          </AppCard>

          <!-- Books Returned -->
          <AppCard>
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Books Returned</p>
                <p class="text-2xl font-semibold text-gray-900">{{ returnedBorrows.length }}</p>
              </div>
            </div>
          </AppCard>
        </div>

        <!-- Current Books & Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Currently Borrowed Books -->
          <AppCard title="Currently Borrowed Books">
            <div v-if="activeBorrows.length === 0" class="text-center py-6">
              <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.754 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No books borrowed</h3>
              <p class="mt-1 text-sm text-gray-500">Visit our library to browse and borrow books.</p>
              <div class="mt-6">
                <router-link
                  to="/student/books"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Browse Books
                </router-link>
              </div>
            </div>
            
            <div v-else class="space-y-3">
              <div
                v-for="borrow in activeBorrows.slice(0, 5)"
                :key="borrow.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div class="flex-1">
                  <h4 class="text-sm font-medium text-gray-900">{{ borrow.book?.title }}</h4>
                  <p class="text-sm text-gray-500">by {{ borrow.book?.author }}</p>
                  <p class="text-xs text-gray-400">
                    Due: {{ formatDate(borrow.due_date) }}
                    <span v-if="isOverdue(borrow.due_date)" class="text-red-500 font-medium ml-1">(Overdue)</span>
                  </p>
                </div>
                <div class="ml-4">
                  <AppButton size="sm" variant="outline" @click="renewBook(borrow.id)">
                    Renew
                  </AppButton>
                </div>
              </div>
              
              <div v-if="activeBorrows.length > 5" class="text-center pt-2">
                <router-link
                  to="/student/borrowed"
                  class="text-sm text-blue-600 hover:text-blue-500 font-medium"
                >
                  View all borrowed books
                </router-link>
              </div>
            </div>
          </AppCard>

          <!-- Quick Actions -->
          <AppCard title="Quick Actions">
            <div class="space-y-4">
              <router-link
                to="/student/books"
                class="block w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">Search Books</p>
                    <p class="text-sm text-gray-500">Find books by title, author, or genre</p>
                  </div>
                </div>
              </router-link>

              <router-link
                to="/student/borrowed"
                class="block w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">Manage Borrowed Books</p>
                    <p class="text-sm text-gray-500">Return books and pay fines</p>
                  </div>
                </div>
              </router-link>

              <router-link
                to="/student/profile"
                class="block w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm font-medium text-gray-900">Update Profile</p>
                    <p class="text-sm text-gray-500">Change password and personal info</p>
                  </div>
                </div>
              </router-link>
            </div>
          </AppCard>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBorrowingStore } from '@/stores/borrowing'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const borrowingStore = useBorrowingStore()

const user = computed(() => authStore.user)
const activeBorrows = computed(() => borrowingStore.activeBorrows)
const overdueBorrows = computed(() => borrowingStore.overdueBorrows)
const returnedBorrows = computed(() => borrowingStore.returnedBorrows)
const totalFines = computed(() => borrowingStore.totalFines)

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const isOverdue = (dueDateString: string) => {
  const dueDate = new Date(dueDateString)
  const today = new Date()
  return dueDate < today
}

const renewBook = async (borrowId: number) => {
  // Calculate new due date (2 weeks from today)
  const newDueDate = new Date()
  newDueDate.setDate(newDueDate.getDate() + 14)
  
  const result = await borrowingStore.renewBook(borrowId, newDueDate.toISOString().split('T')[0]!)
  
  if (result.success) {
    // Show success message or toast
    alert('Book renewed successfully!')
  } else {
    alert(result.message || 'Failed to renew book')
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  // Load user's borrowed books
  await borrowingStore.fetchUserBorrows()
})
</script>