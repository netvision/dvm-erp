<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Authenticated Layout -->
    <div v-if="authStore.isAuthenticated" class="flex h-screen">
      <!-- Sidebar -->
      <div class="hidden lg:flex lg:flex-shrink-0">
        <div class="flex flex-col w-64">
          <Sidebar />
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Navigation -->
        <Navbar />
        
        <!-- Main Content -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pt-16">
          <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <router-view />
          </div>
        </main>
      </div>
    </div>

    <!-- Unauthenticated Layout -->
    <div v-else class="min-h-screen flex items-center justify-center bg-gray-50">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from './stores/auth'
import Navbar from './components/layout/Navbar.vue'
import Sidebar from './components/layout/Sidebar.vue'

const authStore = useAuthStore()
</script>
