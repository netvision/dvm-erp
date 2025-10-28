<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold mb-2">📚 Physical Library</h1>
            <p class="text-lg text-blue-100">
              Browse Books • Reserve • Track Your Borrowings
            </p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">{{ myStats.borrowed }}</div>
            <div class="text-sm text-blue-200">Books Borrowed</div>
            <div class="text-xs text-blue-300 mt-1">{{ myStats.reservations }} reservations</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            {{ tab.name }}
            <span v-if="tab.badge !== undefined" 
                  :class="['ml-2 px-2 py-0.5 text-xs rounded-full', tab.badgeClass]">
              {{ tab.badge }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Browse Books Tab -->
      <div v-show="activeTab === 'browse'" class="space-y-6">
        <!-- Search and Filters -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input v-model="filters.search" @input="loadBooks" 
                   placeholder="Search books..." 
                   class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
            <select v-model="filters.genre" @change="loadBooks" 
                    class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">All Genres</option>
              <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
            </select>
            <select v-model="filters.language" @change="loadBooks" 
                    class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Sanskrit">Sanskrit</option>
            </select>
            <select v-model="filters.availability" @change="loadBooks" 
                    class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">All Books</option>
              <option value="available">Available Now</option>
            </select>
          </div>
        </div>

        <!-- Books Grid -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="books.length === 0" class="text-center py-12 bg-white rounded-lg">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p class="mt-4 text-gray-500">No books found</p>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="book in books" :key="book.id" 
               class="bg-white rounded-lg shadow hover:shadow-lg transition-all overflow-hidden">
            <!-- Book Info -->
            <div class="p-6">
              <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-semibold text-gray-900 flex-1 pr-2">{{ book.title }}</h3>
                <span :class="[
                  'px-2 py-1 text-xs rounded-full whitespace-nowrap',
                  book.available_copies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ book.available_copies > 0 ? 'Available' : 'Unavailable' }}
                </span>
              </div>
              
              <p class="text-sm text-gray-600 mb-4">by {{ book.author }}</p>
              
              <div class="space-y-2 text-sm text-gray-600 mb-4">
                <div class="flex justify-between">
                  <span>Genre:</span>
                  <span class="font-medium">{{ book.genre }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Language:</span>
                  <span class="font-medium">{{ book.language }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Available:</span>
                  <span class="font-medium">{{ book.available_copies }} / {{ book.total_copies }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Location:</span>
                  <span class="font-medium text-blue-600">{{ book.location }}</span>
                </div>
              </div>

              <div v-if="book.description" class="text-sm text-gray-600 mb-4 line-clamp-2">
                {{ book.description }}
              </div>

              <!-- Actions -->
              <div class="space-y-2">
                <button v-if="book.available_copies > 0" 
                        @click="viewBookDetails(book)"
                        class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  View Details
                </button>
                <button v-else 
                        @click="reserveBook(book)"
                        :disabled="isBookReserved(book.id) || myStats.borrowed >= 5"
                        :class="[
                          'w-full px-4 py-2 rounded-lg transition-colors',
                          isBookReserved(book.id) 
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                            : myStats.borrowed >= 5
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        ]">
                  {{ isBookReserved(book.id) ? 'Already Reserved' : 'Reserve Book' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="flex justify-center mt-6">
          <nav class="flex space-x-2">
            <button @click="changePage(pagination.page - 1)" 
                    :disabled="pagination.page === 1"
                    class="px-3 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50">
              Previous
            </button>
            <button v-for="page in paginationButtons" :key="page"
                    @click="changePage(page)"
                    :class="[
                      'px-3 py-2 rounded-lg',
                      pagination.page === page ? 'bg-blue-600 text-white' : 'bg-white border hover:bg-gray-50'
                    ]">
              {{ page }}
            </button>
            <button @click="changePage(pagination.page + 1)" 
                    :disabled="pagination.page === pagination.pages"
                    class="px-3 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50">
              Next
            </button>
          </nav>
        </div>
      </div>

      <!-- My Borrowed Books Tab -->
      <div v-show="activeTab === 'borrowed'" class="space-y-6">
        <div v-if="borrowedBooks.length === 0" class="text-center py-12 bg-white rounded-lg">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="mt-4 text-gray-500">You haven't borrowed any books yet</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="borrow in borrowedBooks" :key="borrow.id" 
               class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ borrow.book_title }}</h3>
                <p class="text-sm text-gray-600 mb-3">by {{ borrow.book_author }}</p>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Borrowed:</span>
                    <span class="ml-2 font-medium">{{ formatDate(borrow.borrow_date) }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Due:</span>
                    <span :class="[
                      'ml-2 font-medium',
                      isOverdue(borrow.due_date) ? 'text-red-600' : 'text-gray-900'
                    ]">
                      {{ formatDate(borrow.due_date) }}
                    </span>
                  </div>
                  <div v-if="borrow.fine_amount > 0" class="col-span-2">
                    <span class="text-gray-500">Fine:</span>
                    <span class="ml-2 font-medium text-red-600">₹{{ borrow.fine_amount }}</span>
                  </div>
                </div>
              </div>
              
              <div class="ml-4">
                <span :class="[
                  'px-3 py-1 text-sm rounded-full',
                  isOverdue(borrow.due_date) 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                ]">
                  {{ isOverdue(borrow.due_date) ? 'Overdue' : 'Active' }}
                </span>
              </div>
            </div>
            
            <!-- Overdue Warning -->
            <div v-if="isOverdue(borrow.due_date)" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-800">
                ⚠️ This book is overdue. Please return it to the library as soon as possible to avoid additional fines.
              </p>
            </div>
            
            <!-- Due Soon Warning -->
            <div v-else-if="isDueSoon(borrow.due_date)" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p class="text-sm text-yellow-800">
                🔔 This book is due soon. Please plan to return it by {{ formatDate(borrow.due_date) }}.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- My Reservations Tab -->
      <div v-show="activeTab === 'reservations'" class="space-y-6">
        <div v-if="myReservations.length === 0" class="text-center py-12 bg-white rounded-lg">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p class="mt-4 text-gray-500">You don't have any active reservations</p>
          <button @click="activeTab = 'browse'" 
                  class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Browse Books
          </button>
        </div>

        <div v-else class="space-y-4">
          <div v-for="reservation in myReservations" :key="reservation.id" 
               class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-1">{{ reservation.book_title }}</h3>
                <p class="text-sm text-gray-600 mb-3">by {{ reservation.book_author }}</p>
                
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-500">Reserved:</span>
                    <span class="ml-2 font-medium">{{ formatDate(reservation.reservation_date) }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">Expires:</span>
                    <span class="ml-2 font-medium">{{ formatDate(reservation.expiry_date) }}</span>
                  </div>
                  <div v-if="reservation.available_copies > 0" class="col-span-2">
                    <span class="text-green-600 font-medium">✓ Book is now available! Visit library to collect.</span>
                  </div>
                </div>

                <div v-if="reservation.notes" class="mt-3 text-sm text-gray-600">
                  <span class="font-medium">Note:</span> {{ reservation.notes }}
                </div>
              </div>
              
              <div class="ml-4 flex flex-col space-y-2">
                <span :class="[
                  'px-3 py-1 text-sm rounded-full text-center',
                  reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  reservation.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                ]">
                  {{ reservation.status }}
                </span>
                
                <button v-if="reservation.status === 'pending'" 
                        @click="cancelReservation(reservation)"
                        class="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Book Details Modal -->
    <div v-if="selectedBook" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-2xl font-bold">{{ selectedBook.title }}</h2>
            <button @click="selectedBook = null" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-1">Author</h3>
              <p class="text-gray-900">{{ selectedBook.author }}</p>
            </div>
            
            <div v-if="selectedBook.description">
              <h3 class="text-sm font-medium text-gray-500 mb-1">Description</h3>
              <p class="text-gray-900">{{ selectedBook.description }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">ISBN</h3>
                <p class="text-gray-900">{{ selectedBook.isbn }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Genre</h3>
                <p class="text-gray-900">{{ selectedBook.genre }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Language</h3>
                <p class="text-gray-900">{{ selectedBook.language }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Publisher</h3>
                <p class="text-gray-900">{{ selectedBook.publisher || 'N/A' }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Publication Year</h3>
                <p class="text-gray-900">{{ selectedBook.publication_year || 'N/A' }}</p>
              </div>
              
              <div>
                <h3 class="text-sm font-medium text-gray-500 mb-1">Location</h3>
                <p class="text-blue-600 font-medium">{{ selectedBook.location }}</p>
              </div>
            </div>
            
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="flex justify-between items-center">
                <div>
                  <p class="text-sm text-gray-600">Availability</p>
                  <p class="text-lg font-semibold">
                    {{ selectedBook.available_copies }} of {{ selectedBook.total_copies }} available
                  </p>
                </div>
                <div>
                  <span :class="[
                    'px-4 py-2 rounded-lg font-medium',
                    selectedBook.available_copies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]">
                    {{ selectedBook.available_copies > 0 ? 'Available' : 'Unavailable' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg">
              <p class="font-medium mb-2">📍 How to get this book:</p>
              <ol class="list-decimal list-inside space-y-1">
                <li>Visit the library</li>
                <li>Find the book at <span class="font-medium text-blue-600">{{ selectedBook.location }}</span></li>
                <li>Show this on your phone or tell the librarian the book title</li>
                <li>The librarian will issue the book to you</li>
              </ol>
            </div>
            
            <button @click="selectedBook = null" 
                    class="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'StudentPhysicalBooks',
  
  setup() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const authStore = useAuthStore();
    
    const activeTab = ref('browse');
    const loading = ref(false);
    const books = ref([]);
    const borrowedBooks = ref([]);
    const myReservations = ref([]);
    const selectedBook = ref(null);
    
    const myStats = reactive({
      borrowed: 0,
      reservations: 0,
      overdue: 0
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
    
    const genres = [
      'Fiction', 'Non-Fiction', 'Science', 'Mathematics', 'History', 
      'Geography', 'Literature', 'Biography', 'Philosophy', 'Technology',
      'Arts', 'Sports', 'Reference', 'Textbook', 'Children'
    ];
    
    const tabs = computed(() => [
      { id: 'browse', name: 'Browse Books' },
      { 
        id: 'borrowed', 
        name: 'My Borrowed Books',
        badge: myStats.borrowed,
        badgeClass: myStats.overdue > 0 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
      },
      { 
        id: 'reservations', 
        name: 'My Reservations',
        badge: myStats.reservations,
        badgeClass: 'bg-yellow-100 text-yellow-800'
      }
    ]);
    
    const paginationButtons = computed(() => {
      const buttons = [];
      const maxButtons = 5;
      let start = Math.max(1, pagination.page - Math.floor(maxButtons / 2));
      let end = Math.min(pagination.pages, start + maxButtons - 1);
      
      if (end - start < maxButtons - 1) {
        start = Math.max(1, end - maxButtons + 1);
      }
      
      for (let i = start; i <= end; i++) {
        buttons.push(i);
      }
      return buttons;
    });
    
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
        }
      } catch (error) {
        console.error('Error loading books:', error);
      } finally {
        loading.value = false;
      }
    };
    
    const loadBorrowedBooks = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/borrow/my-borrows`, {
          params: { status: 'borrowed' }
        });
        
        if (response.data.status === 'success') {
          borrowedBooks.value = response.data.data.records;
          myStats.borrowed = borrowedBooks.value.length;
          myStats.overdue = borrowedBooks.value.filter(b => isOverdue(b.due_date)).length;
        }
      } catch (error) {
        console.error('Error loading borrowed books:', error);
      }
    };
    
    const loadMyReservations = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/reservations/my-reservations`);
        
        if (response.data.status === 'success') {
          myReservations.value = response.data.data.reservations;
          myStats.reservations = myReservations.value.filter(r => r.status === 'pending').length;
        }
      } catch (error) {
        console.error('Error loading reservations:', error);
      }
    };
    
    const reserveBook = async (book) => {
      if (myStats.borrowed >= 5) {
        alert('You have reached the maximum limit of 5 borrowed/reserved books.');
        return;
      }
      
      const notes = prompt(`Reserve "${book.title}"?\n\nOptional note (e.g., when you need it):`);
      if (notes === null) return; // User cancelled
      
      try {
        await axios.post(`${API_URL}/api/reservations`, {
          book_id: book.id,
          notes: notes || undefined
        });
        
        alert('Book reserved successfully! You will be notified when it becomes available.');
        await loadMyReservations();
        activeTab.value = 'reservations';
      } catch (error) {
        console.error('Error reserving book:', error);
        alert(error.response?.data?.message || 'Failed to reserve book');
      }
    };
    
    const cancelReservation = async (reservation) => {
      if (!confirm(`Cancel reservation for "${reservation.book_title}"?`)) return;
      
      try {
        await axios.delete(`${API_URL}/api/reservations/${reservation.id}/cancel`);
        alert('Reservation cancelled');
        await loadMyReservations();
      } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert(error.response?.data?.message || 'Failed to cancel reservation');
      }
    };
    
    const viewBookDetails = (book) => {
      selectedBook.value = book;
    };
    
    const isBookReserved = (bookId) => {
      return myReservations.value.some(r => 
        r.book_id === bookId && r.status === 'pending'
      );
    };
    
    const changePage = (page) => {
      pagination.page = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    const isDueSoon = (dueDate) => {
      const due = new Date(dueDate);
      const now = new Date();
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    };
    
    onMounted(() => {
      loadBooks();
      loadBorrowedBooks();
      loadMyReservations();
    });
    
    return {
      activeTab,
      loading,
      books,
      borrowedBooks,
      myReservations,
      selectedBook,
      myStats,
      filters,
      pagination,
      tabs,
      genres,
      paginationButtons,
      loadBooks,
      reserveBook,
      cancelReservation,
      viewBookDetails,
      isBookReserved,
      changePage,
      formatDate,
      isOverdue,
      isDueSoon
    };
  }
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
