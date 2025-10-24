<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Modern Gradient Header -->
    <div class="bg-gradient-to-r from-orange-600 to-red-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold">Equipment Management</h1>
            <p class="text-orange-100 mt-2">Manage laboratory, sports, and educational equipment</p>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="showAddModal = true"
              class="bg-white text-orange-600 px-6 py-2 rounded-lg hover:bg-orange-50 transition-colors font-medium flex items-center space-x-2"
            >
              <PlusIcon class="w-5 h-5" />
              <span>Add Equipment</span>
            </button>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-100 text-sm">Total Equipment</p>
                <p class="text-2xl font-bold text-white">{{ totalEquipment }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <WrenchScrewdriverIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-100 text-sm">Available</p>
                <p class="text-2xl font-bold text-white">{{ availableCount }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <CheckCircleIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-100 text-sm">Checked Out</p>
                <p class="text-2xl font-bold text-white">{{ checkedOutCount }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <ClockIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-orange-100 text-sm">In Maintenance</p>
                <p class="text-2xl font-bold text-white">{{ maintenanceCount }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <ExclamationTriangleIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Bar -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="showAddModal = true"
              class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon class="w-4 h-4" />
              <span>Add Equipment</span>
            </button>
            <button
              @click="refreshEquipment"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <ArrowPathIcon class="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              @click="exportReport"
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <DocumentArrowDownIcon class="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
          <div class="text-sm text-gray-600">
            Showing {{ filteredEquipment.length }} of {{ equipment.length }} items
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2">
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search equipment by name, model, or serial..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
          
          <select
            v-model="selectedCategory"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="checked_out">Checked Out</option>
            <option value="maintenance">Maintenance</option>
            <option value="damaged">Damaged</option>
          </select>
        </div>
      </div>

      <!-- Equipment Grid -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div v-if="loading" class="p-12 text-center">
          <LoadingSpinner />
        </div>
        <div v-else-if="filteredEquipment.length === 0" class="p-12 text-center text-gray-500">
          <WrenchScrewdriverIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p>No equipment found</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          <div
            v-for="item in paginatedEquipment"
            :key="item.id"
            class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <!-- Equipment Header -->
            <div class="p-4 border-b border-gray-100">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-2">
                    <component :is="getEquipmentIcon(item.category)" class="w-5 h-5 text-orange-600" />
                    <span class="text-xs font-medium text-gray-500 uppercase">{{ item.category }}</span>
                  </div>
                  <h3 class="font-semibold text-gray-900 mb-1">{{ item.name }}</h3>
                  <p class="text-sm text-gray-600">{{ item.model }}</p>
                </div>
                <div class="text-right">
                  <span
                    :class="[
                      'px-2 py-1 text-xs rounded-full font-medium',
                      getStatusColor(item.status)
                    ]"
                  >
                    {{ formatStatus(item.status) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Equipment Details -->
            <div class="p-4">
              <div class="space-y-2 text-sm text-gray-600 mb-4">
                <div class="flex justify-between">
                  <span>Serial #:</span>
                  <span class="font-medium font-mono text-xs">{{ item.serial_number }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Location:</span>
                  <span class="font-medium">{{ item.location }}</span>
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
                <div class="flex justify-between">
                  <span>Condition:</span>
                  <span
                    :class="[
                      'text-xs px-2 py-1 rounded-full font-medium',
                      getConditionColor(item.condition)
                    ]"
                  >
                    {{ item.condition }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <div class="flex space-x-2">
                  <button
                    v-if="item.status === 'available'"
                    @click="checkOutEquipment(item)"
                    class="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                    title="Check Out"
                  >
                    <ArrowRightOnRectangleIcon class="w-4 h-4" />
                  </button>
                  <button
                    v-if="item.status === 'checked_out'"
                    @click="checkInEquipment(item)"
                    class="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Check In"
                  >
                    <ArrowLeftOnRectangleIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="editEquipment(item)"
                    class="text-orange-600 hover:text-orange-800 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                    title="Edit"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteEquipment(item)"
                    class="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
                <button
                  @click="viewDetails(item)"
                  class="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  title="View Details"
                >
                  <EyeIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">
              {{ showAddModal ? 'Add Equipment' : 'Edit Equipment' }}
            </h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="saveEquipment" class="space-y-6">
            <!-- Basic Information Section -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Equipment Name *</label>
                  <input
                    v-model="equipmentForm.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter equipment name"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Model/Brand</label>
                  <input
                    v-model="equipmentForm.model"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter model/brand"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    v-model="equipmentForm.category"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Tablet">Tablets</option>
                    <option value="Audio/Visual">Audio/Visual</option>
                    <option value="Computer">Computers</option>
                    <option value="Camera">Cameras</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                  <input
                    v-model="equipmentForm.serial_number"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter serial number"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    v-model="equipmentForm.location"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter location"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                  <select
                    v-model="equipmentForm.condition"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Purchase Information Section -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Purchase Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                  <input
                    v-model="equipmentForm.purchase_date"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Warranty Until</label>
                  <input
                    v-model="equipmentForm.warranty_until"
                    type="date"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Description/Notes</label>
              <textarea
                v-model="equipmentForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Additional notes or description"
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                @click="closeModal"
                class="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                {{ showAddModal ? 'Add Equipment' : 'Update Equipment' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowPathIcon,
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  EyeIcon,
  ComputerDesktopIcon,
  CameraIcon,
  SpeakerWaveIcon,
  BeakerIcon,
  TrophyIcon,
  DeviceTabletIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import axios from 'axios'

// Type definition
interface Equipment {
  id: number
  name: string
  model?: string
  category: string
  serial_number?: string
  location?: string
  status: 'available' | 'checked_out' | 'maintenance' | 'damaged'
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  purchase_date?: string
  warranty_until?: string
  description?: string
  created_at: string
}

// Reactive data
const equipment = ref<Equipment[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const showAddModal = ref(false)
const showEditModal = ref(false)

// Form data
const equipmentForm = ref({
  id: null as number | null,
  name: '',
  model: '',
  category: '',
  serial_number: '',
  location: '',
  condition: 'good' as const,
  purchase_date: '',
  warranty_until: '',
  description: ''
})

// Computed properties
const totalEquipment = computed(() => equipment.value.length)
const availableCount = computed(() => equipment.value.filter(e => e.status === 'available').length)
const checkedOutCount = computed(() => equipment.value.filter(e => e.status === 'checked_out').length)
const maintenanceCount = computed(() => equipment.value.filter(e => e.status === 'maintenance').length)

const filteredEquipment = computed(() => {
  let filtered = equipment.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.model?.toLowerCase().includes(query) ||
      item.serial_number?.toLowerCase().includes(query) ||
      item.location?.toLowerCase().includes(query)
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(item => item.category === selectedCategory.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(item => item.status === selectedStatus.value)
  }

  return filtered
})

const paginatedEquipment = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredEquipment.value.slice(start, end)
})

// Methods
const refreshEquipment = async () => {
  loading.value = true
  try {
    const response = await axios.get('/library/equipment')
    equipment.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Error fetching equipment:', error)
    equipment.value = []
  } finally {
    loading.value = false
  }
}

const getEquipmentIcon = (category: string) => {
  switch (category) {
    case 'Computer': return ComputerDesktopIcon
    case 'Camera': return CameraIcon
    case 'Audio/Visual': return SpeakerWaveIcon
    case 'Laboratory': return BeakerIcon
    case 'Sports': return TrophyIcon
    case 'Tablet': return DeviceTabletIcon
    default: return WrenchScrewdriverIcon
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800'
    case 'checked_out': return 'bg-orange-100 text-orange-800'
    case 'maintenance': return 'bg-blue-100 text-blue-800'
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

const checkOutEquipment = async (item: Equipment) => {
  try {
    await axios.patch(`/library/equipment/${item.id}/checkout`)
    await refreshEquipment()
  } catch (error) {
    console.error('Error checking out equipment:', error)
    alert('Error checking out equipment')
  }
}

const checkInEquipment = async (item: Equipment) => {
  try {
    await axios.patch(`/library/equipment/${item.id}/checkin`)
    await refreshEquipment()
  } catch (error) {
    console.error('Error checking in equipment:', error)
    alert('Error checking in equipment')
  }
}

const editEquipment = (item: Equipment) => {
  equipmentForm.value = {
    id: item.id,
    name: item.name,
    model: item.model || '',
    category: item.category,
    serial_number: item.serial_number || '',
    location: item.location || '',
    condition: item.condition,
    purchase_date: item.purchase_date || '',
    warranty_until: item.warranty_until || '',
    description: item.description || ''
  }
  showEditModal.value = true
}

const deleteEquipment = async (item: Equipment) => {
  if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
    try {
      await axios.delete(`/library/equipment/${item.id}`)
      await refreshEquipment()
    } catch (error) {
      console.error('Error deleting equipment:', error)
      alert('Error deleting equipment')
    }
  }
}

const viewDetails = (item: Equipment) => {
  // Navigate to detailed view or show details modal
  console.log('View details for:', item)
}

const exportReport = () => {
  // Export equipment report
  console.log('Exporting equipment report...')
}

const saveEquipment = async () => {
  try {
    if (showAddModal.value) {
      const { id, ...equipmentData } = equipmentForm.value
      await axios.post('/library/equipment', equipmentData)
    } else {
      const { id, ...equipmentData } = equipmentForm.value
      await axios.put(`/library/equipment/${id}`, equipmentData)
    }
    
    closeModal()
    await refreshEquipment()
  } catch (error) {
    console.error('Error saving equipment:', error)
    alert('Error saving equipment')
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  equipmentForm.value = {
    id: null,
    name: '',
    model: '',
    category: '',
    serial_number: '',
    location: '',
    condition: 'good',
    purchase_date: '',
    warranty_until: '',
    description: ''
  }
}

// Initialize
onMounted(() => {
  refreshEquipment()
})
</script>