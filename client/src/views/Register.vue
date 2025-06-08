<template>
  <div class="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">Username</label>
            <input v-model="username" id="username" name="username" type="text" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Username">
          </div>
          <div>
            <label for="name" class="sr-only">Full name</label>
            <input v-model="name" id="name" name="name" type="text" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
            <label for="country" class="sr-only">Country</label>
            <select v-model="country" id="country" name="country" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm">
              <option value="">Select your country</option>
              <option value="AU">Australia</option>
              <option value="NZ">New Zealand</option>
              <option value="UK">United Kingdom</option>
              <option value="US">United States</option>
            </select>
          </div>
          
          <div>
            <label for="postcode" class="sr-only">{{ postcodeLabel }}</label>
            <input v-model="postcode" id="postcode" name="postcode" type="text" required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              :placeholder="postcodeLabel">
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Preferred Supermarket</label>
          <select v-model="preferredSupermarket"
            class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            <option v-for="supermarket in supermarketOptions" :key="supermarket.value" :value="supermarket.value">
              {{ supermarket.label }}
            </option>
          </select>
        </div>

        <div class="flex flex-col space-y-4">
          <div class="flex items-center justify-between">
            <span class="flex-grow flex flex-col">
              <span class="text-sm font-medium text-gray-900">Measurement System</span>
              <span class="text-sm text-gray-500">Choose your preferred measurement system</span>
            </span>
            <button 
              type="button"
              @click="useMetric = !useMetric"
              class="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :class="useMetric ? 'bg-blue-600' : 'bg-gray-200'"
              role="switch"
              :aria-checked="useMetric"
            >
              <span 
                class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"
                :class="useMetric ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>
          <div class="text-sm text-gray-500">
            <p class="font-medium mb-1">Currently using: {{ useMetric ? 'Metric' : 'Imperial' }}</p>
            <p class="mb-1">Common conversions:</p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="font-medium">Metric</p>
                <ul class="list-disc list-inside">
                  <li>250 ml</li>
                  <li>500 g</li>
                </ul>
              </div>
              <div>
                <p class="font-medium">Imperial</p>
                <ul class="list-disc list-inside">
                  <li>8.4 fl oz</li>
                  <li>1.1 lb</li>
                </ul>
              </div>
            </div>
          </div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../config/api'

const router = useRouter()
const username = ref('')
const name = ref('')
const email = ref('')
const password = ref('')
const country = ref('')
const postcode = ref('')
const preferredSupermarket = ref('')
const useMetric = ref(true)

interface SupermarketOption {
  value: string
  label: string
}

const supermarketsByCountry: Record<string, SupermarketOption[]> = {
  UK: [
    { value: 'tesco', label: 'Tesco' },
    { value: 'asda', label: 'Asda' },
    { value: 'sainsburys', label: "Sainsbury's" },
    { value: 'morrisons', label: 'Morrisons' },
    { value: 'waitrose', label: 'Waitrose' },
    { value: 'aldi', label: 'Aldi' },
    { value: 'lidl', label: 'Lidl' }
  ],
  AU: [
    { value: 'woolworths', label: 'Woolworths' },
    { value: 'coles', label: 'Coles' },
    { value: 'aldi', label: 'Aldi' },
    { value: 'iga', label: 'IGA' },
    { value: 'foodland', label: 'Foodland' },
    { value: 'harris_farm', label: 'Harris Farm' },
    { value: 'costco', label: 'Costco' }
  ],
  US: [
    { value: 'walmart', label: 'Walmart' },
    { value: 'kroger', label: 'Kroger' },
    { value: 'costco', label: 'Costco' },
    { value: 'target', label: 'Target' },
    { value: 'wholeFoods', label: 'Whole Foods' },
    { value: 'traderjoes', label: "Trader Joe's" },
    { value: 'safeway', label: 'Safeway' }
  ],
  NZ: [
    { value: 'countdown', label: 'Countdown' },
    { value: 'newworld', label: 'New World' },
    { value: 'paknsave', label: "PAK'nSAVE" },
    { value: 'foursquare', label: 'Four Square' },
    { value: 'freshchoice', label: 'FreshChoice' },
    { value: 'supervalue', label: 'SuperValue' }
  ]
}

const supermarketOptions = computed(() => {
  return country.value ? supermarketsByCountry[country.value] : []
})

const postcodeLabel = computed(() => {
  switch (country.value) {
    case 'US':
      return 'ZIP Code'
    case 'AU':
    case 'NZ':
      return 'Postcode'
    case 'UK':
      return 'Post Code'
    default:
      return 'Postal Code'
  }
})

const handleCountryChange = () => {
  // Reset the preferred supermarket when country changes
  preferredSupermarket.value = supermarketOptions.value[0]?.value || ''
}

const handleRegister = async () => {
  try {
    console.log('Sending registration request with data:', {
      name: name.value,
      email: email.value,
      country: country.value,
      postcode: postcode.value,
      preferredSupermarket: preferredSupermarket.value,
      useMetric: useMetric.value
    });

    const response = await api.post('/users/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      country: country.value,
      postcode: postcode.value,
      preferredSupermarket: preferredSupermarket.value,
      useMetric: useMetric.value
    });
    
    console.log('Registration successful:', response.data);
    localStorage.setItem('token', response.data.token);
    router.push('/');
  } catch (err: unknown) {
    console.error('Registration failed:', err);
    if (err instanceof Error && 'response' in err) {
      const axiosError = err as any;
      console.error('Server response:', axiosError.response?.data);
      alert(axiosError.response?.data?.error || 'Registration failed. Please try again.');
    } else {
      alert('Registration failed. Please try again.');
    }
  }
}
</script> 