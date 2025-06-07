<template>
  <div class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-8">Welcome to Recipe Shopping Assistant</h1>
        <p class="text-xl text-gray-600 mb-8">Manage your pantry, discover recipes, and create shopping lists with ease.</p>
        <div class="space-x-4">
          <router-link to="/recipe" class="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg">Add Recipe</router-link>
          <router-link to="/login" class="inline-block bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg">Login</router-link>
          <router-link to="/register" class="inline-block bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg">Sign Up</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Home component logic will be added here
</script> 