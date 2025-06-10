<template>
  <div class="min-h-screen bg-[#87BF81] py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center">
          <router-link 
            to="/dashboard" 
            class="text-white hover:text-white/80 transition-colors"
          >
            <span class="text-2xl">←</span>
          </router-link>
          <h1 class="text-3xl font-serif text-white ml-4">Storage Spaces</h1>
        </div>
        <button
          v-if="selectedSpaces.length > 0"
          @click="generateMasterList"
          class="px-4 py-2 bg-white/90 text-[#4A8B4C] rounded-lg hover:bg-white transition-colors shadow-md hover:shadow-lg backdrop-blur-sm"
        >
          Generate Master List ({{ selectedSpaces.length }})
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        <p class="text-white mt-4">Loading storage spaces...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> {{ error }}</span>
      </div>

      <!-- Storage Spaces Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Dynamic Storage Spaces -->
        <div v-for="space in storageSpaces" :key="space._id" class="group relative">
          <div class="absolute inset-0 bg-[url('/fern-pattern.png')] bg-cover opacity-10 rounded-xl"></div>
          <div class="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all relative fern-pattern">
            <div class="flex items-start">
              <input 
                type="checkbox" 
                v-model="selectedSpaces"
                :value="space._id"
                class="mt-1 h-5 w-5 text-[#4A8B4C] rounded border-gray-300 focus:ring-[#87BF81]"
              />
              <div class="ml-4 flex-1">
                <router-link 
                  :to="'/storage/' + space._id"
                  class="block group-hover:transform group-hover:-translate-y-1 transition-transform"
                >
                  <component :is="getIcon(space.type)" class="w-12 h-12 text-[#4A8B4C] mb-4" />
                  <h4 class="text-xl font-serif text-[#4A8B4C] mb-2">{{ space.name }}</h4>
                  <p class="text-gray-600 text-sm mb-4">{{ space.description }}</p>
                  <div class="space-y-2">
                    <div class="bg-[#87BF81]/10 rounded-lg py-2 px-4">
                      <p class="text-[#4A8B4C] text-sm">{{ space.itemCount || 0 }} items tracked</p>
                    </div>
                    <div class="bg-[#87BF81]/10 rounded-lg py-2 px-4">
                      <p class="text-[#4A8B4C] text-sm">{{ space.expiringCount || 0 }} items expiring soon</p>
                    </div>
                  </div>
                </router-link>
                <button 
                  @click="generateSpaceList(space._id)"
                  class="mt-4 w-full px-4 py-2 bg-[#4A8B4C] text-white rounded-lg hover:bg-[#87BF81] transition-colors shadow-md hover:shadow-lg"
                >
                  Generate List
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add New Space -->
        <router-link
          to="/storage/add"
          class="group relative"
        >
          <div class="absolute inset-0 bg-[url('/fern-pattern.png')] bg-cover opacity-5 rounded-xl"></div>
          <div class="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-[#4A8B4C] group-hover:border-[#87BF81] relative fern-pattern">
            <div class="text-center group-hover:transform group-hover:-translate-y-1 transition-transform">
              <PlusIcon class="w-12 h-12 text-[#4A8B4C] mx-auto mb-4" />
              <h4 class="text-xl font-serif text-[#4A8B4C] mb-2">Add New Space</h4>
              <p class="text-gray-600 text-sm">Create a custom storage space</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Square3Stack3DIcon, CloudIcon, ArchiveBoxIcon, PlusIcon } from '@heroicons/vue/24/outline'
import axios from 'axios'

const storageSpaces = ref([])
const selectedSpaces = ref<string[]>([])
const loading = ref(false)
const error = ref(null)

// Function to get the appropriate icon based on storage type
const getIcon = (type: string) => {
  const icons = {
    'fridge': Square3Stack3DIcon,
    'freezer': CloudIcon,
    'pantry': ArchiveBoxIcon,
    'default': ArchiveBoxIcon
  } as const

  return icons[type as keyof typeof icons] || icons.default
}

// Fetch storage spaces from the API
const fetchStorageSpaces = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await axios.get('/api/storage')
    storageSpaces.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load storage spaces'
    console.error('Error fetching storage spaces:', err)
  } finally {
    loading.value = false
  }
}

const generateSpaceList = async (spaceId: string) => {
  try {
    // TODO: Implement individual space list generation
    console.log('Generating list for space:', spaceId)
  } catch (err) {
    console.error('Error generating space list:', err)
  }
}

const generateMasterList = async () => {
  try {
    // TODO: Implement master list generation
    console.log('Generating master list for spaces:', selectedSpaces.value)
  } catch (err) {
    console.error('Error generating master list:', err)
  }
}

// Fetch data when component mounts
onMounted(() => {
  fetchStorageSpaces()
})
</script>

<style scoped>
.router-link-active {
  @apply text-[#4A8B4C];
}
</style> 