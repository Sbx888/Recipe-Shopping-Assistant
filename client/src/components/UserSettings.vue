<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Shopping Settings</h3>
    
    <div class="space-y-4">
      <!-- Postcode -->
      <div>
        <label for="postcode" class="block text-sm font-medium text-gray-700">Your Postcode</label>
        <input
          type="text"
          id="postcode"
          v-model="localPostcode"
          @change="updateSettings"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., 2000"
        />
      </div>

      <!-- Dietary Requirements -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Dietary Requirements</label>
        <div class="space-y-2">
          <div v-for="(label, value) in dietaryOptions" :key="value" class="flex items-center">
            <input
              type="checkbox"
              :id="value"
              v-model="localDietaryRequirements[value]"
              @change="updateSettings"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label :for="value" class="ml-2 block text-sm text-gray-700">{{ label }}</label>
          </div>
        </div>
      </div>

      <!-- Preferred Supermarkets -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Supermarkets</label>
        <div class="space-y-2">
          <div v-for="(label, value) in supermarketOptions" :key="value" class="flex items-center">
            <input
              type="checkbox"
              :id="value"
              v-model="localSupermarkets[value]"
              @change="updateSettings"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label :for="value" class="ml-2 block text-sm text-gray-700">{{ label }}</label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  postcode: string
  dietaryRequirements: Record<string, boolean>
  preferredSupermarkets: Record<string, boolean>
}>()

const emit = defineEmits<{
  (e: 'update', settings: {
    postcode: string
    dietaryRequirements: Record<string, boolean>
    preferredSupermarkets: Record<string, boolean>
  }): void
}>()

const localPostcode = ref(props.postcode)
const localDietaryRequirements = ref({ ...props.dietaryRequirements })
const localSupermarkets = ref({ ...props.preferredSupermarkets })

const dietaryOptions = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  glutenFree: 'Gluten Free',
  dairyFree: 'Dairy Free',
  nutFree: 'Nut Free',
  halal: 'Halal',
  kosher: 'Kosher'
}

const supermarketOptions = {
  woolworths: 'Woolworths',
  coles: 'Coles',
  iga: 'IGA'
}

// Watch for prop changes
watch(() => props.postcode, (newVal) => {
  localPostcode.value = newVal
})

watch(() => props.dietaryRequirements, (newVal) => {
  localDietaryRequirements.value = { ...newVal }
}, { deep: true })

watch(() => props.preferredSupermarkets, (newVal) => {
  localSupermarkets.value = { ...newVal }
}, { deep: true })

const updateSettings = () => {
  emit('update', {
    postcode: localPostcode.value,
    dietaryRequirements: localDietaryRequirements.value,
    preferredSupermarkets: localSupermarkets.value
  })
}
</script> 