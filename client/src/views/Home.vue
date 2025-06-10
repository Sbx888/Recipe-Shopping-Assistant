<template>
  <div class="min-h-screen py-12 bg-[#87BF81]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Welcome Section -->
      <div class="text-center mb-16">
        <h1 class="text-5xl font-bold font-serif text-white mb-4">Recipe Shopping Assistant</h1>
        <p class="text-xl text-white/90 mb-8">Your family's complete kitchen management companion</p>
      </div>

      <!-- Free Features Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <!-- Recipe Input Card -->
        <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all fern-pattern">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-serif text-[#4A8B4C] mb-3">Add Your Recipe</h2>
            <p class="text-gray-600">Import or manually add up to 7 recipes for free</p>
            <div class="mt-2 text-sm font-medium text-[#4A8B4C]">{{ recipeCountText }}</div>
          </div>
          
          <!-- Store Selector -->
          <div class="bg-[#87BF81]/10 rounded-xl p-6 mb-6">
            <h3 class="text-lg font-serif text-[#4A8B4C] mb-4">Select Your Location</h3>
            
            <!-- Postcode Input -->
            <div class="mb-4">
              <input 
                type="text"
                v-model="postcode"
                placeholder="Enter your postcode/ZIP code"
                class="w-full px-4 py-2 rounded-lg bg-white border border-[#87BF81]/20 focus:outline-none focus:ring-2 focus:ring-[#4A8B4C]"
              />
              <p v-if="country" class="mt-2 text-sm text-[#4A8B4C]">
                Showing stores for: {{ country }}
              </p>
            </div>

            <!-- Store Dropdown -->
            <select 
              v-model="selectedStore"
              class="w-full px-4 py-2 rounded-lg bg-white border border-[#87BF81]/20 focus:outline-none focus:ring-2 focus:ring-[#4A8B4C]"
            >
              <option value="">Select a store to compare prices</option>
              <option v-for="store in stores" :key="store.value" :value="store.value">
                {{ store.label }}
              </option>
            </select>
          </div>
          
          <div class="space-y-6">
            <!-- URL Input -->
            <div class="bg-[#87BF81]/10 rounded-xl p-6">
              <h3 class="text-lg font-serif text-[#4A8B4C] mb-4">Import from URL</h3>
              <div class="flex gap-4">
                <input 
                  type="url" 
                  v-model="recipeUrl" 
                  placeholder="Paste recipe URL here"
                  class="flex-1 px-4 py-2 rounded-lg bg-white border border-[#87BF81]/20 focus:outline-none focus:ring-2 focus:ring-[#4A8B4C]"
                />
                <button 
                  @click="importRecipe"
                  class="px-6 py-2 bg-[#4A8B4C] text-white rounded-lg hover:bg-[#87BF81] transition-colors shadow-md hover:shadow-lg"
                >
                  Import
                </button>
              </div>
            </div>

            <!-- Manual Input -->
            <div class="bg-[#87BF81]/10 rounded-xl p-6">
              <h3 class="text-lg font-serif text-[#4A8B4C] mb-4">Manual Input</h3>
              <div class="space-y-4">
                <input 
                  type="text"
                  v-model="recipeName"
                  placeholder="Recipe name"
                  class="w-full px-4 py-2 rounded-lg bg-white border border-[#87BF81]/20 focus:outline-none focus:ring-2 focus:ring-[#4A8B4C]"
                />
                <textarea
                  v-model="recipeIngredients"
                  placeholder="Enter ingredients (one per line)"
                  rows="4"
                  class="w-full px-4 py-2 rounded-lg bg-white border border-[#87BF81]/20 focus:outline-none focus:ring-2 focus:ring-[#4A8B4C]"
                ></textarea>
                <button 
                  @click="addRecipe"
                  class="w-full px-6 py-2 bg-[#4A8B4C] text-white rounded-lg hover:bg-[#87BF81] transition-colors shadow-md hover:shadow-lg"
                >
                  Add Recipe
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Premium Features Card -->
        <div class="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all fern-pattern">
          <div class="text-center mb-8">
            <h2 class="text-2xl font-serif text-[#4A8B4C] mb-3">Upgrade to Premium</h2>
            <p class="text-gray-600">Get access to advanced kitchen management features</p>
          </div>

          <div class="space-y-6">
            <div class="grid grid-cols-1 gap-4">
              <div class="flex items-start gap-3 p-4 bg-[#87BF81]/10 rounded-lg">
                <CheckCircleIcon class="w-6 h-6 text-[#4A8B4C] flex-shrink-0" />
                <div>
                  <h4 class="font-medium text-[#4A8B4C]">Custom Storage Spaces</h4>
                  <p class="text-sm text-gray-600">Create and manage multiple storage areas</p>
                </div>
              </div>
              <div class="flex items-start gap-3 p-4 bg-[#87BF81]/10 rounded-lg">
                <CheckCircleIcon class="w-6 h-6 text-[#4A8B4C] flex-shrink-0" />
                <div>
                  <h4 class="font-medium text-[#4A8B4C]">Individual Space Lists</h4>
                  <p class="text-sm text-gray-600">Generate shopping lists for each storage space</p>
                </div>
              </div>
              <div class="flex items-start gap-3 p-4 bg-[#87BF81]/10 rounded-lg">
                <CheckCircleIcon class="w-6 h-6 text-[#4A8B4C] flex-shrink-0" />
                <div>
                  <h4 class="font-medium text-[#4A8B4C]">Inventory Management</h4>
                  <p class="text-sm text-gray-600">Track items across all your spaces</p>
                </div>
              </div>
              <div class="flex items-start gap-3 p-4 bg-[#87BF81]/10 rounded-lg">
                <CheckCircleIcon class="w-6 h-6 text-[#4A8B4C] flex-shrink-0" />
                <div>
                  <h4 class="font-medium text-[#4A8B4C]">Combined Shopping Lists</h4>
                  <p class="text-sm text-gray-600">Create master lists from multiple spaces</p>
                </div>
              </div>
            </div>

            <div class="text-center pt-4">
              <router-link 
                to="/register" 
                class="inline-block px-8 py-3 bg-[#4A8B4C] text-white rounded-lg hover:bg-[#87BF81] transition-colors shadow-md hover:shadow-lg mb-4"
              >
                Get Premium Access
              </router-link>
              <div class="text-sm text-gray-600">
                <router-link 
                  to="/register?trial=true" 
                  class="text-[#4A8B4C] hover:text-[#87BF81] font-medium"
                >
                  Try Premium Free for 7 Days
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Support Section -->
      <div class="text-center">
        <div class="mb-8">
          <h3 class="text-xl font-serif text-white mb-4">Join Our Growing Community</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div class="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
              <p class="text-3xl font-bold text-[#4A8B4C] mb-2">50K+</p>
              <p class="text-gray-600">Active Users</p>
            </div>
            <div class="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
              <p class="text-3xl font-bold text-[#4A8B4C] mb-2">$2.5M</p>
              <p class="text-gray-600">Saved on Groceries</p>
            </div>
            <div class="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-md">
              <p class="text-3xl font-bold text-[#4A8B4C] mb-2">30%</p>
              <p class="text-gray-600">Less Food Waste</p>
            </div>
          </div>
        </div>

        <h2 class="text-2xl font-serif text-white mb-4">Support Our Project</h2>
        <p class="text-white/90 mb-6">Help us keep the free features available for everyone</p>
        <button 
          @click="showDonateModal = true"
          class="px-8 py-3 bg-white/90 text-[#4A8B4C] rounded-lg hover:bg-white transition-colors shadow-md hover:shadow-lg backdrop-blur-sm"
        >
          Make a Donation
        </button>
      </div>
    </div>

    <!-- Donation Modal -->
    <div v-if="showDonateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6 fern-pattern">
        <div class="text-center mb-6">
          <h3 class="text-2xl font-serif text-[#4A8B4C] mb-2">Support Our Project</h3>
          <p class="text-gray-600">Choose an amount to donate</p>
        </div>

        <div class="grid grid-cols-3 gap-4 mb-6">
          <button 
            v-for="amount in [5, 10, 20]" 
            :key="amount"
            @click="selectedAmount = amount"
            :class="[
              'px-4 py-2 rounded-lg font-medium transition-colors',
              selectedAmount === amount 
                ? 'bg-[#4A8B4C] text-white' 
                : 'bg-[#87BF81]/10 text-[#4A8B4C] hover:bg-[#87BF81]/20'
            ]"
          >
            ${{ amount }}
          </button>
        </div>

        <div class="space-y-4">
          <button 
            @click="processDonation"
            class="w-full px-6 py-3 bg-[#4A8B4C] text-white rounded-lg hover:bg-[#87BF81] transition-colors shadow-md hover:shadow-lg"
          >
            Complete Donation
          </button>
          <button 
            @click="showDonateModal = false"
            class="w-full px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { CheckCircleIcon } from '@heroicons/vue/24/solid';

