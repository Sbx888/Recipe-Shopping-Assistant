<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-2xl font-semibold text-gray-900 mb-6">Add a Recipe</h2>
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label for="recipeUrl" class="block text-sm font-medium text-gray-700">Recipe URL</label>
        <input
          type="url"
          id="recipeUrl"
          v-model="recipeUrl"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="https://example.com/recipe"
        />
      </div>
      
      <div>
        <label for="servings" class="block text-sm font-medium text-gray-700">Number of Servings</label>
        <input
          type="number"
          id="servings"
          v-model="servings"
          min="1"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div class="flex justify-end">
        <button
          type="submit"
          class="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :disabled="loading"
        >
          {{ loading ? 'Processing...' : 'Get Recipe' }}
        </button>
      </div>

      <div v-if="error" class="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '../config/api'

const emit = defineEmits(['recipe-loaded'])

const recipeUrl = ref('')
const servings = ref(4)
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await api.get('/recipes', {
      params: {
        url: recipeUrl.value,
        servings: servings.value
      }
    })
    
    emit('recipe-loaded', response.data)
    recipeUrl.value = ''
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to load recipe'
  } finally {
    loading.value = false
  }
}
</script> 