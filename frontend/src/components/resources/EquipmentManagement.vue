<template>
  <div class="space-y-6">
    <!-- Search and Filters -->
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-2">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search equipment by name, model, or serial..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <select
          v-model="selectedCategory"
          class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          <option value="Tablet">Tablets</option>
          <option value="Audio/Visual">Audio/Visual</option>
          <option value="Computer">Computers</option>
          <option value="Camera">Cameras</option>
          <option value="Laboratory">Laboratory</option>
          <option value="Sports">Sports</option>
        </select>

        <select
          v-model="selectedStatus"
          class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="checked_out">Checked Out</option>
          <option value="maintenance">Maintenance</option>
          <option value="damaged">Damaged</option>
        </select>
      </div>
    </div>

    <!-- Equipment Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Equipment</p>
            <p class="text-2xl font-bold text-gray-900">{{ equipment.length }}</p>
          </div>
          <WrenchScrewdriverIcon class="w-8 h-8 text-blue-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Available</p>
            <p class="text-2xl font-bold text-green-600">{{ availableCount }}</p>
          </div>
          <CheckCircleIcon class="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Checked Out</p>
            <p class="text-2xl font-bold text-orange-600">{{ checkedOutCount }}</p>
          </div>
          <ClockIcon class="w-8 h-8 text-orange-600" />
        </div>
      </div>
      
      <div class="bg-white rounded-lg border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Maintenance</p>
            <p class="text-2xl font-bold text-red-600">{{ maintenanceCount }}</p>
          </div>
          <ExclamationTriangleIcon class="w-8 h-8 text-red-600" />
        </div>
      </div>
    </div>

    <!-- Equipment Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="item in filteredEquipment"
        :key="item.id"
        class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="p-6">
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <component :is="getEquipmentIcon(item.category)" class="w-5 h-5 text-blue-600" />
                <span class="text-xs font-medium text-gray-500 uppercase">{{ item.category }}</span>
              </div>
              <h3 class="font-semibold text-gray-900 mb-1">{{ item.name }}</h3>
              <p class="text-sm text-gray-600 mb-2">{{ item.model }}</p>
              <span
                :class="[
                  'px-2 py-1 text-xs rounded-full',
                  getStatusColor(item.status)
                ]"
              >
                {{ formatStatus(item.status) }}
              </span>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500 mb-1">{{ item.location }}</div>
              <div
                :class="[
                  'text-xs px-2 py-1 rounded-full',
                  getConditionColor(item.condition)
                ]"
              >
                {{ item.condition }}
              </div>
            </div>
          </div>

          <div class="space-y-2 text-sm text-gray-600 mb-4">
            <div class="flex justify-between">
              <span>Serial #:</span>
              <span class="font-medium font-mono text-xs">{{ item.serial_number }}</span>
            </div>
            <div class="flex justify-between" v-if="item.purchase_date">
              <span>Purchased:</span>
              <span class="font-medium">{{ formatDate(item.purchase_date) }}</span>
            </div>
            <div class="flex justify-between" v-if="item.warranty_until">
              <span>Warranty:</span>
              <span 
                :class="[
                  'font-medium',
                  isWarrantyExpired(item.warranty_until) ? 'text-red-600' : 'text-green-600'
                ]"
              >
                {{ isWarrantyExpired(item.warranty_until) ? 'Expired' : 'Active' }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="flex space-x-2">
              <button
                v-if="item.status === 'available'"
                @click="checkoutEquipment(item)"
                class="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700"
              >
                Checkout
              </button>
              <button
                v-if="item.status === 'checked_out'"
                @click="returnEquipment(item)"
                class="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
              >
                Return
              </button>
              <button
                @click="viewEquipmentDetails(item)"
                class="bg-gray-600 text-white px-3 py-1 text-sm rounded hover:bg-gray-700"
              >
                Details
              </button>
            </div>
            <div class="flex space-x-2">
              <button
                @click="$emit('edit', item)"
                class="text-gray-600 hover:text-gray-800"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
              <button
                @click="generateQRCode(item)"
                class="text-gray-600 hover:text-gray-800"
              >
                <QrCodeIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Equipment Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Equipment Details</h3>
        </div>
        
        <div class="p-6" v-if="selectedEquipment">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-semibold text-lg text-gray-900 mb-2">{{ selectedEquipment.name }}</h4>
              <p class="text-gray-600 mb-4">{{ selectedEquipment.model }}</p>
              
              <div class="space-y-2">
                <div><span class="font-medium">Category:</span> {{ selectedEquipment.category }}</div>
                <div><span class="font-medium">Serial Number:</span> {{ selectedEquipment.serial_number }}</div>
                <div><span class="font-medium">Location:</span> {{ selectedEquipment.location }}</div>
                <div><span class="font-medium">Condition:</span> {{ selectedEquipment.condition }}</div>
                <div><span class="font-medium">Purchase Date:</span> {{ formatDate(selectedEquipment.purchase_date) }}</div>
                <div><span class="font-medium">Warranty Until:</span> {{ formatDate(selectedEquipment.warranty_until) }}</div>
              </div>
            </div>
            
            <div>
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 class="font-medium text-gray-900 mb-2">Current Status</h5>
                <span :class="['px-2 py-1 text-sm rounded-full', getStatusColor(selectedEquipment.status)]">
                  {{ formatStatus(selectedEquipment.status) }}
                </span>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 class="font-medium text-gray-900 mb-2">Recent Activity</h5>
                <div class="space-y-2 text-sm text-gray-600">
                  <div>Last checkout: 2 days ago</div>
                  <div>Total checkouts: 23</div>
                  <div>Last maintenance: 1 month ago</div>
                </div>
              </div>
              
              <div class="space-y-2">
                <button
                  v-if="selectedEquipment.status === 'available'"
                  @click="checkoutEquipment(selectedEquipment)"
                  class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Checkout Equipment
                </button>
                <button
                  v-if="selectedEquipment.status === 'checked_out'"
                  @click="returnEquipment(selectedEquipment)"
                  class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Return Equipment
                </button>
                <button
                  @click="scheduleMaintenanceModal"
                  class="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                >
                  Schedule Maintenance
                </button>
              </div>
            </div>
          </div>
          
          <div class="mt-6 pt-6 border-t border-gray-200">
            <button
              @click="showDetailsModal = false"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Checkout Modal -->
    <div v-if="showCheckoutModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Checkout Equipment</h3>
        </div>
        
        <div class="p-6">
          <div class="mb-4">
            <p class="text-gray-600">Checking out: <span class="font-medium">{{ selectedEquipment?.name }}</span></p>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Student/Staff ID</label>
              <input
                v-model="checkoutData.userId"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter ID or scan barcode"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Expected Return Date</label>
              <input
                v-model="checkoutData.returnDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Purpose/Notes</label>
              <textarea
                v-model="checkoutData.notes"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Purpose of checkout..."
              ></textarea>
            </div>
          </div>

          <div class="flex space-x-3 mt-6">
            <button
              @click="confirmCheckout"
              :disabled="!checkoutData.userId"
              class="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Checkout
            </button>
            <button
              @click="showCheckoutModal = false"
              class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <div v-if="showQRModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg max-w-md w-full mx-4">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Equipment QR Code</h3>
        </div>
        
        <div class="p-6 text-center">
          <div class="bg-gray-100 rounded-lg p-8 mb-4">
            <QrCodeIcon class="w-32 h-32 text-gray-400 mx-auto" />
          </div>
          <p class="text-gray-600 mb-2">{{ selectedEquipment?.name }}</p>
          <p class="text-sm text-gray-500 font-mono">{{ selectedEquipment?.serial_number }}</p>
          
          <div class="flex space-x-3 mt-6">
            <button class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Download QR
            </button>
            <button
              @click="showQRModal = false"
              class="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  QrCodeIcon,
  DeviceTabletIcon,
  SpeakerWaveIcon,
  ComputerDesktopIcon,
  CameraIcon,
  BeakerIcon
} from '@heroicons/vue/24/outline'

