import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';
import { parse as parseIngredient } from './ingredientParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

// Supermarket API configurations
const supermarkets = {
  woolworths: {
    name: 'Woolworths',
    baseUrl: 'https://api.woolworths.com.au/apis/ui/v1',
    apiKey: process.env.WOOLWORTHS_API_KEY,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${process.env.WOOLWORTHS_API_KEY}`
    }
  },
  coles: {
    name: 'Coles',
    baseUrl: 'https://api.coles.com.au/v1',
    apiKey: process.env.COLES_API_KEY,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${process.env.COLES_API_KEY}`
    }
  },
  iga: {
    name: 'IGA',
    baseUrl: 'https://shop.igashop.com.au/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
};

/**
 * Search for products in a specific supermarket
 */
export async function searchProducts(ingredient, supermarketName, postcode) {
  try {
    const supermarket = supermarkets[supermarketName.toLowerCase()];
    if (!supermarket) {
      throw new Error(`Unsupported supermarket: ${supermarketName}`);
    }

    const response = await axios.get(`${supermarket.baseUrl}/products/search`, {
      headers: supermarket.headers,
      params: {
        searchTerm: ingredient,
        postcode,
        pageSize: 20
      }
    });

    return parseProductResponse(response.data, supermarketName);
  } catch (error) {
    console.error(`Error searching ${supermarketName}:`, error);
    return [];
  }
}

/**
 * Parse product response based on supermarket format
 */
function parseProductResponse(data, supermarketName) {
  switch (supermarketName.toLowerCase()) {
    case 'woolworths':
      return data.Products.map(p => ({
        id: p.Stockcode,
        name: p.Name,
        brand: p.Brand,
        price: p.Price,
        packageSize: p.PackageSize,
        unitPrice: p.CupPrice,
        unitType: p.CupMeasure,
        imageUrl: p.SmallImageFile,
        inStock: p.IsAvailable
      }));
    
    case 'coles':
      return data.products.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: p.price.value,
        packageSize: p.size,
        unitPrice: p.unitPrice.value,
        unitType: p.unitPrice.unit,
        imageUrl: p.image,
        inStock: p.availability === 'IN_STOCK'
      }));
    
    case 'iga':
      return data.products.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand || 'IGA',
        price: p.price,
        packageSize: p.size,
        unitPrice: p.unitPrice,
        unitType: p.unitType,
        imageUrl: p.image,
        inStock: p.inStock
      }));

    default:
      return [];
  }
}

/**
 * Find substitutes for an ingredient using AI and supermarket data
 */
