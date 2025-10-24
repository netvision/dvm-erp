// Auth types
export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  role: 'student' | 'teacher' | 'librarian' | 'admin'
  phone?: string
  address?: string
  student_id?: string
  employee_id?: string
  grade_level?: string
  department?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  first_name: string
  last_name: string
  email: string
  password: string
  role?: string
  phone?: string
  address?: string
  student_id?: string
  employee_id?: string
  grade_level?: string
  department?: string
}

// Book types
export interface Book {
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
  language: string
  cover_image?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Borrow Record types
export interface BorrowRecord {
  id: number
  user_id: number
  book_id: number
  borrow_date: string
  due_date: string
  return_date?: string
  status: 'borrowed' | 'returned' | 'overdue' | 'lost'
  condition_notes?: string
  fine_amount: number
  created_at: string
  updated_at: string
  book_title?: string
  book_author?: string
  user_name?: string
  user_email?: string
}

// Bookmark types
export interface Bookmark {
  id: number
  user_id: number
  book_id: number
  notes?: string
  created_at: string
  updated_at: string
  book_title?: string
  book_author?: string
}

// Media types
export interface Media {
  id: number
  title: string
  type: 'dvd' | 'cd' | 'digital' | 'audiobook' | 'ebook'
  format?: string
  duration?: number
  file_size?: number
  description?: string
  total_copies: number
  available_copies: number
  location?: string
  access_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse<T> {
  status: 'success' | 'error'
  message?: string
  data?: T
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    current_page: number
    per_page: number
    total: number
    total_pages: number
  }
}

// Search and filter types
export interface BookFilters {
  search?: string
  genre?: string
  author?: string
  language?: string
  available_only?: boolean
  sort_by?: string
  sort_order?: 'ASC' | 'DESC'
}

export interface MediaFilters {
  search?: string
  type?: string
  format?: string
  available_only?: boolean
  sort_by?: string
  sort_order?: 'ASC' | 'DESC'
}