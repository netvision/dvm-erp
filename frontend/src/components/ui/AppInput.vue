<template>
  <div class="mb-4">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :value="modelValue"
        @input="updateValue"
        :class="[
          'block w-full px-3 py-2 border rounded-md shadow-sm',
          'placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0',
          {
            'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': error,
            'border-gray-300 focus:ring-blue-500 focus:border-blue-500': !error && !disabled,
            'bg-gray-50 text-gray-500 cursor-not-allowed': disabled
          }
        ]"
      />
      
      <div v-if="error && type === 'password'" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
      </div>
    </div>
    
    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
    
    <p v-else-if="help" class="mt-1 text-sm text-gray-500">
      {{ help }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  help?: string
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputId = computed(() => 
  `input-${Math.random().toString(36).substr(2, 9)}`
)

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>