// Props
const props = defineProps<{
  equipment: Array<any>
}>()

// Emits
defineEmits<{
  refresh: []
  edit: [equipment: any]
  delete: [equipment: any]
}>()

// Reactive data
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const showDetailsModal = ref(false)
const showCheckoutModal = ref(false)
const showQRModal = ref(false)
const selectedEquipment = ref(null)

const checkoutData = ref({
  userId: '',
  returnDate: '',
  notes: ''
})

// Computed
const filteredEquipment = computed(() => {
  return props.equipment.filter(item => {
    const matchesSearch = !searchQuery.value || 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.model.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.serial_number.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const matchesCategory = !selectedCategory.value || item.category === selectedCategory.value
    const matchesStatus = !selectedStatus.value || item.status === selectedStatus.value
    
    return matchesSearch && matchesCategory && matchesStatus
  })
})

const availableCount = computed(() => {
  return props.equipment.filter(item => item.status === 'available').length
})

const checkedOutCount = computed(() => {
  return props.equipment.filter(item => item.status === 'checked_out').length
})

const maintenanceCount = computed(() => {
  return props.equipment.filter(item => item.status === 'maintenance' || item.status === 'damaged').length
})

// Methods
const getEquipmentIcon = (category: string) => {
  switch (category) {
    case 'Tablet': return DeviceTabletIcon
    case 'Audio/Visual': return SpeakerWaveIcon
    case 'Computer': return ComputerDesktopIcon
    case 'Camera': return CameraIcon
    case 'Laboratory': return BeakerIcon
    default: return WrenchScrewdriverIcon
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800'
    case 'checked_out': return 'bg-orange-100 text-orange-800'
    case 'maintenance': return 'bg-yellow-100 text-yellow-800'
    case 'damaged': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getConditionColor = (condition: string) => {
  switch (condition) {
    case 'excellent': return 'bg-green-100 text-green-800'
    case 'good': return 'bg-blue-100 text-blue-800'
    case 'fair': return 'bg-yellow-100 text-yellow-800'
    case 'poor': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatStatus = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const isWarrantyExpired = (warrantyDate: string) => {
  return new Date(warrantyDate) < new Date()
}

const viewEquipmentDetails = (equipment: any) => {
  selectedEquipment.value = equipment
  showDetailsModal.value = true
}

const checkoutEquipment = (equipment: any) => {
  selectedEquipment.value = equipment
  showCheckoutModal.value = true
  showDetailsModal.value = false
}

const returnEquipment = (equipment: any) => {
  console.log('Returning equipment:', equipment.name)
  // Implement return logic
}

const confirmCheckout = () => {
  console.log('Checking out equipment:', selectedEquipment.value?.name, 'to:', checkoutData.value.userId)
  showCheckoutModal.value = false
  // Reset checkout data
  checkoutData.value = {
    userId: '',
    returnDate: '',
    notes: ''
  }
}

const generateQRCode = (equipment: any) => {
  selectedEquipment.value = equipment
  showQRModal.value = true
}

const scheduleMaintenanceModal = () => {
  console.log('Scheduling maintenance for:', selectedEquipment.value?.name)
  showDetailsModal.value = false
}
</script>