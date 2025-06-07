<template>
  <div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="name" class="sr-only">Full name</label>
            <input v-model="name" id="name" name="name" type="text" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Full name">
          </div>
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input v-model="email" id="email" name="email" type="email" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address">
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input v-model="password" id="password" name="password" type="password" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password">
          </div>
          <div>
            <label for="postcode" class="sr-only">Postcode</label>
            <input v-model="postcode" id="postcode" name="postcode" type="text" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Postcode">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Preferred Supermarket</label>
          <select v-model="preferredSupermarket"
            class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option value="tesco">Tesco</option>
            <option value="asda">Asda</option>
            <option value="sainsburys">Sainsbury's</option>
            <option value="morrisons">Morrisons</option>
            <option value="waitrose">Waitrose</option>
            <option value="aldi">Aldi</option>
            <option value="lidl">Lidl</option>
          </select>
        </div>

        <div class="flex items-center">
          <input v-model="useMetric" id="useMetric" name="useMetric" type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
          <label for="useMetric" class="ml-2 block text-sm text-gray-900">
            Use metric measurements
          </label>
        </div>

        <div>
          <button type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Create Account
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const name = ref('')
const email = ref('')
const password = ref('')
const postcode = ref('')
const preferredSupermarket = ref('tesco')
const useMetric = ref(true)

const handleRegister = async () => {
  try {
    const response = await axios.post('/api/users/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      postcode: postcode.value,
      preferredSupermarket: preferredSupermarket.value,
      useMetric: useMetric.value
    })
    
    // Store the token in localStorage
    localStorage.setItem('token', response.data.token)
    
    // Redirect to dashboard or home page
    router.push('/')
  } catch (error) {
    console.error('Registration failed:', error)
    // Handle error (show message to user)
  }
}
</script> 