export async function findSubstitutes(ingredient, dietaryRequirements, postcode) {
  try {
    // Get available products from supermarkets
    const [woolworthsProducts, colesProducts] = await Promise.all([
      searchProducts(ingredient, 'woolworths', postcode),
      searchProducts(ingredient, 'coles', postcode)
    ]);

    const availableProducts = [...woolworthsProducts, ...colesProducts];

    // Use GPT to find suitable substitutes
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: `You are a culinary expert AI that helps find suitable ingredient substitutes.
Consider:
1. Dietary restrictions: ${JSON.stringify(dietaryRequirements)}
2. Available products: ${JSON.stringify(availableProducts)}
3. Cooking properties and flavor profile
4. Nutritional similarity
5. Cost effectiveness

Return a JSON array of substitutes, ranked by suitability.`
        },
        {
          role: "user",
          content: `Find substitutes for: ${ingredient}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const substitutes = JSON.parse(completion.choices[0].message.content);
    
    // Enrich substitute suggestions with actual product data
    return enrichSubstituteData(substitutes, availableProducts);
  } catch (error) {
    console.error('Error finding substitutes:', error);
    throw error;
  }
}

/**
 * Enrich substitute suggestions with actual product data
 */
function enrichSubstituteData(substitutes, availableProducts) {
  return substitutes.suggestions.map(substitute => {
    const matchingProduct = availableProducts.find(p => 
      p.name.toLowerCase().includes(substitute.name.toLowerCase())
    );

    return {
      ...substitute,
      product: matchingProduct || null
    };
  });
}

/**
 * Get price comparison for an ingredient across supermarkets
 */
export async function comparePrices(ingredient, postcode) {
  try {
    const [woolworthsProducts, colesProducts, igaProducts] = await Promise.all([
      searchProducts(ingredient, 'woolworths', postcode),
      searchProducts(ingredient, 'coles', postcode),
      searchProducts(ingredient, 'iga', postcode)
    ]);

    return {
      woolworths: woolworthsProducts.map(p => ({
        name: p.name,
        price: p.price,
        unitPrice: p.unitPrice,
        unitType: p.unitType,
        inStock: p.inStock
      })),
      coles: colesProducts.map(p => ({
        name: p.name,
        price: p.price,
        unitPrice: p.unitPrice,
        unitType: p.unitType,
        inStock: p.inStock
      })),
      iga: igaProducts.map(p => ({
        name: p.name,
        price: p.price,
        unitPrice: p.unitPrice,
        unitType: p.unitType,
        inStock: p.inStock
      }))
    };
  } catch (error) {
    console.error('Error comparing prices:', error);
    throw error;
  }
}

/**
 * Get real-time inventory data for a specific store
 */
export async function getStoreInventory(storeName, location) {
  try {
    const api = supermarkets[storeName.toLowerCase()];
    if (!api) {
      throw new Error(`Unsupported store: ${storeName}`);
    }

    const response = await axios.get(`${api.baseUrl}/inventory`, {
      params: {
        location: location,
        apiKey: api.apiKey
      }
    });

    return response.data.inventory;
  } catch (error) {
    console.error('Error getting store inventory:', error);
    throw error;
  }
}

/**
 * Find the best matching products for a recipe
 */
export async function findRecipeProducts(recipe, location, preferences = {}) {
  try {
    const productMatches = [];

    for (const ingredient of recipe.ingredients) {
      const parsed = await parseIngredient(ingredient);
      const products = await searchProducts(parsed.ingredient, location);
      
      // Filter and sort products based on:
      // 1. Match with required quantity
      // 2. Price
      // 3. User preferences
      // 4. Availability
      const sortedProducts = products
        .filter(product => product.inStock)
        .sort((a, b) => {
          // Implement sorting logic based on the above criteria
          return 0; // Placeholder
        });

      productMatches.push({
        ingredient: parsed.ingredient,
        quantity: parsed.quantity,
        unit: parsed.unit,
        matches: sortedProducts.slice(0, 3) // Top 3 matches
      });
    }

    return productMatches;
  } catch (error) {
    console.error('Error finding recipe products:', error);
    throw error;
  }
}

/**
 * Calculate optimal shopping route
 */
export async function calculateShoppingRoute(products, location) {
  try {
    // Group products by store
    const storeGroups = products.reduce((groups, product) => {
      const store = product.store;
      if (!groups[store]) {
        groups[store] = [];
      }
      groups[store].push(product);
      return groups;
    }, {});

    // For each store, calculate:
    // 1. Total cost
    // 2. Distance from location
    // 3. Product availability
    const storeMetrics = await Promise.all(
      Object.entries(storeGroups).map(async ([store, products]) => {
        const inventory = await getStoreInventory(store, location);
        return {
          store,
          products,
          metrics: calculateStoreMetrics(products, inventory, location)
        };
      })
    );

    // Return optimal shopping plan
    return optimizeShoppingPlan(storeMetrics);
  } catch (error) {
    console.error('Error calculating shopping route:', error);
    throw error;
  }
}

/**
 * Calculate metrics for a store
 */
function calculateStoreMetrics(products, inventory, location) {
  // Placeholder implementation
  return {
    totalCost: products.reduce((sum, p) => sum + p.price, 0),
    availability: products.filter(p => p.inStock).length / products.length,
    distance: 0 // Would need to use mapping service to calculate
  };
}

/**
 * Optimize shopping plan across multiple stores
 */
function optimizeShoppingPlan(storeMetrics) {
  // Placeholder implementation
  // Would need to implement algorithm to:
  // 1. Minimize total cost
  // 2. Minimize travel distance
  // 3. Maximize product availability
  return storeMetrics.sort((a, b) => 
    (b.metrics.availability * 0.4 + b.metrics.totalCost * 0.4 + b.metrics.distance * 0.2) -
    (a.metrics.availability * 0.4 + a.metrics.totalCost * 0.4 + a.metrics.distance * 0.2)
  );
} 