type Store = {
  value: string;
  label: string;
};

type CountryStores = {
  'United States': Store[];
  'United Kingdom': Store[];
  'Canada': Store[];
  'Australia': Store[];
};

const recipeUrl = ref('');
const recipeName = ref('');
const recipeIngredients = ref('');
const showDonateModal = ref(false);
const selectedAmount = ref(10);
const selectedStore = ref('');
const recipeCount = ref(0);
const MAX_FREE_RECIPES = 7;
const postcode = ref('');
const country = ref('');

const stores = ref<Store[]>([
  { value: 'walmart', label: 'Walmart' },
  { value: 'kroger', label: 'Kroger' },
  { value: 'wholeFoods', label: 'Whole Foods' },
  { value: 'target', label: 'Target' },
  { value: 'traderjoes', label: "Trader Joe's" },
]);

const recipeCountText = computed(() => `Recipe ${recipeCount.value + 1} of ${MAX_FREE_RECIPES}`);
const canAddRecipe = computed(() => recipeCount.value < MAX_FREE_RECIPES);

// Detect country from postcode
watch(postcode, async (newPostcode) => {
  if (newPostcode.length >= 3) {
    try {
      // Australia postcodes are 4 digits
      if (/^\d{4}$/.test(newPostcode)) {
        country.value = 'Australia';
        updateStoresForCountry('Australia');
        return;
      }
      
      const response = await fetch(`https://api.zippopotam.us/${getCountryCode(newPostcode)}/${newPostcode}`);
      const data = await response.json();
      country.value = data.country;
      // Update available stores based on country
      updateStoresForCountry(data.country);
    } catch (error) {
      console.error('Error detecting country:', error);
      // Default to Australia if postcode looks Australian
      if (/^\d{4}$/.test(newPostcode)) {
        country.value = 'Australia';
        updateStoresForCountry('Australia');
      }
    }
  }
});

