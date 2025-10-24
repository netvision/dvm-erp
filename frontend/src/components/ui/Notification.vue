<template>
  <div
    v-if="visible"
    class="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
  >
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <CheckCircleIcon
                v-if="type === 'success'"
                class="h-6 w-6 text-green-400"
              />
              <ExclamationTriangleIcon
                v-else-if="type === 'warning'"
                class="h-6 w-6 text-yellow-400"
              />
              <XCircleIcon
                v-else-if="type === 'error'"
                class="h-6 w-6 text-red-400"
              />
              <InformationCircleIcon
                v-else
                class="h-6 w-6 text-blue-400"
              />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium text-gray-900">{{ title }}</p>
              <p v-if="message" class="mt-1 text-sm text-gray-500">{{ message }}</p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="close"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span class="sr-only">Close</span>
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  show?: boolean
  autoClose?: boolean
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  show: false,
  autoClose: true,
  duration: 5000
})

const emit = defineEmits<{
  close: []
}>()

const visible = ref(false)

watch(() => props.show, (newValue) => {
  visible.value = newValue
  if (newValue && props.autoClose) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
}, { immediate: true })

const close = () => {
  visible.value = false
  emit('close')
}
</script>