<template>
  <div class="py-12 bg-[#FDF8F3]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Welcome Section -->
      <div class="text-center mb-16">
        <h1 class="text-4xl font-serif text-[#5C4033] mb-4">Welcome to Recipe Shopping Assistant</h1>
        <p class="text-xl text-[#8B7355]">Manage your pantry, discover recipes, and create shopping lists with ease.</p>
      </div>

      <!-- Content based on auth status -->
      <div v-if="isAuthenticated" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition-shadow border border-[#E8DFD8]">
          <h2 class="text-2xl font-serif text-[#5C4033] mb-6">Quick Actions</h2>
          <div class="space-y-4">
            <router-link to="/recipe" class="block w-full bg-[#9B7653] hover:bg-[#8B6543] text-[#FDF8F3] px-6 py-4 rounded-xl text-center transition-colors duration-200">
              Add New Recipe
            </router-link>
            <button class="block w-full bg-[#7C9043] hover:bg-[#6C8033] text-[#FDF8F3] px-6 py-4 rounded-xl transition-colors duration-200">
              View Pantry
            </button>
            <button class="block w-full bg-[#B87E5C] hover:bg-[#A86E4C] text-[#FDF8F3] px-6 py-4 rounded-xl transition-colors duration-200">
              Shopping List
            </button>
          </div>
        </div>

        <!-- Recent Recipes -->
        <div class="bg-white rounded-2xl shadow-md p-8 border border-[#E8DFD8]">
          <h2 class="text-2xl font-serif text-[#5C4033] mb-6">Recent Recipes</h2>
          <div class="space-y-3">
            <p class="text-[#8B7355] italic">No recipes added yet.</p>
            <button class="text-[#9B7653] hover:text-[#8B6543] font-medium">
              Add your first recipe →
            </button>
          </div>
        </div>

        <!-- Pantry Status -->
        <div class="bg-white rounded-2xl shadow-md p-8 border border-[#E8DFD8]">
          <h2 class="text-2xl font-serif text-[#5C4033] mb-6">Pantry Status</h2>
          <div class="space-y-3">
            <p class="text-[#8B7355] italic">Your pantry is empty.</p>
            <button class="text-[#9B7653] hover:text-[#8B6543] font-medium">
              Start adding ingredients →
            </button>
          </div>
        </div>
      </div>

      <!-- Non-authenticated content -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div class="bg-white rounded-2xl shadow-md p-8 text-center border border-[#E8DFD8]">
          <div class="h-16 w-16 mx-auto mb-6 bg-[#FDF1E7] rounded-full flex items-center justify-center">
            <svg class="h-8 w-8 text-[#9B7653]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <h3 class="text-2xl font-serif text-[#5C4033] mb-3">Recipe Management</h3>
          <p class="text-[#8B7355]">Store and organize your favorite recipes in one place.</p>
        </div>

        <div class="bg-white rounded-2xl shadow-md p-8 text-center border border-[#E8DFD8]">
          <div class="h-16 w-16 mx-auto mb-6 bg-[#F0F5E5] rounded-full flex items-center justify-center">
            <svg class="h-8 w-8 text-[#7C9043]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-serif text-[#5C4033] mb-3">Smart Shopping Lists</h3>
          <p class="text-[#8B7355]">Automatically generate shopping lists from your recipes.</p>
        </div>

        <div class="bg-white rounded-2xl shadow-md p-8 text-center border border-[#E8DFD8]">
          <div class="h-16 w-16 mx-auto mb-6 bg-[#F9EBE0] rounded-full flex items-center justify-center">
            <svg class="h-8 w-8 text-[#B87E5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <h3 class="text-2xl font-serif text-[#5C4033] mb-3">Pantry Tracking</h3>
          <p class="text-[#8B7355]">Keep track of your ingredients and never run out.</p>
        </div>

        <div class="md:col-span-3 text-center mt-8">
          <div class="space-x-6">
            <router-link to="/login" class="inline-block bg-[#9B7653] hover:bg-[#8B6543] text-[#FDF8F3] px-8 py-4 rounded-xl transition-colors duration-200">
              Login
            </router-link>
            <router-link to="/register" class="inline-block bg-[#B87E5C] hover:bg-[#A86E4C] text-[#FDF8F3] px-8 py-4 rounded-xl transition-colors duration-200">
              Sign Up
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isAuthenticated = ref(false);

onMounted(() => {
  const token = localStorage.getItem('token');
  isAuthenticated.value = !!token;
});
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap');

.font-serif {
  font-family: 'Playfair Display', serif;
}
</style> 