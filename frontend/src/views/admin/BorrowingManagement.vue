<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Modern Header with Gradient -->
    <div class="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold mb-2">Borrowing & Returns</h1>
            <p class="text-lg text-green-100">
              Smart Circulation Management • Real-time Tracking • Automated Workflows
            </p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">{{ borrowingStats.currentlyBorrowed.toLocaleString() }}</div>
            <div class="text-sm text-green-200">Active Borrows</div>
            <div class="text-xs text-green-300 mt-1">{{ borrowingStats.overdueItems }} overdue</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Bar -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center space-x-4 overflow-x-auto">
          <button 
            @click="showBorrowModal = true"
            class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
            <PlusIcon class="w-5 h-5" />
            <span>New Borrow</span>
          </button>
          <button 
            @click="showReturnModal = true" 
            class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors whitespace-nowrap">
            <ArrowUturnLeftIcon class="w-5 h-5" />
            <span>Process Return</span>
          </button>
          <button 
            @click="generateReport" 
            class="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap">
            <DocumentChartBarIcon class="w-5 h-5" />
            <span>Generate Report</span>
          </button>
          <button 
            @click="sendReminders" 
            class="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap">
            <BellIcon class="w-5 h-5" />
            <span>Send Reminders</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-blue-100">
            <BookOpenIcon class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Currently Borrowed</p>
            <p class="text-xl font-bold text-gray-900">{{ borrowingStats.currentlyBorrowed }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-red-100">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Overdue Items</p>
            <p class="text-xl font-bold text-gray-900">{{ borrowingStats.overdueItems }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-green-100">
            <CheckCircleIcon class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Returned Today</p>
            <p class="text-xl font-bold text-gray-900">{{ borrowingStats.returnedToday }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div class="flex items-center">
          <div class="p-3 rounded-lg bg-yellow-100">
            <ClockIcon class="h-6 w-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Due Today</p>
            <p class="text-xl font-bold text-gray-900">{{ borrowingStats.dueToday }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by user or book..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
          <select
            v-model="selectedStatus"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Status</option>
            <option value="borrowed">Currently Borrowed</option>
            <option value="returned">Returned</option>
            <option value="overdue">Overdue</option>
            <option value="due_today">Due Today</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date From</label>
          <input
            v-model="dateFrom"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date To</label>
          <input
            v-model="dateTo"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="searchRecords"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Search
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingSpinner v-if="loading" />

    <!-- Borrowing Records Table -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Borrower
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Book
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Borrow Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Due Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Return Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="record in borrowingRecords" :key="record.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span class="text-white text-xs font-medium">{{ getUserInitials(record) }}</span>
                    </div>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900 dark:text-white">{{ record.user_name }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">{{ record.user_email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900 dark:text-white">{{ record.book_title }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">by {{ record.book_author }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(record.borrow_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ formatDate(record.due_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                {{ record.return_date ? formatDate(record.return_date) : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  getStatusColor(record)
                ]">
                  {{ getStatusText(record) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  v-if="!record.return_date"
                  @click="processReturn(record)"
                  class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                  title="Process Return"
                >
                  <CheckIcon class="h-4 w-4" />
                </button>
                <button
                  v-if="!record.return_date"
                  @click="renewBook(record)"
                  class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  title="Renew Book"
                >
                  <ArrowPathIcon class="h-4 w-4" />
                </button>
                <button
                  @click="sendReminder(record)"
                  class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                  title="Send Reminder"
                >
                  <BellIcon class="h-4 w-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700 dark:text-gray-300">
            Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalRecords) }} of {{ totalRecords }} records
          </div>
          <div class="flex space-x-2">
            <button
              @click="changePage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              @click="changePage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Borrow Modal -->
    <div v-if="showBorrowModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">New Book Borrow</h2>
          
          <form @submit.prevent="processBorrow" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Email *</label>
              <input
                v-model="borrowForm.userEmail"
                type="email"
                required
                placeholder="Enter user email"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Book ISBN/Title *</label>
              <input
                v-model="borrowForm.bookIdentifier"
                type="text"
                required
                placeholder="Enter book ISBN or title"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date *</label>
              <input
                v-model="borrowForm.dueDate"
                type="date"
                required
                :min="new Date().toISOString().split('T')[0]"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showBorrowModal = false"
                class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Process Borrow
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Return Modal -->
    <div v-if="showReturnModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Process Return</h2>
          
          <form @submit.prevent="processReturnById" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Book ISBN/Borrow ID *</label>
              <input
                v-model="returnForm.identifier"
                type="text"
                required
                placeholder="Enter book ISBN or borrow record ID"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
              <textarea
                v-model="returnForm.notes"
                rows="3"
                placeholder="Optional notes about the return"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showReturnModal = false"
                class="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Process Return
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
import { 
  PlusIcon,
  ArrowUturnLeftIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CheckIcon,
  ArrowPathIcon,
  BellIcon,
  DocumentChartBarIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useBorrowingStore } from '@/stores/borrowing'

// Types
interface BorrowingRecord {
  id: number
  user_id: number
  book_id: number
  user_name?: string
  user_email?: string
  book_title?: string
  book_author?: string
  borrow_date: string
  due_date: string
  return_date?: string
  status: 'active' | 'returned' | 'overdue'
  fine_amount?: number
  user?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  book?: {
    id: number
    title: string
    author: string
    isbn?: string
  }
}

interface BorrowingStats {
  currentlyBorrowed: number
  overdueItems: number
  returnedToday: number
  dueToday: number
}

//
// Reactive data
const borrowingStore = useBorrowingStore()

const loading = ref(false)
const borrowingRecords = ref<BorrowingRecord[]>([])
const borrowingStats = ref<BorrowingStats>({
  currentlyBorrowed: 0,
  overdueItems: 0,
  returnedToday: 0,
  dueToday: 0
})

const searchQuery = ref('')
const selectedStatus = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const showBorrowModal = ref(false)
const showReturnModal = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalRecords = ref(0)

// Forms
const borrowForm = ref({
  userEmail: '',
  bookIdentifier: '',
  dueDate: ''
})

const returnForm = ref({
  identifier: '',
  notes: ''
})

// Computed
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))

// Methods
const fetchBorrowingData = async () => {
  try {
    loading.value = true
    
    // Fetch real data from API
    const [borrowsResult, statsResult] = await Promise.all([
      borrowingStore.fetchAllBorrows({
        page: currentPage.value,
        limit: pageSize.value,
        status: selectedStatus.value,
        search: searchQuery.value
      }),
      borrowingStore.fetchBorrowingStats()
    ])
    
    if (borrowsResult.success) {
      // Ensure allBorrows is an array before mapping
      const borrowsArray = Array.isArray(borrowingStore.allBorrows) ? borrowingStore.allBorrows : []
      borrowingRecords.value = borrowsArray.map(record => ({
        ...record,
        user_name: record.user ? `${record.user.first_name} ${record.user.last_name}` : 'Unknown User',
        user_email: record.user?.email || 'Unknown Email',
        book_title: record.book?.title || 'Unknown Book',
        book_author: record.book?.author || 'Unknown Author'
      }))
      totalRecords.value = borrowingStore.pagination?.total || borrowingRecords.value.length
    }
    
    if (statsResult.success && statsResult.stats) {
      borrowingStats.value = {
        currentlyBorrowed: statsResult.stats.total_active || 0,
        overdueItems: statsResult.stats.total_overdue || 0,
        returnedToday: statsResult.stats.returned_today || 0,
        dueToday: statsResult.stats.due_today || 0
      }
    }
    
  } catch (error) {
    console.error('Error fetching borrowing data:', error)
  } finally {
    loading.value = false
  }
}

const searchRecords = async () => {
  currentPage.value = 1 // Reset to first page when searching
  await fetchBorrowingData()
}

const getUserInitials = (record: BorrowingRecord) => {
  if (!record.user_name) return 'U'
  const names = record.user_name.split(' ')
  return names.map(name => name.charAt(0)).join('').toUpperCase()
}

const getStatusColor = (record: BorrowingRecord) => {
  if (record.return_date) {
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
  }
  
  const now = new Date()
  const dueDate = new Date(record.due_date)
  
  if (dueDate < now) {
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  } else if (dueDate.toDateString() === now.toDateString()) {
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
  } else {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
  }
}

const getStatusText = (record: BorrowingRecord) => {
  if (record.return_date) {
    return 'Returned'
  }
  
  const now = new Date()
  const dueDate = new Date(record.due_date)
  
  if (dueDate < now) {
    const overdueDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
    return `Overdue (${overdueDays}d)`
  } else if (dueDate.toDateString() === now.toDateString()) {
    return 'Due Today'
  } else {
    return 'Borrowed'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const processReturn = async (record: BorrowingRecord) => {
  try {
    const result = await borrowingStore.returnBook(record.id)
    if (result.success) {
      await fetchBorrowingData()
    } else {
      alert(`Error: ${result.message}`)
    }
  } catch (error) {
    console.error('Error processing return:', error)
    alert('Failed to process return')
  }
}

const renewBook = async (record: BorrowingRecord) => {
  try {
    const newDueDate = new Date()
    newDueDate.setDate(newDueDate.getDate() + 14)
    
    const result = await borrowingStore.renewBook(record.id, newDueDate.toISOString())
    if (result.success) {
      await fetchBorrowingData()
    } else {
      alert(`Error: ${result.message}`)
    }
  } catch (error) {
    console.error('Error renewing book:', error)
    alert('Failed to renew book')
  }
}

const sendReminder = async (record: BorrowingRecord) => {
  try {
    // TODO: Implement reminder functionality on backend
    console.log('Sending reminder for record:', record.id)
    alert(`Reminder sent to ${record.user_email}`)
  } catch (error) {
    console.error('Error sending reminder:', error)
    alert('Failed to send reminder')
  }
}

const processBorrow = async () => {
  try {
    // For now, this is a simplified implementation
    // In a real-world scenario, you'd want an admin endpoint to borrow on behalf of users
    alert('Note: This feature requires an admin-specific borrow endpoint that allows borrowing on behalf of users. Currently, the API only supports users borrowing for themselves.')
    
    showBorrowModal.value = false
    borrowForm.value = { userEmail: '', bookIdentifier: '', dueDate: '' }
    
    // TODO: Implement admin borrowing functionality when backend supports it
    // This would require a new endpoint like POST /admin/borrow with user_id, book_id, due_date
    
  } catch (error) {
    console.error('Error processing borrow:', error)
    alert('Failed to process borrow')
  }
}

const processReturnById = async () => {
  try {
    // Try to find the borrow record by ID and process return
    const borrowId = parseInt(returnForm.value.identifier)
    if (isNaN(borrowId)) {
      alert('Please enter a valid borrow record ID')
      return
    }
    
    const result = await borrowingStore.returnBook(borrowId)
    if (result.success) {
      showReturnModal.value = false
      returnForm.value = { identifier: '', notes: '' }
      await fetchBorrowingData()
    } else {
      alert(`Error: ${result.message}`)
    }
  } catch (error) {
    console.error('Error processing return:', error)
    alert('Failed to process return')
  }
}

const changePage = async (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    await fetchBorrowingData()
  }
}

// Quick action methods
const generateReport = () => {
  console.log('Generating borrowing report...')
  // TODO: Implement report generation
}

const sendReminders = () => {
  console.log('Sending overdue reminders...')
  // TODO: Implement reminder system
}

// Lifecycle
onMounted(() => {
  fetchBorrowingData()
  
  // Set default due date to 14 days from now
  const defaultDueDate = new Date()
  defaultDueDate.setDate(defaultDueDate.getDate() + 14)
  borrowForm.value.dueDate = defaultDueDate.toISOString().split('T')[0] || ''
})
</script>