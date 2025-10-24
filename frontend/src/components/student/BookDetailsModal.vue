<template>
  <TransitionRoot appear :show="show" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <div class="flex justify-between items-start mb-4">
                <DialogTitle as="h3" class="text-xl font-semibold leading-6 text-gray-900">
                  Book Details
                </DialogTitle>
                <button
                  @click="closeModal"
                  class="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon class="h-6 w-6" />
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Book Cover -->
                <div class="md:col-span-1">
                  <div class="aspect-w-3 aspect-h-4">
                    <img
                      v-if="book.cover_image"
                      :src="book.cover_image"
                      :alt="book.title"
                      class="w-full h-64 object-cover rounded-lg shadow-md"
                    />
                    <div
                      v-else
                      class="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center"
                    >
                      <BookOpenIcon class="h-20 w-20 text-gray-400" />
                    </div>
                  </div>
                </div>

                <!-- Book Information -->
                <div class="md:col-span-2">
                  <div class="space-y-4">
                    <div>
                      <h4 class="text-2xl font-bold text-gray-900">{{ book.title }}</h4>
                      <p class="text-lg text-gray-600 mt-1">by {{ book.author }}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div v-if="book.isbn">
                        <span class="font-medium text-gray-700">ISBN:</span>
                        <span class="text-gray-600 ml-2">{{ book.isbn }}</span>
                      </div>
                      <div v-if="book.publisher">
                        <span class="font-medium text-gray-700">Publisher:</span>
                        <span class="text-gray-600 ml-2">{{ book.publisher }}</span>
                      </div>
                      <div v-if="book.publication_year">
                        <span class="font-medium text-gray-700">Year:</span>
                        <span class="text-gray-600 ml-2">{{ book.publication_year }}</span>
                      </div>
                      <div v-if="book.genre">
                        <span class="font-medium text-gray-700">Genre:</span>
                        <span class="text-gray-600 ml-2">{{ book.genre }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Language:</span>
                        <span class="text-gray-600 ml-2">{{ book.language }}</span>
                      </div>
                      <div v-if="book.location">
                        <span class="font-medium text-gray-700">Location:</span>
                        <span class="text-gray-600 ml-2">{{ book.location }}</span>
                      </div>
                    </div>

                    <div class="flex items-center space-x-4">
                      <span
                        :class="[
                          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                          book.available_copies > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        ]"
                      >
                        {{ book.available_copies > 0 ? 'Available' : 'Unavailable' }}
                      </span>
                      <span class="text-sm text-gray-600">
                        {{ book.available_copies }} of {{ book.total_copies }} copies available
                      </span>
                    </div>

                    <div v-if="book.description" class="pt-4">
                      <h5 class="font-medium text-gray-900 mb-2">Description</h5>
                      <p class="text-gray-600 text-sm leading-relaxed">{{ book.description }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="mt-6 flex justify-end space-x-3">
                <button
                  @click="handleBookmark"
                  :disabled="bookmarkLoading"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <HeartIcon
                    :class="[
                      'h-4 w-4 mr-2',
                      isBookmarked ? 'text-red-500 fill-red-500' : 'text-gray-400'
                    ]"
                  />
                  {{ isBookmarked ? 'Remove Bookmark' : 'Add Bookmark' }}
                </button>

                <button
                  v-if="book.available_copies > 0"
                  @click="handleBorrow"
                  :disabled="borrowLoading"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <span v-if="borrowLoading">Borrowing...</span>
                  <span v-else>Borrow Book</span>
                </button>

                <button
                  v-else
                  disabled
                  class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed"
                >
                  Unavailable
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { BookOpenIcon, HeartIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import type { Book } from '@/types'

interface Props {
  book: Book
  show: boolean
  isBookmarked?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isBookmarked: false
})

const emit = defineEmits<{
  close: []
  borrow: [book: Book]
  bookmark: [book: Book]
}>()

const borrowLoading = ref(false)
const bookmarkLoading = ref(false)

const isBookmarked = computed(() => props.isBookmarked)

const closeModal = () => {
  emit('close')
}

const handleBorrow = async () => {
  borrowLoading.value = true
  try {
    emit('borrow', props.book)
  } finally {
    borrowLoading.value = false
    closeModal()
  }
}

const handleBookmark = async () => {
  bookmarkLoading.value = true
  try {
    emit('bookmark', props.book)
  } finally {
    bookmarkLoading.value = false
  }
}
</script>