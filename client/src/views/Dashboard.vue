<template>
  <div class="min-h-screen bg-[#87BF81] py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Recipe Input Section -->
      <div class="mb-8">
        <div class="bg-gradient-to-r from-[#9ebd13] to-[#008552] rounded-xl shadow-lg p-8">
          <h2 class="text-2xl font-serif text-white mb-6 text-center">Add Your Recipe</h2>
          
          <div class="space-y-6">
            <!-- URL Input -->
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 class="text-lg font-serif text-white mb-4">Import from URL</h3>
              <div class="flex gap-4">
                <input 
                  type="url" 
                  v-model="recipeUrl" 
                  placeholder="Paste recipe URL here"
                  class="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button 
                  @click="importRecipe"
                  class="px-6 py-2 bg-white text-[#008552] rounded-lg hover:bg-white/90 transition-colors"
                >
                  Import
                </button>
              </div>
            </div>

            <!-- Manual Input -->
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 class="text-lg font-serif text-white mb-4">Manual Input</h3>
              <div class="space-y-4">
                <input 
                  type="text"
                  v-model="recipeName"
                  placeholder="Recipe name"
                  class="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <textarea
                  v-model="recipeIngredients"
                  placeholder="Enter ingredients (one per line)"
                  rows="4"
                  class="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                ></textarea>
                <button 
                  @click="addRecipe"
                  class="w-full px-6 py-2 bg-white text-[#008552] rounded-lg hover:bg-white/90 transition-colors"
                >
                  Add Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Storage Navigation -->
      <div class="bg-gradient-to-r from-[#9ebd13] to-[#008552] rounded-xl shadow-lg p-8">
        <h2 class="text-2xl font-serif text-white mb-6 text-center">Storage Spaces</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <router-link 
            to="/storage"
            class="flex items-center gap-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <Square3Stack3DIcon class="w-6 h-6 text-white" />
            <span class="text-white">Main Fridge</span>
          </router-link>
          <router-link 
            to="/storage"
            class="flex items-center gap-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <CloudIcon class="w-6 h-6 text-white" />
            <span class="text-white">Freezer</span>
          </router-link>
          <router-link 
            to="/storage"
            class="flex items-center gap-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArchiveBoxIcon class="w-6 h-6 text-white" />
            <span class="text-white">Dry Pantry</span>
          </router-link>
          <router-link 
            to="/storage/add"
            class="flex items-center gap-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <PlusIcon class="w-6 h-6 text-white" />
            <span class="text-white">Add Space</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Square3Stack3DIcon, CloudIcon, ArchiveBoxIcon, PlusIcon } from '@heroicons/vue/24/outline'

const recipeUrl = ref('')
const recipeName = ref('')
const recipeIngredients = ref('')

const importRecipe = () => {
  // TODO: Implement recipe import
  console.log('Importing recipe from:', recipeUrl.value)
}

const addRecipe = () => {
  // TODO: Implement manual recipe addition
  console.log('Adding recipe:', {
    name: recipeName.value,
    ingredients: recipeIngredients.value
  })
}
</script> 