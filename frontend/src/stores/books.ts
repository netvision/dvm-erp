import { defineStore } from 'pinia'
import axios from 'axios'

interface Book {
  id: number
  title: string
  author: string
  isbn?: string
  publisher?: string
  publication_year?: number
  genre?: string
  description?: string
  total_copies: number
  available_copies: number
  location?: string
  language?: string
  created_at: string
}

interface BooksState {
  books: Book[]
  currentBook: Book | null
  loading: boolean
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  } | null
}

export const useBooksStore = defineStore('books', {
  state: (): BooksState => ({
    books: [],
    currentBook: null,
    loading: false,
    pagination: null
  }),

  actions: {
    async fetchBooks(params: any = {}) {
      this.loading = true
      try {
        const response = await axios.get('/books', { params })
        this.books = response.data.data.books
        this.pagination = response.data.data.pagination
        return { success: true }
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to fetch books' 
        }
      } finally {
        this.loading = false
      }
    },

    async fetchBook(id: number) {
      this.loading = true
      try {
        const response = await axios.get(`/books/${id}`)
        this.currentBook = response.data.data.book
        return { success: true }
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to fetch book' 
        }
      } finally {
        this.loading = false
      }
    },

    async searchBooks(query: string, filters: any = {}) {
      return this.fetchBooks({
        search: query,
        ...filters
      })
    },

    async createBook(bookData: Partial<Book>) {
      try {
        const response = await axios.post('/books', bookData)
        const newBook = response.data.data.book
        this.books.unshift(newBook)
        return { success: true, book: newBook }
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to create book' 
        }
      }
    },

    async updateBook(id: number, bookData: Partial<Book>) {
      try {
        const response = await axios.put(`/books/${id}`, bookData)
        const updatedBook = response.data.data.book
        
        const index = this.books.findIndex(b => b.id === id)
        if (index !== -1) {
          this.books[index] = updatedBook
        }
        
        return { success: true, book: updatedBook }
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to update book' 
        }
      }
    },

    async deleteBook(id: number) {
      try {
        await axios.delete(`/books/${id}`)
        this.books = this.books.filter(b => b.id !== id)
        return { success: true }
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to delete book' 
        }
      }
    },

    async borrowBook(bookId: number, dueDate?: string) {
      try {
        const response = await axios.post('/borrow', {
          book_id: bookId,
          due_date: dueDate
        })
        
        // Update available copies
        const book = this.books.find(b => b.id === bookId)
        if (book && book.available_copies > 0) {
          book.available_copies--
        }
        
        return { success: true, borrow: response.data.data.borrow_record }
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to borrow book' 
        }
      }
    }
  },

  getters: {
    availableBooks: (state) => state.books.filter(book => book.available_copies > 0),
    booksByGenre: (state) => {
      const genres: { [key: string]: Book[] } = {}
      state.books.forEach(book => {
        const genre = book.genre || 'Other'
        if (!genres[genre]) {
          genres[genre] = []
        }
        genres[genre].push(book)
      })
      return genres
    }
  }
})