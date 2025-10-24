import { defineStore } from 'pinia'
import axios from 'axios'

interface BorrowRecord {
  id: number
  user_id: number
  book_id: number
  borrow_date: string
  due_date: string
  return_date?: string
  fine_amount?: number
  status: 'active' | 'returned' | 'overdue'
  book?: {
    id: number
    title: string
    author: string
    isbn?: string
  }
  user?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
}

interface BorrowingState {
  currentUserBorrows: BorrowRecord[]
  allBorrows: BorrowRecord[]
  loading: boolean
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  } | null
}

export const useBorrowingStore = defineStore('borrowing', {
  state: (): BorrowingState => ({
    currentUserBorrows: [],
    allBorrows: [],
    loading: false,
    pagination: null
  }),

  actions: {
    async fetchUserBorrows() {
      this.loading = true
      try {
        const response = await axios.get('/borrow/current')
        const borrowData = response.data.data.current_borrows || response.data.data
        
        // Ensure currentUserBorrows is always an array
        this.currentUserBorrows = Array.isArray(borrowData) ? borrowData : []
        return { success: true }
      } catch (error: any) {
        // On error, ensure currentUserBorrows is an empty array
        this.currentUserBorrows = []
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to fetch borrow records' 
        }
      } finally {
        this.loading = false
      }
    },

    async fetchAllBorrows(params: any = {}) {
      this.loading = true
      try {
        const response = await axios.get('/borrow/records', { params })
        const borrowData = response.data.data.borrow_records || response.data.data
        
        // Ensure allBorrows is always an array
        this.allBorrows = Array.isArray(borrowData) ? borrowData : []
        this.pagination = response.data.data.pagination
        return { success: true }
      } catch (error: any) {
        // On error, ensure allBorrows is an empty array
        this.allBorrows = []
        this.pagination = null
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to fetch all borrow records' 
        }
      } finally {
        this.loading = false
      }
    },

    async borrowBook(bookId: number, dueDate?: string) {
      try {
        const response = await axios.post('/borrow', {
          book_id: bookId,
          due_date: dueDate
        })
        
        const newBorrow = response.data.data.borrow_record
        this.currentUserBorrows.unshift(newBorrow)
        
        return { success: true, borrow: newBorrow }
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to borrow book' 
        }
      }
    },

    async returnBook(borrowId: number) {
      try {
        const response = await axios.put(`/borrow/${borrowId}/return`)
        const updatedBorrow = response.data.data.borrow_record
        
        // Update in current user borrows
        const userIndex = this.currentUserBorrows.findIndex(b => b.id === borrowId)
        if (userIndex !== -1) {
          this.currentUserBorrows[userIndex] = updatedBorrow
        }
        
        // Update in all borrows if loaded
        const allIndex = this.allBorrows.findIndex(b => b.id === borrowId)
        if (allIndex !== -1) {
          this.allBorrows[allIndex] = updatedBorrow
        }
        
        return { success: true, borrow: updatedBorrow }
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to return book' 
        }
      }
    },

    async renewBook(borrowId: number, newDueDate: string) {
      try {
        const response = await axios.put(`/borrow/${borrowId}/renew`, {
          due_date: newDueDate
        })
        const updatedBorrow = response.data.data.borrow_record
        
        // Update in current user borrows
        const userIndex = this.currentUserBorrows.findIndex(b => b.id === borrowId)
        if (userIndex !== -1) {
          this.currentUserBorrows[userIndex] = updatedBorrow
        }
        
        return { success: true, borrow: updatedBorrow }
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to renew book' 
        }
      }
    },

    async payFine(borrowId: number) {
      try {
        const response = await axios.post(`/borrow/${borrowId}/pay-fine`)
        const updatedBorrow = response.data.data.borrow_record
        
        // Update in current user borrows
        const userIndex = this.currentUserBorrows.findIndex(b => b.id === borrowId)
        if (userIndex !== -1) {
          this.currentUserBorrows[userIndex] = updatedBorrow
        }
        
        return { success: true, borrow: updatedBorrow }
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to pay fine' 
        }
      }
    },

    async fetchBorrowingStats() {
      try {
        const response = await axios.get('/borrow/stats')
        return { success: true, stats: response.data.data }
      } catch (error: any) {
        return { 
          success: false, 
          message: error.response?.data?.message || 'Failed to fetch borrowing stats' 
        }
      }
    }
  },

  getters: {
    activeBorrows: (state) => state.currentUserBorrows.filter(b => b.status === 'active'),
    overdueBorrows: (state) => state.currentUserBorrows.filter(b => b.status === 'overdue'),
    returnedBorrows: (state) => state.currentUserBorrows.filter(b => b.status === 'returned'),
    totalFines: (state) => {
      return state.currentUserBorrows.reduce((total, borrow) => {
        return total + (borrow.fine_amount || 0)
      }, 0)
    },
    borrowsWithFines: (state) => state.currentUserBorrows.filter(b => b.fine_amount && b.fine_amount > 0)
  }
})