<template>
  <div class="min-h-screen bg-[#87BF81] py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center mb-8">
        <router-link 
          to="/storage" 
          class="text-white hover:text-white/80 transition-colors"
        >
          <span class="text-2xl">←</span>
        </router-link>
        <h1 class="text-3xl font-serif text-white ml-4">Add Storage Space</h1>
      </div>

      <div class="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg fern-pattern">
        <form @submit.prevent="createStorage" class="space-y-6">
          <!-- Storage Name -->
          <div>
            <label class="block text-sm font-medium text-[#4A8B4C] mb-2">Storage Name</label>
            <input 
              v-model="storageForm.name"
              type="text"
              placeholder="e.g. Basement Freezer"
              class="w-full px-4 py-2 rounded-lg bg-white border border-[#87BF81]/20 focus:outline-none focus:ring-2 focus:ring-[#4A8B4C]"
              required
            />
          </div>

          <!-- Storage Type -->
          <div>
            <label class="block text-sm font-medium text-[#4A8B4C] mb-2">Storage Type</label>
            <select 
              v-model="storageForm.type"
              class="w-full px-4 py-2 rounded-lg bg-white border border-[#87BF81]/20 focus:outline-none focus:ring-2 focus:ring-[#4A8B4C]"
              required
            >
              <option value="">Select a type...</option>
              <option value="refrigerator">Refrigerator</option>
              <option value="freezer">Freezer</option>
              <option value="pantry">Pantry</option>
              <option value="cellar">Cellar</option>
              <option value="cabinet">Cabinet</option>
              <option value="other">Other</option>
            </select>
          </div>

          <!-- Temperature Range -->
          <div v-if="needsTemperature" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-[#4A8B4C] mb-2">Min Temperature (°C)</label>
              <input 
                v-model.number="storageForm.minTemp"
                type="number"
                step="0.1"
                class="w-full px-4 py-2 rounded-lg bg-white border border-[#87BF81]/20 focus:outline-none focus:ring-2 focus:ring-[#4A8B4C]"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#4A8B4C] mb-2">Max Temperature (°C)</label>
              <input 
                v-model.number="storageForm.maxTemp"
                type="number"
                step="0.1"
                class="w-full px-4 py-2 rounded-lg bg-white border border-[#87BF81]/20 focus:outline-none focus:ring-2 focus:ring-[#4A8B4C]"
                required
              />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-[#4A8B4C] mb-2">Description</label>
            <textarea 
              v-model="storageForm.description"
              rows="4"
              placeholder="Describe the purpose and contents of this storage space..."
              class="w-full px-4 py-2 rounded-lg bg-white border border-[#87BF81]/20 focus:outline-none focus:ring-2 focus:ring-[#4A8B4C]"
              required
            ></textarea>
          </div>

          <!-- Location -->
          <div>
            <label class="block text-sm font-medium text-[#4A8B4C] mb-2">Location</label>
            <input 
              v-model="storageForm.location"
              type="text"
              placeholder="e.g. Kitchen, Basement, Garage"
              class="w-full px-4 py-2 rounded-lg bg-white border border-[#87BF81]/20 focus:outline-none focus:ring-2 focus:ring-[#4A8B4C]"
              required
            />
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end gap-4">
            <router-link
              to="/storage"
              class="px-6 py-3 text-[#4A8B4C] hover:text-[#87BF81] transition-colors"
            >
              Cancel
            </router-link>
            <button 
              type="submit"
              class="px-6 py-3 bg-[#4A8B4C] text-white rounded-lg hover:bg-[#87BF81] transition-colors shadow-md hover:shadow-lg"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Creating...' : 'Create Storage Space' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../config/api'

const router = useRouter()

interface StorageForm {
  name: string
  type: string
  minTemp: number | null
  maxTemp: number | null
  description: string
  location: string
}

const storageForm = ref<StorageForm>({
  name: '',
  type: '',
  minTemp: null,
  maxTemp: null,
  description: '',
  location: ''
})

const isSubmitting = ref(false)

const needsTemperature = computed(() => {
  return ['refrigerator', 'freezer', 'cellar'].includes(storageForm.value.type)
})

const createStorage = async () => {
  try {
    isSubmitting.value = true

    const response = await api.post('/api/storage-spaces', {
      ...storageForm.value,
      minTemp: needsTemperature.value ? storageForm.value.minTemp : null,
      maxTemp: needsTemperature.value ? storageForm.value.maxTemp : null
    })

    // Redirect to the new storage space
    router.push(`/storage/${response.data.id}`)
  } catch (error) {
    console.error('Error creating storage space:', error)
    // TODO: Show error message to user
  } finally {
    isSubmitting.value = false
  }
}
</script> 