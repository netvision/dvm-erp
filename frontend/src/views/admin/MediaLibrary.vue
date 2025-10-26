<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Modern Gradient Header -->
    <div class="bg-gradient-to-r from-green-600 to-teal-600 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold">Media Library</h1>
            <p class="text-green-100 mt-2">Manage audio, video, and multimedia resources</p>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="showAddModal = true"
              class="bg-white text-green-600 px-6 py-2 rounded-lg hover:bg-green-50 transition-colors font-medium flex items-center space-x-2"
            >
              <PlusIcon class="w-5 h-5" />
              <span>Add Media Resource</span>
            </button>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm">Total Media Items</p>
                <p class="text-2xl font-bold text-white">{{ totalMediaResources }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <PlayCircleIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm">Video Content</p>
                <p class="text-2xl font-bold text-white">{{ videoCount }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <VideoCameraIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm">Audio Content</p>
                <p class="text-2xl font-bold text-white">{{ audioCount }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <SpeakerWaveIcon class="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-green-100 text-sm">Interactive Media</p>
                <p class="text-2xl font-bold text-white">{{ interactiveCount }}</p>
              </div>
              <div class="p-2 bg-white/20 rounded-lg">
                <CursorArrowRaysIcon class="w-6 h-6 text-white" />
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
              class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon class="w-4 h-4" />
              <span>Add Media</span>
            </button>
            <button
              @click="refreshResources"
              class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <ArrowPathIcon class="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
          <div class="text-sm text-gray-600">
            Showing {{ filteredResources.length }} of {{ mediaResources.length }} resources
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div class="relative">
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search media resources..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <select
            v-model="selectedType"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Types</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="interactive">Interactive Media</option>
            <option value="presentation">Presentation</option>
          </select>

          <select
            v-model="selectedCategory"
            class="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">All Categories</option>
            <option value="Educational">Educational</option>
            <option value="Documentary">Documentary</option>
            <option value="Training">Training</option>
            <option value="Lecture">Lecture</option>
          </select>
        </div>
      </div>

      <!-- Resources Grid -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div v-if="loading" class="p-12 text-center">
          <LoadingSpinner />
        </div>
        <div v-else-if="filteredResources.length === 0" class="p-12 text-center text-gray-500">
          <PlayCircleIcon class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p>No media resources found</p>
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
          <div v-for="resource in paginatedResources" :key="resource.id" class="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <!-- Media Preview -->
            <div class="aspect-video bg-gray-100 relative">
              <div v-if="resource.thumbnail_url" class="w-full h-full">
                <img :src="resource.thumbnail_url" :alt="resource.title" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-teal-100">
                <component :is="getMediaIcon(resource.media_type)" class="w-12 h-12 text-green-600" />
              </div>
              
              <!-- Play/Action Button -->
              <div class="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30">
                <button
                  @click="playMedia(resource)"
                  class="bg-white/90 text-green-600 p-3 rounded-full hover:bg-white transition-colors"
                >
                  <PlayIcon class="w-6 h-6" />
                </button>
              </div>

              <!-- Type Badge -->
              <div class="absolute top-2 left-2">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getTypeColorClass(resource.media_type)">
                  {{ resource.media_type }}
                </span>
              </div>

              <!-- Duration -->
              <div v-if="resource.duration" class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {{ resource.duration }}
              </div>
            </div>

            <!-- Media Info -->
            <div class="p-4">
              <h3 class="font-medium text-gray-900 truncate">{{ resource.title }}</h3>
              <p class="text-sm text-gray-500 mt-1">{{ resource.author || 'Unknown Author' }}</p>
              <p class="text-sm text-gray-500">{{ resource.category }}</p>
              
              <!-- Metadata -->
              <div class="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>{{ formatDate(resource.created_at) }}</span>
                <span>{{ resource.file_size || 'N/A' }}</span>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between mt-4">
                <div class="flex space-x-2">
                  <button
                    @click="viewMedia(resource)"
                    class="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                    title="View Media"
                  >
                    <EyeIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="editResource(resource)"
                    class="text-green-600 hover:text-green-800 p-1 rounded-lg hover:bg-green-50 transition-colors"
                    title="Edit Resource"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteResource(resource)"
                    class="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Resource"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
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
              {{ showAddModal ? 'Add Media Resource' : 'Edit Media Resource' }}
            </h2>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="saveResource" class="space-y-6">
            <!-- Basic Information Section -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    v-model="resourceForm.title"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter media title"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Author/Creator</label>
                  <input
                    v-model="resourceForm.author"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter creator name"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    v-model="resourceForm.media_type"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Type</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="interactive">Interactive Media</option>
                    <option value="presentation">Presentation</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    v-model="resourceForm.category"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Educational">Educational</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Training">Training</option>
                    <option value="Lecture">Lecture</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- File Upload Section -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Media File Upload</h3>
              
              <!-- Upload Method Toggle -->
              <div class="flex space-x-4 mb-4">
                <button
                  type="button"
                  @click="uploadMethod = 'file'"
                  :class="uploadMethod === 'file' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300'"
                  class="px-4 py-2 border rounded-lg font-medium transition-colors"
                >
                  Upload File
                </button>
                <button
                  type="button"
                  @click="uploadMethod = 'url'"
                  :class="uploadMethod === 'url' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-gray-100 text-gray-600 border-gray-300'"
                  class="px-4 py-2 border rounded-lg font-medium transition-colors"
                >
                  Media URL
                </button>
              </div>

              <!-- File Upload -->
              <div v-if="uploadMethod === 'file'" class="space-y-4">
                <div
                  @drop.prevent="handleFileDrop"
                  @dragover.prevent="isDragOver = true"
                  @dragleave.prevent="isDragOver = false"
                  :class="isDragOver ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'"
                  class="border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer"
                  @click="$refs.fileInput?.click()"
                >
                  <div v-if="selectedFile" class="space-y-2">
                    <div class="flex items-center justify-center">
                      <component :is="getFileIcon(selectedFile.type)" class="w-12 h-12 text-green-600" />
                    </div>
                    <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                    <button
                      type="button"
                      @click.stop="removeSelectedFile"
                      class="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove file
                    </button>
                  </div>
                  <div v-else class="space-y-2">
                    <div class="flex items-center justify-center">
                      <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                    </div>
                    <p class="text-sm text-gray-600">
                      <span class="font-medium text-green-600">Click to upload</span> or drag and drop
                    </p>
                    <p class="text-xs text-gray-500">MP4, AVI, MOV, MP3, WAV, PDF up to 100MB</p>
                  </div>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  @change="handleFileSelect"
                  accept="video/*,audio/*,.pdf,.ppt,.pptx"
                  class="hidden"
                />
              </div>

              <!-- URL Input -->
              <div v-if="uploadMethod === 'url'" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Media URL</label>
                  <input
                    v-model="resourceForm.url"
                    type="url"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="https://example.com/media-file"
                  />
                  <p class="text-xs text-gray-500 mt-1">
                    Supported: YouTube, Vimeo, direct video/audio links, or any media URL
                  </p>
                </div>
              </div>
            </div>

            <!-- Description Section -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <button
                  type="button"
                  @click="generateMediaDescription"
                  :disabled="generatingDescription"
                  class="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="generatingDescription" class="animate-spin -ml-1 mr-2 h-3 w-3 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="-ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {{ generatingDescription ? 'Analyzing...' : '🤖 AI Generate' }}
                </button>
              </div>
              <textarea
                v-model="resourceForm.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Brief description of the media resource (or click AI Generate to auto-generate)"
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
                class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {{ showAddModal ? 'Add Media' : 'Update Media' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Media Viewer Modal -->
  <div v-if="showViewModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" style="background: rgba(0,0,0,0.8);" @click="closeViewModal">
    <div class="bg-white rounded-lg w-full max-w-6xl max-h-screen overflow-auto" @click.stop>
      <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            {{ viewingResource?.title }}
          </h3>
          <button 
            @click="closeViewModal"
            class="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span class="sr-only">Close</span>
            <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="mt-2">
          <!-- Video Player -->
          <div v-if="viewingResource?.media_type === 'video'" class="w-full">
            <video 
              v-if="getMediaUrl(viewingResource)"
              :src="getMediaUrl(viewingResource)" 
              controls 
              class="w-full rounded-lg shadow-lg" 
              style="max-height: 500px;"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <!-- Audio Player -->
          <div v-else-if="viewingResource?.media_type === 'audio'" class="w-full">
            <div class="bg-gray-50 rounded-lg p-8 flex flex-col items-center">
              <div class="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
              <audio 
                v-if="getMediaUrl(viewingResource)"
                :src="getMediaUrl(viewingResource)" 
                controls 
                class="w-full max-w-md"
                preload="metadata"
              >
                Your browser does not support the audio tag.
              </audio>
            </div>
          </div>

          <!-- Presentation/Interactive Content -->
          <div v-else-if="viewingResource?.media_type === 'presentation' || viewingResource?.media_type === 'interactive'" class="w-full">
            <iframe 
              v-if="getMediaUrl(viewingResource)"
              :src="getMediaUrl(viewingResource)"
              class="w-full border-0 rounded-lg shadow-lg"
              style="height: 600px;"
              title="Media Viewer"
            ></iframe>
          </div>

          <!-- External URL -->
          <div v-else-if="viewingResource?.url" class="w-full">
            <iframe 
              :src="viewingResource.url"
              class="w-full border-0 rounded-lg shadow-lg"
              style="height: 600px;"
              title="External Media Viewer"
            ></iframe>
          </div>

          <!-- Fallback for unsupported formats -->
          <div v-else class="text-center py-12">
            <div class="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z"></path>
              </svg>
            </div>
            <p class="text-gray-500 mb-4">Preview not available for this media type.</p>
            <p class="text-sm text-gray-400 mb-6">{{ viewingResource?.description || 'No description available.' }}</p>
            <button 
              v-if="getMediaUrl(viewingResource)"
              @click="downloadMedia(viewingResource!)"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Media
            </button>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button 
            @click="closeViewModal"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
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
  PlayCircleIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  CursorArrowRaysIcon,
  PlayIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

// Type definition
interface MediaResource {
  id: number
  title: string
  author?: string
  media_type: string
  category?: string
  url?: string
  external_url?: string
  thumbnail_url?: string
  file_path?: string
  file_size?: string
  duration?: string
  description?: string
  created_at: string
  is_active?: boolean
}

// Store initialization
const authStore = useAuthStore()

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Reactive data
const mediaResources = ref<MediaResource[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedType = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const showAddModal = ref(false)
const showEditModal = ref(false)

// File upload data
const uploadMethod = ref('file')
const selectedFile = ref<File | null>(null)
const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// AI Description Generation
const generatingDescription = ref(false)

// Media Viewer data
const showViewModal = ref(false)
const viewingResource = ref<MediaResource | null>(null)

// Form data
const resourceForm = ref({
  id: null as number | null,
  title: '',
  author: '',
  media_type: '',
  category: '',
  url: '',
  description: ''
})

// Computed properties
const totalMediaResources = computed(() => mediaResources.value.length)
const videoCount = computed(() => mediaResources.value.filter(r => r.media_type === 'video').length)
const audioCount = computed(() => mediaResources.value.filter(r => r.media_type === 'audio').length)
const interactiveCount = computed(() => mediaResources.value.filter(r => r.media_type === 'interactive').length)

const filteredResources = computed(() => {
  let filtered = mediaResources.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(resource => 
      resource.title.toLowerCase().includes(query) ||
      resource.author?.toLowerCase().includes(query) ||
      resource.category?.toLowerCase().includes(query)
    )
  }

  if (selectedType.value) {
    filtered = filtered.filter(resource => resource.media_type === selectedType.value)
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(resource => resource.category === selectedCategory.value)
  }

  return filtered
})

const paginatedResources = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredResources.value.slice(start, end)
})

// Methods
const refreshResources = async () => {
  loading.value = true
  try {
    const response = await axios.get(`${API_BASE_URL}/api/library/media-resources`)
    mediaResources.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Error fetching media resources:', error)
    mediaResources.value = []
  } finally {
    loading.value = false
  }
}

const getMediaIcon = (type: string) => {
  switch (type) {
    case 'video': return VideoCameraIcon
    case 'audio': return SpeakerWaveIcon
    case 'interactive': return CursorArrowRaysIcon
    case 'presentation': return PlayCircleIcon
    default: return PlayCircleIcon
  }
}

const getTypeColorClass = (type: string) => {
  switch (type) {
    case 'video': return 'bg-blue-100 text-blue-800'
    case 'audio': return 'bg-green-100 text-green-800'
    case 'interactive': return 'bg-purple-100 text-purple-800'
    case 'presentation': return 'bg-orange-100 text-orange-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

// File upload functions
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    if (file) {
      validateAndSetFile(file)
    }
  }
}

const handleFileDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0]
    if (file) {
      validateAndSetFile(file)
    }
  }
}

