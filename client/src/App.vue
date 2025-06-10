<template>
  <div class="min-h-screen bg-[#87BF81]">
    <nav class="bg-white/90 backdrop-blur-sm shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <router-link 
              :to="isAuthenticated ? '/dashboard' : '/'" 
              class="flex items-center"
            >
              <span class="text-xl font-bold text-[#4A8B4C]">Recipe Shopping Assistant</span>
            </router-link>
          </div>
          <div class="flex items-center">
            <template v-if="isAuthenticated">
              <router-link 
                to="/dashboard" 
                class="text-[#4A8B4C] hover:text-[#87BF81] px-3 py-2 rounded-md transition-colors"
              >
                Dashboard
              </router-link>
              <router-link 
                to="/storage" 
                class="text-[#4A8B4C] hover:text-[#87BF81] px-3 py-2 rounded-md transition-colors"
              >
                Storage
              </router-link>
              <button 
                @click="handleLogout" 
                class="ml-4 px-4 py-2 bg-[#4A8B4C] text-white rounded-md hover:bg-[#87BF81] transition-all shadow-md hover:shadow-lg"
              >
                Logout
              </button>
            </template>
            <template v-else>
              <router-link 
                to="/login" 
                class="text-[#4A8B4C] hover:text-[#87BF81] px-3 py-2 rounded-md transition-colors"
              >
                Login
              </router-link>
              <router-link 
                to="/register" 
                class="ml-4 px-4 py-2 bg-[#4A8B4C] text-white rounded-md hover:bg-[#87BF81] transition-all shadow-md hover:shadow-lg"
              >
                Register
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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