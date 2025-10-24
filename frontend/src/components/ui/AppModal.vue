<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" @click="handleBackdropClick">
        <div class="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay -->
          <Transition name="modal-backdrop" appear>
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition>

          <!-- This element is to trick the browser into centering the modal contents. -->
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <!-- Modal panel -->
          <Transition name="modal-panel" appear>
            <div
              ref="modalPanel"
              :class="[
                'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle',
                sizeClasses
              ]"
            >
              <!-- Header -->
              <div v-if="title || $slots.header" class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="flex items-start">
                  <div class="flex-1">
                    <slot name="header">
                      <h3 class="text-lg leading-6 font-medium text-gray-900">
                        {{ title }}
                      </h3>
                    </slot>
                  </div>
                  <div class="ml-3 h-7 flex items-center">
                    <button
                      v-if="closable"
                      @click="$emit('close')"
                      class="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span class="sr-only">Close</span>
                      <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Body -->
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6">
                <slot />
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer" class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

interface Props {
  show: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  closeOnBackdrop?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnBackdrop: true
})

const emit = defineEmits<{
  close: []
}>()

const modalPanel = ref<HTMLElement>()

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'sm:max-w-sm sm:w-full',
    md: 'sm:max-w-lg sm:w-full',
    lg: 'sm:max-w-2xl sm:w-full',
    xl: 'sm:max-w-4xl sm:w-full'
  }
  return sizes[props.size]
})

const handleBackdropClick = (event: MouseEvent) => {
  if (props.closeOnBackdrop && modalPanel.value && !modalPanel.value.contains(event.target as Node)) {
    emit('close')
  }
}

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closable) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-backdrop-enter-active, .modal-backdrop-leave-active {
  transition: opacity 0.25s ease;
}

.modal-backdrop-enter-from, .modal-backdrop-leave-to {
  opacity: 0;
}

.modal-panel-enter-active, .modal-panel-leave-active {
  transition: all 0.25s ease;
}

.modal-panel-enter-from, .modal-panel-leave-to {
  opacity: 0;
  transform: translate(0, -50px) scale(0.95);
}
</style>