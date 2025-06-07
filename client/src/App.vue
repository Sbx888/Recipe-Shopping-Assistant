<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <router-link to="/" class="flex items-center">
              <span class="text-xl font-bold text-gray-800">Recipe Shopping Assistant</span>
            </router-link>
          </div>
          <div class="flex items-center">
            <router-link to="/login" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">Login</router-link>
            <router-link to="/register" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md ml-4">Register</router-link>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
// Component logic will be added here
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style> 