const validateAndSetFile = (file: File) => {
  // Check file size (100MB limit for media files)
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    alert('File size exceeds 100MB limit. Please select a smaller file.')
    return
  }

  // Check file type
  const allowedTypes = [
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm',
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a',
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    alert('Invalid file type. Please select a video, audio, PDF, or presentation file.')
    return
  }

  selectedFile.value = file
  
  // Auto-detect media type from file type
  if (file.type.startsWith('video/')) {
    resourceForm.value.media_type = 'video'
  } else if (file.type.startsWith('audio/')) {
    resourceForm.value.media_type = 'audio'
  } else if (file.type.includes('presentation') || file.type.includes('powerpoint')) {
    resourceForm.value.media_type = 'presentation'
  } else {
    resourceForm.value.media_type = 'interactive'
  }
}

const removeSelectedFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const getFileIcon = (type: string) => {
  if (type.startsWith('video/')) return VideoCameraIcon
  if (type.startsWith('audio/')) return SpeakerWaveIcon
  if (type.includes('presentation') || type.includes('powerpoint')) return PlayCircleIcon
  return CursorArrowRaysIcon
}

const formatFileSize = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB']
  let unitIndex = 0
  let fileSize = bytes
  
  while (fileSize >= 1024 && unitIndex < units.length - 1) {
    fileSize /= 1024
    unitIndex++
  }
  
  return `${fileSize.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

// AI Description Generation
const generateMediaDescription = async () => {
  if (!resourceForm.value.title && !selectedFile.value && !resourceForm.value.url) {
    alert('Please provide a title, file, or URL first')
    return
  }

  generatingDescription.value = true

  try {
    const response = await fetch(`${API_BASE_URL}/api/library/media-resources/generate-description`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        title: resourceForm.value.title,
        author: resourceForm.value.author,
        media_type: resourceForm.value.media_type,
        category: resourceForm.value.category,
        url: resourceForm.value.url,
        filename: selectedFile.value?.name || ''
      })
    })

    const data = await response.json()
    
    if (data.success) {
      resourceForm.value.description = data.description
      console.log('✅ AI Description generated:', data.description)
    } else {
      console.error('❌ AI Description failed:', data.message)
      // Generate fallback description
      generateFallbackDescription()
    }
  } catch (error) {
    console.error('Error generating AI description:', error)
    generateFallbackDescription()
  } finally {
    generatingDescription.value = false
  }
}

const generateFallbackDescription = () => {
  const parts = []
  
  if (resourceForm.value.title) {
    parts.push(`"${resourceForm.value.title}" is a ${resourceForm.value.media_type || 'media'} resource`)
  }
  
  if (resourceForm.value.author) {
    parts.push(`created by ${resourceForm.value.author}`)
  }
  
  if (resourceForm.value.category) {
    parts.push(`in the ${resourceForm.value.category} category`)
  }
  
  // Add media-specific context
  if (resourceForm.value.media_type === 'video') {
    parts.push('This video content provides visual learning and educational material.')
  } else if (resourceForm.value.media_type === 'audio') {
    parts.push('This audio content offers listening-based learning and information.')
  } else if (resourceForm.value.media_type === 'presentation') {
    parts.push('This presentation material supports teaching and learning activities.')
  } else if (resourceForm.value.media_type === 'interactive') {
    parts.push('This interactive media provides engaging and hands-on learning experiences.')
  }
  
  resourceForm.value.description = parts.join('. ') + '.'
}

const playMedia = (resource: MediaResource) => {
  if (resource.url) {
    window.open(resource.url, '_blank')
  } else if (resource.file_path) {
    window.open(`/media/${resource.file_path}`, '_blank')
  }
}

const editResource = (resource: MediaResource) => {
  resourceForm.value = {
    id: resource.id,
    title: resource.title,
    author: resource.author || '',
    media_type: resource.media_type,
    category: resource.category || '',
    url: resource.url || '',
    description: resource.description || ''
  }
  showEditModal.value = true
}

const deleteResource = async (resource: MediaResource) => {
  if (confirm(`Are you sure you want to delete "${resource.title}"?`)) {
    try {
      await axios.delete(`${API_BASE_URL}/api/library/media-resources/${resource.id}`)
      await refreshResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Error deleting resource')
    }
  }
}

// Utility function to map media type to format
const getFormatFromType = (mediaType: string): string => {
  const formatMap: Record<string, string> = {
    'video': 'mp4',
    'audio': 'mp3', 
    'presentation': 'pptx',
    'interactive': 'html'
  }
  return formatMap[mediaType] || 'unknown'
}

const saveResource = async () => {
  try {
    let fileUrl = ''
    let filePath = ''
    
    // Step 1: Handle file upload if there's a selected file
    if (selectedFile.value && uploadMethod.value === 'file') {
      console.log('📁 Uploading file:', selectedFile.value.name)
      
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('type', resourceForm.value.media_type)
      formData.append('title', resourceForm.value.title)
      formData.append('category', resourceForm.value.category || '')
      
      // Upload file first
      const uploadResponse = await axios.post(`${API_BASE_URL}/api/library/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      if (uploadResponse.data.success) {
        fileUrl = uploadResponse.data.url || uploadResponse.data.file_url
        filePath = uploadResponse.data.file_path || uploadResponse.data.filename
        console.log('✅ File uploaded successfully:', fileUrl)
      } else {
        throw new Error('File upload failed: ' + uploadResponse.data.message)
      }
    }
    
    // Step 2: Create or update the media resource
    if (showAddModal.value) {
      const { id, media_type, ...resourceData } = resourceForm.value
      
      // Map frontend fields to backend expected fields
      const backendData = {
        ...resourceData,
        type: media_type, // Backend expects 'type' not 'media_type'
        format: getFormatFromType(media_type), // Provide required format field
        genre: resourceData.category || 'General', // Map category to genre
        language: 'English', // Default language
        access_level: 'public', // Default access level
        // Add file information if uploaded
        ...(fileUrl && { external_url: fileUrl }),
        ...(filePath && { file_path: filePath })
      }
      
      console.log('💾 Creating media resource with data:', backendData)
      await axios.post(`${API_BASE_URL}/api/library/media-resources`, backendData)
    } else {
      const { id, media_type, ...resourceData } = resourceForm.value
      
      // Map frontend fields to backend expected fields  
      const backendData = {
        ...resourceData,
        type: media_type, // Backend expects 'type' not 'media_type'
        format: getFormatFromType(media_type), // Provide required format field
        genre: resourceData.category || 'General', // Map category to genre
        language: 'English', // Default language
        access_level: 'public', // Default access level
        // Add file information if uploaded (for updates, only if new file)
        ...(fileUrl && { external_url: fileUrl }),
        ...(filePath && { file_path: filePath })
      }
      
      console.log('✏️ Updating media resource with data:', backendData)
      await axios.put(`${API_BASE_URL}/api/library/media-resources/${id}`, backendData)
    }
    
    closeModal()
    await refreshResources()
    console.log('✅ Media resource saved successfully!')
  } catch (error: any) {
    console.error('❌ Error saving resource:', error)
    alert(`Error saving resource: ${error.response?.data?.message || error.message || 'Unknown error'}`)
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  resourceForm.value = {
    id: null,
    title: '',
    author: '',
    media_type: '',
    category: '',
    url: '',
    description: ''
  }
  
  // Reset file upload state
  uploadMethod.value = 'file'
  selectedFile.value = null
  isDragOver.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Media viewer functions
const viewMedia = (resource: MediaResource) => {
  viewingResource.value = resource
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  viewingResource.value = null
}

const getMediaUrl = (resource: MediaResource | null): string => {
  if (!resource) return ''
  
  // Priority order for media URLs:
  // 1. external_url (for uploaded files via file upload endpoint)
  // 2. url (for external URLs entered manually)  
  // 3. file_path (construct from uploads directory)
  
  if (resource.external_url) {
    console.log('🔗 Using external_url:', resource.external_url)
    return resource.external_url
  }
  
  if (resource.url) {
    console.log('🌐 Using url:', resource.url)
    return resource.url
  }
  
  if (resource.file_path) {
    const constructedUrl = `${API_BASE_URL}/uploads/${resource.file_path}`
    console.log('📁 Using file_path, constructed URL:', constructedUrl)
    return constructedUrl
  }
  
  console.warn('❌ No media URL found for resource:', resource)
  return ''
}

const downloadMedia = async (resource: MediaResource) => {
  try {
    const mediaUrl = getMediaUrl(resource)
    if (!mediaUrl) {
      alert('No media file available for download')
      return
    }
    
    // For external URLs, open in new tab
    if (resource.url) {
      window.open(resource.url, '_blank')
      return
    }
    
    // For uploaded files, trigger download
    const response = await fetch(mediaUrl)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = resource.title || 'media-file'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading media:', error)
    alert('Error downloading media file')
  }
}

// Initialize
onMounted(() => {
  refreshResources()
})
</script>