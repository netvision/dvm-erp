import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresAuth: false }
  },
  
  // Student routes
  {
    path: '/student',
    redirect: '/student/dashboard',
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/dashboard',
    name: 'student-dashboard',
    component: () => import('@/views/student/ModernStudentDashboard.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/books',
    name: 'student-books',
    component: () => import('@/views/student/StudentBooks.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/borrowed',
    name: 'student-borrowed',
    component: () => import('@/views/student/StudentBorrowed.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/bookmarks',
    name: 'student-bookmarks',
    component: () => import('@/views/student/StudentBookmarks.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/physical-library',
    name: 'student-physical-library',
    component: () => import('@/views/student/StudentPhysicalBooks.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  
  // Profile route (available to all authenticated users)
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true }
  },
  
  // Admin/Librarian routes
  {
    path: '/admin',
    redirect: '/admin/dashboard',
    meta: { requiresAuth: true, role: ['admin', 'librarian'] }
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/views/admin/ModernAdminDashboard.vue'),
    meta: { requiresAuth: true, role: ['admin', 'librarian'] }
  },
  {
    path: '/admin/simple-dashboard',
    name: 'admin-simple-dashboard',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, role: ['admin', 'librarian'] }
  },
  {
    path: '/admin/comprehensive-library',
    name: 'admin-comprehensive-library',
    component: () => import('@/views/admin/ComprehensiveLibraryDashboard.vue'),
    meta: { requiresAuth: true, role: ['admin', 'librarian'] }
  },
  {
    path: '/admin/books',
    name: 'admin-books',
    component: () => import('@/views/admin/BookManagement.vue'),
    meta: { requiresAuth: true, role: ['admin', 'librarian'] }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('@/views/admin/EnhancedUserManagement.vue'),
    meta: { requiresAuth: true, role: ['admin', 'librarian'] }
  },
  {
    path: '/admin/borrowing',
    name: 'admin-borrowing',
    component: () => import('@/views/admin/BorrowingManagement.vue'),
    meta: { requiresAuth: true, role: ['admin', 'librarian'] }
  },
  {
    path: '/admin/physical-library',
    name: 'admin-physical-library',
    component: () => import('@/views/admin/PhysicalLibraryManagement.vue'),
    meta: { requiresAuth: true, role: ['admin', 'librarian'] }
  },
  {
    path: '/admin/digital-library',
    name: 'admin-digital-library',
    component: () => import('@/views/admin/DigitalLibrary.vue'),
    meta: { requiresAuth: true, role: ['admin', 'librarian'] }
  },
  {
    path: '/admin/media-library',
    name: 'admin-media-library',
    component: () => import('@/views/admin/MediaLibrary.vue'),
    meta: { requiresAuth: true, role: ['admin', 'librarian'] }
  },
  {
    path: '/admin/equipment',
    name: 'admin-equipment',
    component: () => import('@/views/admin/EquipmentManagement.vue'),
    meta: { requiresAuth: true, role: ['admin', 'librarian'] }
  },
  {
    path: '/admin/analytics',
    name: 'admin-analytics',
    component: () => import('@/views/admin/AnalyticsDashboard.vue'),
    meta: { requiresAuth: true, role: ['admin', 'librarian'] }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  
  // Initialize auth if we have a token but no user data
  if (authStore.token && !authStore.user) {
    try {
      await authStore.initializeAuth()
    } catch (error) {
      // Auth initialization failed, continue with unauthenticated state
    }
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    // If user is not authenticated, redirect to login
    if (!authStore.isReallyAuthenticated) {
      return { name: 'login' }
    }
    
    // Check role-based access
    if (to.meta.role) {
      const userRole = authStore.user?.role
      const requiredRoles = Array.isArray(to.meta.role) ? to.meta.role : [to.meta.role]
      
      if (!userRole || !requiredRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on user role
        if (userRole === 'student') {
          return { name: 'student-dashboard' }
        } else if (userRole === 'admin' || userRole === 'librarian') {
          return { name: 'admin-dashboard' }
        } else {
          return { name: 'login' }
        }
      }
    }
  }
  
  // If user is authenticated and trying to access login/register, redirect to dashboard
  if (authStore.isReallyAuthenticated && (to.name === 'login' || to.name === 'register')) {
    const userRole = authStore.user?.role
    if (userRole === 'student') {
      return { name: 'student-dashboard' }
    } else if (userRole === 'admin' || userRole === 'librarian') {
      return { name: 'admin-dashboard' }
    }
  }
})

export default router