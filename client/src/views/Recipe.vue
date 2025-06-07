<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <RecipeInput @recipe-loaded="handleRecipeLoaded" />
    
    <div v-if="recipe" class="mt-8">
      <div class="bg-white shadow rounded-lg p-6">
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
          <ul class="list-disc list-inside space-y-1">
            <li v-for="(ingredient, index) in recipe.ingredients" :key="index" class="text-gray-600">
              {{ ingredient }}
            </li>
          </ul>
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

interface Recipe {
  title: string
  prepTime?: string
  cookTime?: string
  servings: number
  ingredients: string[]
  instructions?: string[]
}

const recipe = ref<Recipe | null>(null)

const handleRecipeLoaded = (data: { recipe: Recipe }) => {
  recipe.value = data.recipe
}
</script> 