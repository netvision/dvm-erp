<template>
  <div class="h-full bg-white shadow-sm border-r border-gray-200">
    <div class="flex flex-col h-full">
      <!-- School Logo and Name -->
      <div class="flex items-center px-4 py-5 border-b border-gray-200">
        <img src="@/assets/dvm-logo.png" alt="DVM Logo" class="h-12 w-12 object-contain" />
        <div class="ml-3">
          <h1 class="text-lg font-bold text-gray-900">DVM Library</h1>
          <p class="text-xs text-gray-500">Dalmia Vidya Mandir, Chirawa</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <!-- Student Navigation -->
        <template v-if="authStore.isStudent">
          <div class="space-y-1">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Student Portal
            </h3>
            <router-link
              to="/student/dashboard"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/student/dashboard') ? activeClasses : inactiveClasses"
            >
              <HomeIcon class="mr-3 h-5 w-5" :class="isActive('/student/dashboard') ? 'text-blue-500' : 'text-gray-400'" />
              Dashboard
            </router-link>
            <router-link
              to="/student/books"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/student/books') ? activeClasses : inactiveClasses"
            >
              <BookOpenIcon class="mr-3 h-5 w-5" :class="isActive('/student/books') ? 'text-blue-500' : 'text-gray-400'" />
              Browse Books
            </router-link>
            <router-link
              to="/student/borrowed"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/student/borrowed') ? activeClasses : inactiveClasses"
            >
              <BookmarkSquareIcon class="mr-3 h-5 w-5" :class="isActive('/student/borrowed') ? 'text-blue-500' : 'text-gray-400'" />
              My Books
              <span v-if="borrowedCount > 0" class="ml-auto bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-1">
                {{ borrowedCount }}
              </span>
            </router-link>
            <router-link
              to="/student/bookmarks"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/student/bookmarks') ? activeClasses : inactiveClasses"
            >
              <HeartIcon class="mr-3 h-5 w-5" :class="isActive('/student/bookmarks') ? 'text-blue-500' : 'text-gray-400'" />
              Bookmarks
              <span v-if="bookmarkCount > 0" class="ml-auto bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-1">
                {{ bookmarkCount }}
              </span>
            </router-link>
          </div>
        </template>

        <!-- Admin/Librarian Navigation -->
        <template v-if="authStore.canManageBooks">
          <div class="space-y-1">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {{ authStore.isAdmin ? 'Administration' : 'Library Management' }}
            </h3>
            <router-link
              to="/admin/dashboard"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/admin/dashboard') ? activeClasses : inactiveClasses"
            >
              <ChartBarIcon class="mr-3 h-5 w-5" :class="isActive('/admin/dashboard') ? 'text-blue-500' : 'text-gray-400'" />
              Dashboard
            </router-link>
          </div>

          <!-- Resource Management Section -->
          <div class="pt-6 space-y-1">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Resource Management
            </h3>
            <router-link
              to="/admin/books"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/admin/books') ? activeClasses : inactiveClasses"
            >
              <BookOpenIcon class="mr-3 h-5 w-5" :class="isActive('/admin/books') ? 'text-blue-500' : 'text-gray-400'" />
              Physical Books
            </router-link>
            <router-link
              to="/admin/digital-library"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/admin/digital-library') ? activeClasses : inactiveClasses"
            >
              <DocumentIcon class="mr-3 h-5 w-5" :class="isActive('/admin/digital-library') ? 'text-blue-500' : 'text-gray-400'" />
              Digital Library
            </router-link>
            <router-link
              to="/admin/media-library"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/admin/media-library') ? activeClasses : inactiveClasses"
            >
              <PlayIcon class="mr-3 h-5 w-5" :class="isActive('/admin/media-library') ? 'text-blue-500' : 'text-gray-400'" />
              Media Library
            </router-link>
            <router-link
              to="/admin/equipment"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/admin/equipment') ? activeClasses : inactiveClasses"
            >
              <WrenchScrewdriverIcon class="mr-3 h-5 w-5" :class="isActive('/admin/equipment') ? 'text-blue-500' : 'text-gray-400'" />
              Equipment
            </router-link>
          </div>
          
          <!-- User Services Section -->
          <div class="pt-6 space-y-1">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              User Services
            </h3>
            <router-link
              to="/admin/borrowing"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/admin/borrowing') ? activeClasses : inactiveClasses"
            >
              <ArrowRightOnRectangleIcon class="mr-3 h-5 w-5" :class="isActive('/admin/borrowing') ? 'text-blue-500' : 'text-gray-400'" />
              Borrowing & Returns
              <span v-if="pendingReturns > 0" class="ml-auto bg-red-100 text-red-600 text-xs rounded-full px-2 py-1">
                {{ pendingReturns }}
              </span>
            </router-link>
            <router-link
              v-if="authStore.isAdmin"
              to="/admin/users"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/admin/users') ? activeClasses : inactiveClasses"
            >
              <UsersIcon class="mr-3 h-5 w-5" :class="isActive('/admin/users') ? 'text-blue-500' : 'text-gray-400'" />
              Users
            </router-link>
          </div>
          
          <!-- Analytics Section -->
          <div class="pt-6 space-y-1">
            <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Analytics & Reports
            </h3>
            <router-link
              to="/admin/analytics"
              class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
              :class="isActive('/admin/analytics') ? activeClasses : inactiveClasses"
            >
              <ChartBarIcon class="mr-3 h-5 w-5" :class="isActive('/admin/analytics') ? 'text-blue-500' : 'text-gray-400'" />
              Analytics Dashboard
            </router-link>
          </div>
        </template>

        <!-- Quick Actions -->
        <div class="pt-6">
          <h3 class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Quick Actions
          </h3>
          <div class="mt-2 space-y-1">
            <button
              v-if="authStore.isStudent"
              @click="quickSearch"
              class="group w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              <MagnifyingGlassIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Quick Search
            </button>
            <router-link
              to="/profile"
              class="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
            >
              <UserCircleIcon class="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              Profile
            </router-link>
          </div>
        </div>
      </nav>

      <!-- User Info Footer -->
      <div class="flex-shrink-0 px-4 py-4 border-t border-gray-200">
        <div class="flex items-center">
          <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
            <span class="text-sm font-medium text-white">
              {{ userInitials }}
            </span>
          </div>
          <div class="ml-3 min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 truncate">{{ authStore.fullName }}</p>
            <p class="text-xs text-gray-500 capitalize truncate">{{ authStore.user?.role }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeIcon,
  BookOpenIcon,
  BookmarkSquareIcon,
  HeartIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  DocumentIcon,
  PlayIcon,
  WrenchScrewdriverIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const activeClasses = 'bg-blue-50 border-blue-500 text-blue-700 border-r-2'
const inactiveClasses = 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'

const isActive = (path: string) => {
  return route.path.startsWith(path)
}

const userInitials = computed(() => {
  if (!authStore.user) return ''
  const first = authStore.user.first_name?.charAt(0) || ''
  const last = authStore.user.last_name?.charAt(0) || ''
  return (first + last).toUpperCase()
})

// These would be fetched from the store in a real app
const borrowedCount = computed(() => 0) // TODO: Implement from store
const bookmarkCount = computed(() => 0) // TODO: Implement from store
const pendingReturns = computed(() => 0) // TODO: Implement from store

const quickSearch = () => {
  // TODO: Implement quick search modal or redirect
  router.push('/student/books')
}
</script>