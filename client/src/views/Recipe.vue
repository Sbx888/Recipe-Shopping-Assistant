<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="grid grid-cols-1 gap-8">
      <!-- Settings Panel -->
      <UserSettings
        :postcode="userPostcode"
        :dietary-requirements="userDietaryRequirements"
        :preferred-supermarkets="userPreferredSupermarkets"
        @update="handleSettingsUpdate"
      />

      <!-- Recipe Input -->
      <RecipeInput @recipe-loaded="handleRecipeLoaded" />
      
      <!-- Recipe Details -->
      <div v-if="recipe" class="bg-white shadow rounded-lg p-6">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">{{ recipe.title }}</h2>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div v-if="recipe.prepTime" class="text-gray-600">
            <span class="font-medium">Prep Time:</span> {{ recipe.prepTime }}
          </div>
          <div v-if="recipe.cookTime" class="text-gray-600">
            <span class="font-medium">Cook Time:</span> {{ recipe.cookTime }}
          </div>
          <div class="text-gray-600">
            <span class="font-medium">Servings:</span> {{ recipe.servings }}
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Ingredients</h3>
          <div class="space-y-4">
            <div v-for="(ingredient, index) in recipe.ingredients" :key="index">
              <div class="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div class="text-gray-600">{{ ingredient }}</div>
                <button 
                  @click="toggleIngredientDetails(index)"
                  class="ml-4 text-sm text-blue-600 hover:text-blue-800"
                >
                  {{ expandedIngredients[index] ? 'Hide Details' : 'Show Details' }}
                </button>
              </div>
              <IngredientDetails
                v-if="expandedIngredients[index]"
                :ingredient="{ name: ingredient }"
                :postcode="userPostcode"
                :dietary-requirements="userDietaryRequirements"
                class="mt-2"
              />
            </div>
          </div>
        </div>

        <div v-if="recipe.instructions">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Instructions</h3>
          <ol class="list-decimal list-inside space-y-2">
            <li v-for="(step, index) in recipe.instructions" :key="index" class="text-gray-600">
              {{ step }}
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import RecipeInput from '../components/RecipeInput.vue'
import IngredientDetails from '../components/IngredientDetails.vue'
import UserSettings from '../components/UserSettings.vue'
import { useLocalStorage } from '../composables/useLocalStorage'
import type { DietaryRequirements, SupermarketPreferences, UserSettingsData } from '../types/settings'

interface Recipe {
  title: string
  prepTime?: string
  cookTime?: string
  servings: number
  ingredients: string[]
  instructions?: string[]
}

const recipe = ref<Recipe | null>(null)
const expandedIngredients = ref<boolean[]>([])

// Use localStorage for user settings with proper types
const userPostcode = useLocalStorage<string>('userPostcode', '2000')
const userDietaryRequirements = useLocalStorage<DietaryRequirements>('userDietaryRequirements', {
  vegetarian: false,
  vegan: false,
  glutenFree: false,
  dairyFree: false,
  nutFree: false,
  halal: false,
  kosher: false
})
const userPreferredSupermarkets = useLocalStorage<SupermarketPreferences>('userPreferredSupermarkets', {
  woolworths: true,
  coles: true,
  iga: true
})

const handleRecipeLoaded = (data: { recipe: Recipe }) => {
  recipe.value = data.recipe
  expandedIngredients.value = new Array(data.recipe.ingredients.length).fill(false)
}

const toggleIngredientDetails = (index: number) => {
  expandedIngredients.value[index] = !expandedIngredients.value[index]
}

const handleSettingsUpdate = (settings: UserSettingsData) => {
  userPostcode.value = settings.postcode
  userDietaryRequirements.value = settings.dietaryRequirements
  userPreferredSupermarkets.value = settings.preferredSupermarkets
}
</script>

<style scoped>
.ingredient-details {
  transition: all 0.3s ease;
}
</style> 