// Helper function to guess country code from postcode format
function getCountryCode(postcode: string): string {
  // Australia: 4 digits
  if (/^\d{4}$/.test(postcode)) {
    return 'AU';
  }
  // UK: AA9A 9AA, AA99 9AA, AA9 9AA
  if (/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(postcode)) {
    return 'GB';
  }
  // US: 12345, 12345-6789
  if (/^\d{5}(-\d{4})?$/.test(postcode)) {
    return 'US';
  }
  // Canada: A1A 1A1
  if (/^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/i.test(postcode)) {
    return 'CA';
  }
  // Default to Australia for 4-digit codes
  if (/^\d{4}$/.test(postcode)) {
    return 'AU';
  }
  // Default to US for anything else
  return 'US';
}

// Update available stores based on country
function updateStoresForCountry(countryName: string) {
  const storesByCountry: CountryStores = {
    'United States': [
      { value: 'walmart', label: 'Walmart' },
      { value: 'kroger', label: 'Kroger' },
      { value: 'wholeFoods', label: 'Whole Foods' },
      { value: 'target', label: 'Target' },
      { value: 'traderjoes', label: "Trader Joe's" },
    ],
    'United Kingdom': [
      { value: 'tesco', label: 'Tesco' },
      { value: 'sainsburys', label: 'Sainsbury\'s' },
      { value: 'asda', label: 'ASDA' },
      { value: 'morrisons', label: 'Morrisons' },
      { value: 'waitrose', label: 'Waitrose' },
    ],
    'Canada': [
      { value: 'loblaws', label: 'Loblaws' },
      { value: 'sobeys', label: 'Sobeys' },
      { value: 'metro', label: 'Metro' },
      { value: 'walmart', label: 'Walmart Canada' },
    ],
    'Australia': [
      { value: 'woolworths', label: 'Woolworths' },
      { value: 'coles', label: 'Coles' },
      { value: 'aldi', label: 'ALDI' },
      { value: 'iga', label: 'IGA' },
    ],
  };
  
  stores.value = storesByCountry[countryName as keyof CountryStores] || storesByCountry['United States'];
}

const importRecipe = () => {
  if (!canAddRecipe.value) {
    showPremiumModal();
    return;
  }
  // TODO: Implement recipe import
  console.log('Importing recipe from:', recipeUrl.value);
  recipeCount.value++;
};

const addRecipe = () => {
  if (!canAddRecipe.value) {
    showPremiumModal();
    return;
  }
  // TODO: Implement manual recipe addition
  console.log('Adding recipe:', {
    name: recipeName.value,
    ingredients: recipeIngredients.value.split('\n')
  });
  recipeCount.value++;
};

const showPremiumModal = () => {
  // TODO: Implement premium modal
  console.log('Showing premium modal');
};

const processDonation = () => {
  // TODO: Implement donation processing
  console.log('Processing donation:', selectedAmount.value);
  showDonateModal.value = false;
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600&display=swap');

.font-serif {
  font-family: 'Playfair Display', serif;
}
</style>

<style scoped>
.text-center h1 {
  color: black;
  font-weight: bold;
}

.bg-\[\#9BCC94\] {
  position: relative;
  overflow: hidden;
}

.bg-\[\#9BCC94\]::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/fern-pattern.png');
  background-size: 150% 150%;
  opacity: 0.1;
  pointer-events: none;
}

/* Hover animations */
.group:hover {
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.group:hover .text-white\/80 {
  opacity: 1;
}
</style> 