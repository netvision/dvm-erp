<template>
  <div :class="[
    'bg-white overflow-hidden shadow rounded-lg',
    {
      'hover:shadow-md transition-shadow duration-200': hoverable,
      'cursor-pointer': clickable
    }
  ]"
  @click="handleClick"
  >
    <!-- Header -->
    <div v-if="title || $slots.header" class="px-4 py-5 sm:px-6 border-b border-gray-200">
      <slot name="header">
        <div class="flex items-center justify-between">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            {{ title }}
          </h3>
          <div v-if="$slots.actions">
            <slot name="actions" />
          </div>
        </div>
        <p v-if="subtitle" class="mt-1 max-w-2xl text-sm text-gray-500">
          {{ subtitle }}
        </p>
      </slot>
    </div>

    <!-- Content -->
    <div class="px-4 py-5 sm:p-6">
      <slot />
    </div>

    <!-- Footer -->
    <div v-if="$slots.footer" class="bg-gray-50 px-4 py-4 sm:px-6">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  hoverable?: boolean
  clickable?: boolean
}

withDefaults(defineProps<Props>(), {
  hoverable: false,
  clickable: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>