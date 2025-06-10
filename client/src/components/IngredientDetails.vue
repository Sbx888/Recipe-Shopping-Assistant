<template>
  <div class="ingredient-details">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading ingredient details...</p>
    </div>
    
    <div v-else class="content">
      <h3>{{ ingredient.name }}</h3>
      
      <!-- Price Comparison -->
      <div class="price-comparison" v-if="prices">
        <h4>Price Comparison</h4>
        <div class="supermarket-prices">
          <div class="supermarket" v-for="(items, store) in prices" :key="store">
            <h5>{{ store }}</h5>
            <div class="product-list">
              <div v-for="product in items" :key="product.name" class="product-card">
                <div class="product-info">
                  <p class="name">{{ product.name }}</p>
                  <p class="price">${{ product.price.toFixed(2) }}</p>
                  <p class="unit-price">
                    ${{ product.unitPrice.toFixed(2) }}/{{ product.unitType }}
                  </p>
                </div>
                <div class="stock-status" :class="{ 'in-stock': product.inStock }">
                  {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Substitutes -->
      <div class="substitutes" v-if="substitutes">
        <h4>Suggested Substitutes</h4>
        <div class="substitute-list">
          <div v-for="sub in substitutes" :key="sub.name" class="substitute-card">
            <div class="substitute-info">
              <h5>{{ sub.name }}</h5>
              <p class="reason">{{ sub.reason }}</p>
              <div v-if="sub.product" class="product-details">
                <p class="price">${{ sub.product.price.toFixed(2) }}</p>
                <p class="unit-price">
                  ${{ sub.product.unitPrice.toFixed(2) }}/{{ sub.product.unitType }}
                </p>
                <div class="stock-status" :class="{ 'in-stock': sub.product.inStock }">
                  {{ sub.product.inStock ? 'In Stock' : 'Out of Stock' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import supermarketService from '../services/supermarketService';

export default {
  name: 'IngredientDetails',
  
  props: {
    ingredient: {
      type: Object,
      required: true
    },
    postcode: {
      type: String,
      required: true
    },
    dietaryRequirements: {
      type: Object,
      default: () => null
    }
  },

  data() {
    return {
      loading: true,
      prices: null,
      substitutes: null,
      error: null
    };
  },

  async created() {
    try {
      this.loading = true;
      
      // Fetch prices and substitutes in parallel
      const [pricesResponse, substitutesResponse] = await Promise.all([
        supermarketService.comparePrices(this.ingredient.name, this.postcode),
        supermarketService.findSubstitutes(
          this.ingredient.name,
          this.postcode,
          this.dietaryRequirements
        )
      ]);

      this.prices = pricesResponse;
      this.substitutes = substitutesResponse;
    } catch (error) {
      console.error('Error fetching ingredient details:', error);
      this.error = 'Failed to load ingredient details. Please try again.';
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.ingredient-details {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.price-comparison, .substitutes {
  margin-top: 1.5rem;
}

.supermarket-prices {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.product-card, .substitute-card {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.product-info, .substitute-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.name {
  font-weight: 500;
}

.price {
  font-size: 1.2rem;
  color: #2c3e50;
}

.unit-price {
  font-size: 0.9rem;
  color: #666;
}

.stock-status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: #dc3545;
  color: white;
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.stock-status.in-stock {
  background: #28a745;
}

.reason {
  font-style: italic;
  color: #666;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
  padding: 1rem;
  background: #f8d7da;
  border-radius: 4px;
}
</style> 