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
          >
            Dashboard
          </router-link>
          <router-link
            to="/student/books"
            class="border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
          >
            Browse Books
          </router-link>
          <router-link
            to="/student/borrowed"
            class="border-b-2 border-blue-500 text-blue-600 py-4 px-1 text-sm font-medium"
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
          <h2 class="text-2xl font-bold text-gray-900 mb-2">My Borrowed Books</h2>
          <p class="text-gray-600">Manage your borrowed books, renewals, and fines.</p>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
                <p class="text-sm font-medium text-gray-500">Currently Borrowed</p>
                <p class="text-2xl font-semibold text-gray-900">{{ activeBorrows.length }}</p>
              </div>
            </div>
          </AppCard>

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
                <p class="text-sm font-medium text-gray-500">Overdue</p>
                <p class="text-2xl font-semibold text-gray-900">{{ overdueBorrows.length }}</p>
              </div>
            </div>
          </AppCard>

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
                <p class="text-sm font-medium text-gray-500">Total Fines</p>
                <p class="text-2xl font-semibold text-gray-900">${{ totalFines.toFixed(2) }}</p>
              </div>
            </div>
          </AppCard>

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
                <p class="text-sm font-medium text-gray-500">Total Returned</p>
                <p class="text-2xl font-semibold text-gray-900">{{ returnedBorrows.length }}</p>
              </div>
            </div>
          </AppCard>
        </div>

        <!-- Filter Tabs -->
        <div class="mb-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8">
              <button
                @click="activeTab = 'active'"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'active'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Currently Borrowed ({{ activeBorrows.length }})
              </button>
              <button
                @click="activeTab = 'overdue'"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'overdue'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                Overdue ({{ overdueBorrows.length }})
              </button>
              <button
                @click="activeTab = 'returned'"
                :class="[
                  'py-2 px-1 border-b-2 font-medium text-sm',
                  activeTab === 'returned'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                History ({{ returnedBorrows.length }})
              </button>
            </nav>
          </div>
        </div>

        <!-- Books List -->
        <div class="space-y-4">
          <!-- Loading State -->
          <div v-if="borrowingStore.loading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>

          <!-- Empty State -->
          <div v-else-if="displayedBorrows.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.754 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No books found</h3>
            <p class="mt-1 text-sm text-gray-500">
              {{ activeTab === 'active' ? 'You haven\'t borrowed any books yet.' : 
                 activeTab === 'overdue' ? 'No overdue books.' : 'No returned books.' }}
            </p>
            <div v-if="activeTab === 'active'" class="mt-6">
              <router-link
                to="/student/books"
                class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Books
              </router-link>
            </div>
          </div>

          <!-- Books List -->
          <AppCard
            v-else
            v-for="borrow in displayedBorrows"
            :key="borrow.id"
            class="hover:shadow-md transition-shadow duration-200"
          >
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div class="flex-1 mb-4 sm:mb-0">
                <div class="flex items-start space-x-4">
                  <!-- Book Icon -->
                  <div class="w-16 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.754 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>

                  <!-- Book Details -->
                  <div class="flex-1 min-w-0">
                    <h3 class="text-lg font-medium text-gray-900 mb-1">{{ borrow.book?.title }}</h3>
                    <p class="text-sm text-gray-600 mb-2">by {{ borrow.book?.author }}</p>
                    
                    <div class="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Borrowed: {{ formatDate(borrow.borrow_date) }}</span>
                      <span>Due: {{ formatDate(borrow.due_date) }}</span>
                      <span v-if="borrow.return_date">Returned: {{ formatDate(borrow.return_date) }}</span>
                    </div>

                    <!-- Status Badges -->
                    <div class="mt-2 flex items-center space-x-2">
                      <span
                        :class="[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          borrow.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          borrow.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-green-100 text-green-800'
                        ]"
                      >
                        {{ borrow.status.charAt(0).toUpperCase() + borrow.status.slice(1) }}
                      </span>
                      
                      <span v-if="borrow.fine_amount && borrow.fine_amount > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Fine: ${{ borrow.fine_amount.toFixed(2) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div v-if="borrow.status !== 'returned'" class="flex flex-col sm:flex-row gap-2 sm:ml-6">
                <AppButton
                  v-if="borrow.status === 'active'"
                  size="sm"
                  variant="outline"
                  @click="renewBook(borrow.id)"
                >
                  Renew
                </AppButton>
                
                <AppButton
                  v-if="borrow.fine_amount && borrow.fine_amount > 0"
                  size="sm"
                  variant="success"
                  @click="payFine(borrow.id)"
                >
                  Pay Fine
                </AppButton>

                <AppButton
                  size="sm"
                  @click="returnBook(borrow.id)"
                >
                  Return Book
                </AppButton>
              </div>
            </div>
          </AppCard>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

const activeTab = ref<'active' | 'overdue' | 'returned'>('active')

const displayedBorrows = computed(() => {
  switch (activeTab.value) {
    case 'active':
      return activeBorrows.value
    case 'overdue':
      return overdueBorrows.value
    case 'returned':
      return returnedBorrows.value
    default:
      return []
  }
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const renewBook = async (borrowId: number) => {
  // Calculate new due date (2 weeks from today)
  const newDueDate = new Date()
  newDueDate.setDate(newDueDate.getDate() + 14)
  
  const result = await borrowingStore.renewBook(borrowId, newDueDate.toISOString().split('T')[0]!)
  
  if (result.success) {
    alert('Book renewed successfully!')
    await borrowingStore.fetchUserBorrows()
  } else {
    alert(result.message || 'Failed to renew book')
  }
}

const returnBook = async (borrowId: number) => {
  if (confirm('Are you sure you want to return this book?')) {
    const result = await borrowingStore.returnBook(borrowId)
    
    if (result.success) {
      alert('Book returned successfully!')
      await borrowingStore.fetchUserBorrows()
    } else {
      alert(result.message || 'Failed to return book')
    }
  }
}

const payFine = async (borrowId: number) => {
  if (confirm('Pay the fine for this book?')) {
    const result = await borrowingStore.payFine(borrowId)
    
    if (result.success) {
      alert('Fine paid successfully!')
      await borrowingStore.fetchUserBorrows()
    } else {
      alert(result.message || 'Failed to pay fine')
    }
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  await borrowingStore.fetchUserBorrows()
})
</script>