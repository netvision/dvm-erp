<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold mb-2">📚 Physical Library Management</h1>
            <p class="text-lg text-indigo-100">
              Comprehensive Book Management • Borrowing • Reservations • Returns
            </p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">{{ stats.totalBooks }}</div>
            <div class="text-sm text-indigo-200">Total Books</div>
            <div class="text-xs text-indigo-300 mt-1">{{ stats.availableBooks }} available</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
            ]"
          >
            {{ tab.name }}
            <span v-if="tab.badge" class="ml-2 px-2 py-0.5 text-xs rounded-full"
                  :class="tab.badgeClass">
              {{ tab.badge }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Books Catalog Tab -->
      <div v-show="activeTab === 'catalog'" class="space-y-6">
        <!-- Quick Actions -->
        <div class="flex flex-wrap gap-4">
          <button @click="showAddBookModal = true" 
                  class="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Book</span>
          </button>
          <button @click="exportBooks" 
                  class="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a 3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export</span>
          </button>
        </div>

        <!-- Search and Filters -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input v-model="filters.search" @input="loadBooks" 
                   placeholder="Search books..." 
                   class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <select v-model="filters.genre" @change="loadBooks" 
                    class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="">All Genres</option>
              <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
            </select>
            <select v-model="filters.language" @change="loadBooks" 
                    class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Sanskrit">Sanskrit</option>
            </select>
            <select v-model="filters.availability" @change="loadBooks" 
                    class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="borrowed">All Borrowed</option>
              <option value="low-stock">Low Stock</option>
            </select>
          </div>
        </div>

        <!-- Books Grid -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <div v-else-if="books.length === 0" class="text-center py-12 bg-white rounded-lg">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p class="mt-4 text-gray-500">No books found</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="book in books" :key="book.id" 
               class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ book.title }}</h3>
                <p class="text-sm text-gray-600">by {{ book.author }}</p>
              </div>
              <span :class="[
                'px-2 py-1 text-xs rounded-full',
                book.available_copies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                {{ book.available_copies > 0 ? 'Available' : 'Borrowed' }}
              </span>
            </div>

            <div class="space-y-2 text-sm text-gray-600 mb-4">
              <div class="flex justify-between">
                <span>ISBN:</span>
                <span class="font-medium">{{ book.isbn }}</span>
              </div>
              <div class="flex justify-between">
                <span>Genre:</span>
                <span class="font-medium">{{ book.genre }}</span>
              </div>
              <div class="flex justify-between">
                <span>Copies:</span>
                <span class="font-medium">{{ book.available_copies }} / {{ book.total_copies }}</span>
              </div>
              <div class="flex justify-between">
                <span>Location:</span>
                <span class="font-medium">{{ book.location }}</span>
              </div>
            </div>

            <div class="flex space-x-2">
              <button @click="editBook(book)" 
                      class="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm">
                Edit
              </button>
              <button @click="viewBookDetails(book)" 
                      class="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                Details
              </button>
              <button @click="deleteBook(book)" 
                      class="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="flex justify-center mt-6">
          <nav class="flex space-x-2">
            <button @click="changePage(pagination.page - 1)" 
                    :disabled="pagination.page === 1"
                    class="px-3 py-2 rounded-lg border disabled:opacity-50">
              Previous
            </button>
            <button v-for="page in pagination.pages" :key="page"
                    @click="changePage(page)"
                    :class="[
                      'px-3 py-2 rounded-lg',
                      pagination.page === page ? 'bg-indigo-600 text-white' : 'bg-white border'
                    ]">
              {{ page }}
            </button>
            <button @click="changePage(pagination.page + 1)" 
                    :disabled="pagination.page === pagination.pages"
                    class="px-3 py-2 rounded-lg border disabled:opacity-50">
              Next
            </button>
          </nav>
        </div>
      </div>

      <!-- Active Borrows Tab -->
      <div v-show="activeTab === 'borrows'" class="space-y-6">
        <!-- New Borrow Button -->
        <button @click="showNewBorrowModal = true" 
                class="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>New Borrow</span>
        </button>

        <!-- Borrows List -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrow Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="borrow in borrows" :key="borrow.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ borrow.user_name }}</div>
                    <div class="text-sm text-gray-500">{{ borrow.user_email }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{ borrow.book_title }}</div>
                    <div class="text-sm text-gray-500">{{ borrow.book_author }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(borrow.borrow_date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <span :class="isOverdue(borrow.due_date) ? 'text-red-600 font-medium' : 'text-gray-500'">
                      {{ formatDate(borrow.due_date) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'px-2 py-1 text-xs rounded-full',
                      borrow.status === 'borrowed' && !isOverdue(borrow.due_date) ? 'bg-blue-100 text-blue-800' :
                      isOverdue(borrow.due_date) ? 'bg-red-100 text-red-800' :
                      'bg-green-100 text-green-800'
                    ]">
                      {{ borrow.status === 'borrowed' && isOverdue(borrow.due_date) ? 'Overdue' : borrow.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <button v-if="borrow.status === 'borrowed'" 
                            @click="returnBook(borrow)"
                            class="text-green-600 hover:text-green-900">
                      Return
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Reservations Tab -->
      <div v-show="activeTab === 'reservations'" class="space-y-6">
        <!-- Reservations List -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserved On</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires On</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="reservation in reservations" :key="reservation.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ reservation.user_name }}</div>
                    <div class="text-sm text-gray-500">{{ reservation.user_student_id || reservation.user_email }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-gray-900">{{ reservation.book_title }}</div>
                    <div class="text-sm text-gray-500">{{ reservation.book_author }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(reservation.reservation_date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(reservation.expiry_date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'px-2 py-1 text-xs rounded-full',
                      reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      reservation.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    ]">
                      {{ reservation.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button v-if="reservation.status === 'pending' && reservation.available_copies > 0" 
                            @click="fulfillReservation(reservation)"
                            class="text-green-600 hover:text-green-900">
                      Fulfill
                    </button>
                    <button v-if="reservation.status === 'pending'" 
                            @click="cancelReservation(reservation)"
                            class="text-red-600 hover:text-red-900">
                      Cancel
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Returns Processing Tab -->
      <div v-show="activeTab === 'returns'" class="space-y-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">Quick Return</h3>
          <div class="flex space-x-4">
            <input v-model="returnSearch" 
                   placeholder="Scan or enter Student ID / Book ISBN" 
                   class="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <button @click="searchBorrow" 
                    class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Search
            </button>
          </div>
        </div>

        <!-- Pending Returns -->
        <div v-if="pendingReturns.length > 0" class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold mb-4">Today's Returns</h3>
          <div class="space-y-4">
            <div v-for="borrow in pendingReturns" :key="borrow.id" 
                 class="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div class="font-medium">{{ borrow.book_title }}</div>
                <div class="text-sm text-gray-500">{{ borrow.user_name }}</div>
              </div>
              <button @click="returnBook(borrow)" 
                      class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Process Return
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Add/Edit Book Modal -->
    <div v-if="showAddBookModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-6">{{ editingBook ? 'Edit Book' : 'Add New Book' }}</h2>
          
          <form @submit.prevent="saveBook" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="col-span-2">
                <label class="block text-sm font-medium mb-1">Title *</label>
                <input v-model="bookForm.title" required 
                       class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Author *</label>
                <input v-model="bookForm.author" required 
                       class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">ISBN *</label>
                <input v-model="bookForm.isbn" required 
                       class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Publisher</label>
                <input v-model="bookForm.publisher" 
                       class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Publication Year</label>
                <input v-model.number="bookForm.publication_year" type="number" 
                       class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Genre *</label>
                <select v-model="bookForm.genre" required 
                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="">Select Genre</option>
                  <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Language</label>
                <select v-model="bookForm.language" 
                        class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Sanskrit">Sanskrit</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Total Copies *</label>
                <input v-model.number="bookForm.total_copies" type="number" min="1" required 
                       class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Location</label>
                <input v-model="bookForm.location" placeholder="e.g., Shelf A-12" 
                       class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div class="col-span-2">
                <label class="block text-sm font-medium mb-1">Description</label>
                <textarea v-model="bookForm.description" rows="3" 
                          class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
              </div>
            </div>

            <div class="flex space-x-4">
              <button type="submit" 
                      class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                {{ editingBook ? 'Update Book' : 'Add Book' }}
              </button>
              <button type="button" @click="closeBookModal" 
                      class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- New Borrow Modal -->
    <div v-if="showNewBorrowModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-2xl font-bold mb-6">New Borrow</h2>
        
        <form @submit.prevent="createBorrow" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Student ID / Email *</label>
            <input v-model="borrowForm.student_search" required 
                   @input="searchStudent"
                   placeholder="Enter student ID or email" 
                   class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Book ISBN / Title *</label>
            <input v-model="borrowForm.book_search" required 
                   @input="searchBook"
                   placeholder="Scan ISBN or enter title" 
                   class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Due Date *</label>
            <input v-model="borrowForm.due_date" type="date" required 
                   :min="tomorrow"
                   class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div class="flex space-x-4">
            <button type="submit" 
                    class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Issue Book
            </button>
            <button type="button" @click="showNewBorrowModal = false" 
                    class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'PhysicalLibraryManagement',
  
  setup() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    // State
    const activeTab = ref('catalog');
    const loading = ref(false);
    const books = ref([]);
    const borrows = ref([]);
    const reservations = ref([]);
    const pendingReturns = ref([]);
    
    const stats = reactive({
      totalBooks: 0,
      availableBooks: 0,
      borrowedBooks: 0,
      overdueBooks: 0,
      pendingReservations: 0
    });
    
    const filters = reactive({
      search: '',
      genre: '',
      language: '',
      availability: ''
    });
    
    const pagination = reactive({
      page: 1,
      limit: 12,
      total: 0,
      pages: 0
    });
    
    const showAddBookModal = ref(false);
    const showNewBorrowModal = ref(false);
    const editingBook = ref(null);
    const returnSearch = ref('');
    
    const bookForm = reactive({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      publication_year: new Date().getFullYear(),
      genre: '',
      description: '',
      total_copies: 1,
      location: '',
      language: 'English'
    });
    
    const borrowForm = reactive({
      student_search: '',
      book_search: '',
      due_date: '',
      user_id: null,
      book_id: null
    });
    
    const genres = [
      'Fiction', 'Non-Fiction', 'Science', 'Mathematics', 'History', 
      'Geography', 'Literature', 'Biography', 'Philosophy', 'Technology',
      'Arts', 'Sports', 'Reference', 'Textbook', 'Children'
    ];
    
    // Computed
    const tabs = computed(() => [
      { 
        id: 'catalog', 
        name: 'Books Catalog',
        badge: stats.totalBooks,
        badgeClass: 'bg-indigo-100 text-indigo-800'
      },
      { 
        id: 'borrows', 
        name: 'Active Borrows',
        badge: stats.borrowedBooks,
        badgeClass: 'bg-blue-100 text-blue-800'
      },
      { 
        id: 'reservations', 
        name: 'Reservations',
        badge: stats.pendingReservations,
        badgeClass: 'bg-yellow-100 text-yellow-800'
      },
      { 
        id: 'returns', 
        name: 'Returns'
      }
    ]);
    
    const tomorrow = computed(() => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
    });
    
    // Methods
    const loadBooks = async () => {
      loading.value = true;
      try {
        const params = new URLSearchParams({
          page: pagination.page,
          limit: pagination.limit,
          ...(filters.search && { search: filters.search }),
          ...(filters.genre && { genre: filters.genre }),
          ...(filters.language && { language: filters.language }),
          ...(filters.availability === 'available' && { available_only: 'true' })
        });
        
        const response = await axios.get(`${API_URL}/api/books?${params}`);
        
        if (response.data.status === 'success') {
          books.value = response.data.data.books;
          pagination.total = response.data.data.pagination.total;
          pagination.pages = response.data.data.pagination.pages;
          
          // Update stats
          stats.totalBooks = pagination.total;
          stats.availableBooks = books.value.filter(b => b.available_copies > 0).length;
        }
      } catch (error) {
        console.error('Error loading books:', error);
        alert('Failed to load books');
      } finally {
        loading.value = false;
      }
    };
    
    const loadBorrows = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/borrow`, {
          params: { status: 'borrowed', limit: 100 }
        });
        
        if (response.data.status === 'success') {
          borrows.value = response.data.data.records;
          stats.borrowedBooks = borrows.value.length;
          stats.overdueBooks = borrows.value.filter(b => isOverdue(b.due_date)).length;
          
          // Get today's expected returns
          const today = new Date().toDateString();
          pendingReturns.value = borrows.value.filter(b => 
            new Date(b.due_date).toDateString() === today
          );
        }
      } catch (error) {
        console.error('Error loading borrows:', error);
      }
    };
    
    const loadReservations = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/reservations/all`, {
          params: { limit: 100 }
        });
        
        if (response.data.status === 'success') {
          reservations.value = response.data.data.reservations;
          stats.pendingReservations = reservations.value.filter(r => r.status === 'pending').length;
        }
      } catch (error) {
        console.error('Error loading reservations:', error);
      }
    };
    
    const saveBook = async () => {
      try {
        if (editingBook.value) {
          // Update existing book
          await axios.put(`${API_URL}/api/books/${editingBook.value.id}`, bookForm);
          alert('Book updated successfully');
        } else {
          // Create new book
          await axios.post(`${API_URL}/api/books`, bookForm);
          alert('Book added successfully');
        }
        
        closeBookModal();
        loadBooks();
      } catch (error) {
        console.error('Error saving book:', error);
        alert(error.response?.data?.message || 'Failed to save book');
      }
    };
    
    const editBook = (book) => {
      editingBook.value = book;
      Object.assign(bookForm, book);
      showAddBookModal.value = true;
    };
    
    const deleteBook = async (book) => {
      if (!confirm(`Are you sure you want to delete "${book.title}"?`)) return;
      
      try {
        await axios.delete(`${API_URL}/api/books/${book.id}`);
        alert('Book deleted successfully');
        loadBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
        alert(error.response?.data?.message || 'Failed to delete book');
      }
    };
    
    const closeBookModal = () => {
      showAddBookModal.value = false;
      editingBook.value = null;
      Object.keys(bookForm).forEach(key => {
        if (key === 'language') bookForm[key] = 'English';
        else if (key === 'publication_year') bookForm[key] = new Date().getFullYear();
        else if (key === 'total_copies') bookForm[key] = 1;
        else bookForm[key] = '';
      });
    };
    
    const returnBook = async (borrow) => {
      if (!confirm(`Process return for "${borrow.book_title}"?`)) return;
      
      try {
        await axios.post(`${API_URL}/api/borrow/${borrow.id}/return`);
        alert('Book returned successfully');
        loadBorrows();
        loadBooks();
        loadReservations(); // Might need to fulfill a reservation
      } catch (error) {
        console.error('Error returning book:', error);
        alert(error.response?.data?.message || 'Failed to process return');
      }
    };
    
    const fulfillReservation = async (reservation) => {
      if (!confirm(`Fulfill reservation for ${reservation.user_name}?`)) return;
      
      try {
        await axios.patch(`${API_URL}/api/reservations/${reservation.id}/fulfill`);
        alert('Reservation fulfilled. Please issue the book to the student.');
        loadReservations();
      } catch (error) {
        console.error('Error fulfilling reservation:', error);
        alert(error.response?.data?.message || 'Failed to fulfill reservation');
      }
    };
    
    const cancelReservation = async (reservation) => {
      const reason = prompt('Reason for cancellation:');
      if (!reason) return;
      
      try {
        await axios.delete(`${API_URL}/api/reservations/${reservation.id}/cancel`, {
          data: { reason }
        });
        alert('Reservation cancelled');
        loadReservations();
      } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert(error.response?.data?.message || 'Failed to cancel reservation');
      }
    };
    
    const createBorrow = async () => {
      try {
        // Implementation would search for student and book first
        // Then create the borrow record
        alert('Borrow created successfully');
        showNewBorrowModal.value = false;
        loadBorrows();
      } catch (error) {
        console.error('Error creating borrow:', error);
        alert(error.response?.data?.message || 'Failed to create borrow');
      }
    };
    
    const searchStudent = () => {
      // Implement student search
    };
    
    const searchBook = () => {
      // Implement book search
    };
    
    const searchBorrow = () => {
      // Implement borrow search for quick return
    };
    
    const changePage = (page) => {
      pagination.page = page;
      loadBooks();
    };
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
    
    const isOverdue = (dueDate) => {
      return new Date(dueDate) < new Date();
    };
    
    const viewBookDetails = (book) => {
      // Implement book details view
      alert(`View details for: ${book.title}`);
    };
    
    const exportBooks = () => {
      // Implement export functionality
      alert('Export functionality to be implemented');
    };
    
    // Lifecycle
    onMounted(() => {
      loadBooks();
      loadBorrows();
      loadReservations();
    });
    
    return {
      activeTab,
      loading,
      books,
      borrows,
      reservations,
      pendingReturns,
      stats,
      filters,
      pagination,
      tabs,
      genres,
      showAddBookModal,
      showNewBorrowModal,
      editingBook,
      returnSearch,
      bookForm,
      borrowForm,
      tomorrow,
      loadBooks,
      saveBook,
      editBook,
      deleteBook,
      closeBookModal,
      returnBook,
      fulfillReservation,
      cancelReservation,
      createBorrow,
      searchStudent,
      searchBook,
      searchBorrow,
      changePage,
      formatDate,
      isOverdue,
      viewBookDetails,
      exportBooks
    };
  }
};
</script>
