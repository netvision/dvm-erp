<template>
  <nav class="bg-white shadow-sm border-b border-gray-200 fixed w-full top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <img src="@/assets/dvm-logo.png" alt="DVM Logo" class="h-8 w-8 object-contain" />
            <div class="ml-2">
              <span class="text-lg font-bold text-gray-900">DVM Library</span>
              <span class="hidden lg:inline text-xs text-gray-500 ml-2">Dalmia Vidya Mandir, Chirawa</span>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:ml-10 md:flex md:space-x-8">
            <template v-if="authStore.isStudent">
              <router-link
                to="/student/dashboard"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                :class="{ 'text-blue-600 bg-blue-50': $route.name === 'student-dashboard' }"
              >
                Dashboard
              </router-link>
              <router-link
                to="/student/books"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                :class="{ 'text-blue-600 bg-blue-50': $route.name === 'student-books' }"
              >
                Browse Books
              </router-link>
              <router-link
                to="/student/borrowed"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                :class="{ 'text-blue-600 bg-blue-50': $route.name === 'student-borrowed' }"
              >
                My Books
              </router-link>
              <router-link
                to="/student/bookmarks"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                :class="{ 'text-blue-600 bg-blue-50': $route.name === 'student-bookmarks' }"
              >
                Bookmarks
              </router-link>
            </template>

            <template v-if="authStore.canManageBooks">
              <router-link
                to="/admin/dashboard"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                :class="{ 'text-blue-600 bg-blue-50': $route.name === 'admin-dashboard' }"
              >
                Dashboard
              </router-link>
              
              <!-- Dropdown for Resource Management -->
              <Menu as="div" class="relative inline-block text-left">
                <MenuButton class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium inline-flex items-center space-x-1">
                  <span>Resources</span>
                  <ChevronDownIcon class="h-4 w-4" />
                </MenuButton>
                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <MenuItems class="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <MenuItem v-slot="{ active }">
                      <router-link
                        to="/admin/books"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        Physical Books
                      </router-link>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <router-link
                        to="/admin/digital-library"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        Digital Library
                      </router-link>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <router-link
                        to="/admin/media-library"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        Media Library
                      </router-link>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <router-link
                        to="/admin/equipment"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        Equipment
                      </router-link>
                    </MenuItem>
                  </MenuItems>
                </transition>
              </Menu>

              <router-link
                to="/admin/borrowing"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                :class="{ 'text-blue-600 bg-blue-50': $route.name === 'admin-borrowing' }"
              >
                Borrowing
              </router-link>
              <router-link
                v-if="authStore.isAdmin"
                to="/admin/users"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                :class="{ 'text-blue-600 bg-blue-50': $route.name === 'admin-users' }"
              >
                Users
              </router-link>
            </template>
          </div>
        </div>

        <!-- User Menu -->
        <div class="hidden md:flex items-center">
          <div class="relative">
            <Menu as="div" class="relative inline-block text-left">
              <div>
                <MenuButton class="flex items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  <span class="sr-only">Open user menu</span>
                  <div class="flex items-center space-x-3">
                    <div class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span class="text-sm font-medium text-white">
                        {{ userInitials }}
                      </span>
                    </div>
                    <div class="hidden md:block text-left">
                      <div class="text-sm font-medium text-gray-900">{{ authStore.fullName }}</div>
                      <div class="text-xs text-gray-500 capitalize">{{ authStore.user?.role }}</div>
                    </div>
                    <ChevronDownIcon class="h-4 w-4 text-gray-400" />
                  </div>
                </MenuButton>
              </div>

              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem v-slot="{ active }">
                    <router-link
                      to="/profile"
                      :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                    >
                      Profile
                    </router-link>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button
                      @click="handleLogout"
                      :class="[active ? 'bg-gray-100' : '', 'block w-full text-left px-4 py-2 text-sm text-gray-700']"
                    >
                      Sign out
                    </button>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </div>
        </div>

        <!-- Mobile menu button -->
        <div class="flex items-center md:hidden">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span class="sr-only">Open main menu</span>
            <Bars3Icon v-if="!mobileMenuOpen" class="block h-6 w-6" />
            <XMarkIcon v-else class="block h-6 w-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-show="mobileMenuOpen" class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
        <!-- User Info Section for Mobile -->
        <div class="px-3 py-3 border-b border-gray-200 mb-2">
          <div class="flex items-center space-x-3">
            <div class="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span class="text-sm font-medium text-white">
                {{ userInitials }}
              </span>
            </div>
            <div>
              <div class="text-sm font-medium text-gray-900">{{ authStore.fullName }}</div>
              <div class="text-xs text-gray-500 capitalize">{{ authStore.user?.role }}</div>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <template v-if="authStore.isStudent">
          <router-link
            to="/student/dashboard"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Dashboard
          </router-link>
          <router-link
            to="/student/books"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Browse Books
          </router-link>
          <router-link
            to="/student/borrowed"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            My Books
          </router-link>
          <router-link
            to="/student/bookmarks"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Bookmarks
          </router-link>
        </template>

        <template v-if="authStore.canManageBooks">
          <router-link
            to="/admin/dashboard"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Dashboard
          </router-link>
          <router-link
            to="/admin/books"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Physical Books
          </router-link>
          <router-link
            to="/admin/digital-library"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Digital Library
          </router-link>
          <router-link
            to="/admin/media-library"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Media Library
          </router-link>
          <router-link
            to="/admin/equipment"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Equipment
          </router-link>
          <router-link
            to="/admin/borrowing"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Borrowing & Returns
          </router-link>
          <router-link
            v-if="authStore.isAdmin"
            to="/admin/users"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Users
          </router-link>
          <router-link
            to="/admin/analytics"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Analytics
          </router-link>
        </template>

        <!-- User Actions Section -->
        <div class="pt-4 border-t border-gray-200">
          <router-link
            to="/profile"
            class="block px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-blue-600 hover:bg-gray-50"
            @click="mobileMenuOpen = false"
          >
            Profile
          </router-link>
          <button
            @click="handleLogout"
            class="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { 
  ChevronDownIcon, 
  Bars3Icon, 
  XMarkIcon 
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

const userInitials = computed(() => {
  if (!authStore.user) return ''
  const first = authStore.user.first_name?.charAt(0) || ''
  const last = authStore.user.last_name?.charAt(0) || ''
  return (first + last).toUpperCase()
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>