<template>
  <div class="min-h-screen bg-[#87BF81] py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center">
          <router-link 
            to="/storage" 
            class="text-white hover:text-white/80 transition-colors"
          >
            <span class="text-2xl">←</span>
          </router-link>
          <h1 class="text-3xl font-serif text-white ml-4">{{ storageSpace.name }}</h1>
        </div>
        <div class="flex gap-4">
          <button
            v-if="selectedItems.length > 0"
            @click="addToHomeList"
            class="px-4 py-2 bg-white/90 text-[#4A8B4C] rounded-lg hover:bg-white transition-colors shadow-md hover:shadow-lg backdrop-blur-sm"
          >
            Add to Home List ({{ selectedItems.length }})
          </button>
          <button
            v-if="selectedItems.length > 0"
            @click="calculatePrice"
            class="px-4 py-2 bg-[#4A8B4C] text-white rounded-lg hover:bg-[#87BF81] transition-colors shadow-md hover:shadow-lg"
          >
            Calculate Price
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Storage Info -->
        <div class="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg fern-pattern">
          <h2 class="text-xl font-serif text-[#4A8B4C] mb-6">Storage Information</h2>
          <div class="space-y-4">
            <div class="bg-[#87BF81]/10 rounded-lg p-4">
              <span class="text-sm text-gray-500">Type:</span>
              <p class="text-[#4A8B4C]">{{ storageSpace.type }}</p>
            </div>
            <div v-if="storageSpace.minTemp !== null && storageSpace.maxTemp !== null" class="bg-[#87BF81]/10 rounded-lg p-4">
              <span class="text-sm text-gray-500">Temperature Range:</span>
              <p class="text-[#4A8B4C]">{{ storageSpace.minTemp }}°C to {{ storageSpace.maxTemp }}°C</p>
            </div>
            <div class="bg-[#87BF81]/10 rounded-lg p-4">
              <span class="text-sm text-gray-500">Description:</span>
              <p class="text-[#4A8B4C]">{{ storageSpace.description }}</p>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="mt-8">
            <h2 class="text-xl font-serif text-[#4A8B4C] mb-6">Quick Stats</h2>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-[#87BF81]/10 rounded-lg p-4">
                <p class="text-[#4A8B4C] text-2xl font-bold">{{ itemCount }}</p>
                <p class="text-sm text-gray-600">Items Tracked</p>
              </div>
              <div class="bg-[#87BF81]/10 rounded-lg p-4">
                <p class="text-[#4A8B4C] text-2xl font-bold">{{ expiringCount }}</p>
                <p class="text-sm text-gray-600">Expiring Soon</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Food Categories -->
        <div class="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg fern-pattern">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-serif text-[#4A8B4C]">Food Categories</h2>
            <div class="flex gap-2">
              <button
                @click="toggleSelectAll"
                class="px-3 py-2 text-sm bg-[#87BF81]/10 text-[#4A8B4C] rounded-lg hover:bg-[#87BF81]/20 transition-colors"
              >
                {{ allSelected ? 'Deselect All' : 'Select All' }}
              </button>
              <button
                @click="showAddItemModal = true"
                class="px-3 py-2 text-sm bg-[#4A8B4C] text-white rounded-lg hover:bg-[#87BF81] transition-colors shadow-md hover:shadow-lg"
              >
                <PlusIcon class="h-4 w-4 inline-block" />
                Add Item
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <div v-for="category in categories" :key="category.id" class="group">
              <div 
                @click="toggleCategory(category)"
                class="flex items-center gap-4 p-4 bg-[#87BF81]/10 rounded-lg cursor-pointer hover:bg-[#87BF81]/20 transition-colors"
              >
                <div class="flex-shrink-0">
                  <component 
                    :is="category.icon" 
                    class="w-6 h-6 text-[#4A8B4C]"
                  />
                </div>
                <div class="flex-grow">
                  <h3 class="text-[#4A8B4C] font-medium">{{ category.name }}</h3>
                  <p class="text-sm text-gray-600">{{ category.itemCount }} items</p>
                </div>
                <ChevronDownIcon 
                  class="w-5 h-5 text-[#4A8B4C] transition-transform"
                  :class="{ 'rotate-180': expandedCategories.includes(category.id) }"
                />
              </div>

              <!-- Category Items -->
              <div 
                v-if="expandedCategories.includes(category.id)"
                class="mt-2 pl-14 space-y-2"
              >
                <div 
                  v-for="item in category.items" 
                  :key="item._id"
                  class="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm"
                >
                  <input 
                    type="checkbox"
                    v-model="selectedItems"
                    :value="item._id"
                    class="h-4 w-4 text-[#4A8B4C] rounded border-gray-300 focus:ring-[#87BF81]"
                  />
                  <div class="flex-grow">
                    <p class="text-[#4A8B4C]">{{ item.name }}</p>
                    <p class="text-sm text-gray-500">{{ item.quantity }} {{ item.unit }}</p>
                  </div>
                  <div v-if="item.expiryDate" class="text-sm" :class="{
                    'text-red-500': isExpiringSoon(item.expiryDate),
                    'text-[#4A8B4C]': !isExpiringSoon(item.expiryDate)
                  }">
                    {{ formatDate(item.expiryDate) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Item Modal -->
    <div v-if="showAddItemModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl max-w-md w-full p-6 fern-pattern">
        <div class="flex justify-between items-start mb-6">
          <h3 class="text-xl font-serif text-[#4A8B4C]">Add New Item</h3>
          <button @click="showAddItemModal = false" class="text-gray-400 hover:text-gray-500">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <form @submit.prevent="addItem" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Item Name</label>
            <input 
              v-model="newItem.name"
              type="text"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4A8B4C] focus:ring-[#4A8B4C]"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Category</label>
            <select 
              v-model="newItem.categoryId"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4A8B4C] focus:ring-[#4A8B4C]"
            >
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Quantity</label>
              <input 
                v-model="newItem.quantity"
                type="number"
                min="0"
                step="0.1"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4A8B4C] focus:ring-[#4A8B4C]"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Unit</label>
              <select 
                v-model="newItem.unit"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4A8B4C] focus:ring-[#4A8B4C]"
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="g">Grams</option>
                <option value="l">Liters</option>
                <option value="ml">Milliliters</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input 
              v-model="newItem.expiryDate"
              type="date"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#4A8B4C] focus:ring-[#4A8B4C]"
            />
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button 
              type="button"
              @click="showAddItemModal = false"
              class="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-[#4A8B4C] text-white rounded-lg hover:bg-[#87BF81] transition-colors shadow-md hover:shadow-lg"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  PlusIcon, 
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline'
import axios from 'axios'

interface StorageSpace {
  name: string
  type: string
  minTemp: number | null
  maxTemp: number | null
  description: string
}

interface Item {
  _id: string
  name: string
  category: string
  quantity: number
  unit: string
  expiryDate?: string
}

interface Category {
  id: string
  name: string
  items: Item[]
  itemCount: number
  icon: string
}

const route = useRoute()
const storageId = route.params.id as string

const loading = ref(true)
const error = ref<string | null>(null)
const storageSpace = ref<StorageSpace>({
  name: 'Main Fridge',
  type: 'Refrigerator',
  minTemp: 2,
  maxTemp: 8,
  description: 'Main kitchen refrigerator for everyday items'
})
const items = ref<Item[]>([])
const categories = ref<Category[]>([])
const expandedCategories = ref<string[]>([])
const selectedItems = ref<string[]>([])
const showAddItemModal = ref(false)
const newItem = ref({
  name: '',
  categoryId: '',
  quantity: 1,
  unit: 'pcs',
  expiryDate: ''
})

const itemCount = computed(() => {
  return categories.value.reduce((total, cat) => total + cat.items.length, 0)
})

const expiringCount = computed(() => {
  return categories.value.reduce((total, cat) => {
    return total + cat.items.filter(item => isExpiringSoon(item.expiryDate)).length
  }, 0)
})

const allSelected = computed(() => {
  const allItems = categories.value.flatMap(cat => cat.items.map(item => item._id))
  return allItems.length > 0 && allItems.every(id => selectedItems.value.includes(id))
})

const toggleSelectAll = () => {
  if (selectedItems.value.length === items.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = items.value.map(item => item._id)
  }
}

const toggleCategory = (category: Category) => {
  const index = expandedCategories.value.indexOf(category.id)
  if (index === -1) {
    expandedCategories.value.push(category.id)
  } else {
    expandedCategories.value.splice(index, 1)
  }
}

const addItem = async () => {
  try {
    await axios.post(`/api/storage/${storageId}/items`, newItem.value)
    showAddItemModal.value = false
    newItem.value = {
      name: '',
      categoryId: '',
      quantity: 1,
      unit: 'pcs',
      expiryDate: ''
    }
    await fetchItems() // Refresh items list
  } catch (err: any) {
    console.error('Error adding item:', err)
    // You might want to show an error message to the user here
  }
}

const addToHomeList = () => {
  // TODO: Implement adding selected items to home list
  console.log('Adding to home list:', selectedItems.value)
}

const calculatePrice = () => {
  // TODO: Implement price calculation for selected items
  console.log('Calculating price for:', selectedItems.value)
}

const isExpiringSoon = (date: string | undefined) => {
  if (!date) return false
  const expiryDate = new Date(date)
  const now = new Date()
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0
}

const formatDate = (date: string | undefined) => {
  if (!date) return 'No expiry date'
  return new Date(date).toLocaleDateString()
}

const fetchStorageSpace = async () => {
  try {
    const response = await axios.get(`/api/storage/${storageId}`)
    storageSpace.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load storage space'
    console.error('Error fetching storage space:', err)
  }
}

const fetchItems = async () => {
  try {
    const response = await axios.get(`/api/storage/${storageId}/items`)
    items.value = response.data
    
    // Group items by category
    const groupedItems = items.value.reduce((acc: Record<string, Item[]>, item: Item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {})

    // Transform into categories array
    categories.value = Object.entries(groupedItems).map(([name, categoryItems]: [string, Item[]]) => ({
      id: name,
      name,
      items: categoryItems,
      itemCount: categoryItems.length,
      icon: getCategoryIcon(name)
    }))
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load items'
    console.error('Error fetching items:', err)
  }
}

const getCategoryIcon = (category: string) => {
  // You can expand this mapping based on your categories
  const icons = {
    'dairy': 'MilkIcon',
    'meat': 'MeatIcon',
    'vegetables': 'LeafIcon',
    'fruits': 'AppleIcon',
    'default': 'ArchiveBoxIcon'
  }
  return icons[category as keyof typeof icons] || icons.default
}

onMounted(async () => {
  loading.value = true
  error.value = null
  
  try {
    await Promise.all([
      fetchStorageSpace(),
      fetchItems()
    ])
  } catch (err: any) {
    error.value = 'Failed to load storage data'
    console.error('Error initializing storage detail:', err)
  } finally {
    loading.value = false
  }
})
</script> 