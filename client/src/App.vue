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
            <template v-if="isAuthenticated">
              <router-link to="/recipe" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">Add Recipe</router-link>
              <button @click="handleLogout" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md ml-4">Logout</button>
            </template>
            <template v-else>
              <router-link to="/login" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">Login</router-link>
              <router-link to="/register" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md ml-4">Register</router-link>
            </template>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isAuthenticated = ref(false);

onMounted(() => {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  isAuthenticated.value = !!token;
});

const handleLogout = () => {
  localStorage.removeItem('token');
  isAuthenticated.value = false;
  router.push('/login');
};
</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style> 