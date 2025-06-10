<template>
  <div class="recipe-input">
    <div class="input-group">
      <label for="recipeUrl">Recipe URL:</label>
      <input 
        type="url" 
        id="recipeUrl" 
        v-model="recipeUrl" 
        placeholder="https://..."
        :disabled="loading"
      />
    </div>

    <div class="input-group">
      <label for="servings">Servings:</label>
      <input 
        type="number" 
        id="servings" 
        v-model="servings" 
        min="1"
        :disabled="loading"
      />
    </div>

    <button 
      @click="handleSubmit" 
      :disabled="loading || !recipeUrl"
      class="import-button"
    >
      <span v-if="loading" class="loading-spinner"></span>
      {{ loading ? loadingStatus : 'Import Recipe' }}
    </button>

    <div v-if="error" class="error-message">
      <p><strong>Error:</strong> {{ error.message }}</p>
      <p v-if="error.details" class="error-details">{{ error.details }}</p>
      <p v-if="error.phase" class="error-phase">Failed during: {{ error.phase }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '../config/api'

const emit = defineEmits(['recipe-loaded'])

const inputType = ref('url')
const recipeUrl = ref('')
const servings = ref(4)
const loading = ref(false)
const loadingStatus = ref('')
const error = ref<{ message: string; details?: string; phase?: string } | null>(null)

// Get user's location from profile
const userLocation = ref('default')

// Fetch user's location when component mounts
onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    if (token) {
      const response = await api.get('/users/profile')
      userLocation.value = response.data.postcode || response.data.location || 'default'
    }
  } catch (err) {
    console.error('Failed to fetch user location:', err)
    userLocation.value = 'default'
  }
})

const manualInput = ref({
  title: '',
  ingredients: '',
  instructions: '',
  prepTime: '',
  cookTime: ''
})

const handleSubmit = async () => {
  loading.value = true
  error.value = null
  loadingStatus.value = 'Initializing request...'

  try {
    if (inputType.value === 'url') {
      loadingStatus.value = 'Sending request to server...'
      console.log('🔵 [Recipe Import] Starting import:', recipeUrl.value)

      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      try {
        const response = await api.post('/api/recipes/parse-url', {
          url: recipeUrl.value,
          servings: servings.value,
          location: userLocation.value
        }, {
          signal: controller.signal,
          onUploadProgress: (progressEvent) => {
            loadingStatus.value = 'Processing recipe...'
          }
        })

        console.log('✅ [Recipe Import] Success:', response.data)
        loadingStatus.value = 'Recipe imported successfully!'
        emit('recipe-loaded', response.data)
      } catch (err: any) {
        console.error('🔴 [Recipe Import] Error:', err)
        error.value = err.response?.data?.error || {
          message: 'Failed to import recipe',
          details: err.message,
          phase: err.code === 'ERR_CANCELED' ? 'timeout' : 'network'
        }
      } finally {
        clearTimeout(timeoutId)
      }
    } else {
      // Handle manual input...
      loadingStatus.value = 'Processing manual input...'
      const ingredients = manualInput.value.ingredients
        .split('\n')
        .map(i => i.trim())
        .filter(i => i)

      const instructions = manualInput.value.instructions
        .split('\n')
        .map(i => i.trim())
        .filter(i => i)

      const recipe = {
        title: manualInput.value.title,
        ingredients,
        instructions,
        cookingTime: {
          prep: manualInput.value.prepTime,
          cook: manualInput.value.cookTime
        },
        servings: servings.value
      }

      emit('recipe-loaded', recipe)
    }
  } catch (err: any) {
    console.error('🔴 [Recipe Import] Unexpected error:', err)
    error.value = {
      message: 'An unexpected error occurred',
      details: err.message
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.recipe-input {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.input-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.import-button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.import-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  background-color: #ffebee;
  color: #c62828;
}

.error-details {
  margin-top: 5px;
  font-size: 0.9em;
  color: #d32f2f;
}

.error-phase {
  margin-top: 5px;
  font-size: 0.9em;
  font-style: italic;
  color: #d32f2f;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 