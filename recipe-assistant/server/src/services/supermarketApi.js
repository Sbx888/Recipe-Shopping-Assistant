const axios = require('axios');
const { convertUnit } = require('./ingredientParser');

/**
 * Find the best matching product for an ingredient
 * @param {string} ingredient - The ingredient name
 * @param {number} quantity - The required quantity
 * @param {string} unit - The unit of measurement
 * @param {string} supermarket - The supermarket to search in
 * @param {string} postcode - The postcode for store location
 * @returns {Promise<Object>} Best matching product
 */
async function findBestMatch(ingredient, quantity, unit, supermarket, postcode) {
  try {
    // Get available products
    const products = await searchProducts(ingredient, supermarket, postcode);
    if (!products || products.length === 0) {
      return null;
    }

    // Find best match considering:
    // 1. Package size closest to required quantity
    // 2. Price per unit
    // 3. Brand reliability
    return findOptimalProduct(products, quantity, unit);
  } catch (error) {
    console.error('Error finding product match:', error);
    return null;
  }
}

/**
 * Search for products in a supermarket
 * @param {string} query - Search query
 * @param {string} supermarket - Supermarket name
 * @param {string} postcode - Store location postcode
 * @returns {Promise<Array>} List of matching products
 */
async function searchProducts(query, supermarket, postcode) {
  // Normalize supermarket name
  const store = supermarket.toLowerCase();
  
  // Select appropriate API endpoint
  let apiEndpoint;
  let headers = {};
  
  switch (store) {
    case 'woolworths':
      apiEndpoint = 'https://www.woolworths.com.au/apis/ui/Search/products';
      headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      break;
    case 'coles':
      apiEndpoint = 'https://shop.coles.com.au/search/resources/store/20601/productview/bySku';
      headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
      break;
    default:
      throw new Error('Unsupported supermarket');
  }

  try {
    // Make API request
    const response = await axios.get(apiEndpoint, {
      params: {
        searchTerm: query,
        postcode,
        pageSize: 20
      },
      headers
    });

    // Parse response based on supermarket format
    return parseProductResponse(response.data, store);
  } catch (error) {
    console.error(`Error searching ${store}:`, error);
    return [];
  }
}

/**
 * Parse supermarket-specific API responses
 * @param {Object} data - API response data
 * @param {string} supermarket - Supermarket name
 * @returns {Array} Normalized product list
 */
function parseProductResponse(data, supermarket) {
  switch (supermarket) {
    case 'woolworths':
      return data.Products.map(p => ({
        name: p.Name,
        brand: p.Brand,
        price: p.Price,
        packageSize: parsePackageSize(p.PackageSize),
        link: `https://www.woolworths.com.au/shop/productdetails/${p.Stockcode}`,
        imageUrl: p.SmallImageFile,
        stockcode: p.Stockcode
      }));

    case 'coles':
      return data.map(p => ({
        name: p.name,
        brand: p.brand,
        price: p.pricing.now,
        packageSize: parsePackageSize(p.size),
        link: `https://shop.coles.com.au/a/national/product/${p.id}`,
        imageUrl: p.imageUrl,
        stockcode: p.id
      }));

    default:
      return [];
  }
}

/**
 * Parse package size string into structured data
 * @param {string} size - Package size string
 * @returns {Object} Parsed size data
 */
function parsePackageSize(size) {
  if (!size) return null;

  // Clean up the size string
  const cleaned = size.toLowerCase()
    .replace(/approx\.?/i, '')
    .trim();

  // Extract number and unit
  const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*([a-z]+)$/);
  if (!match) return null;

  const [, quantity, unit] = match;
  return {
    quantity: parseFloat(quantity),
    unit: standardizeUnit(unit)
  };
}

/**
 * Standardize unit names
 * @param {string} unit - Unit name to standardize
 * @returns {string} Standardized unit
 */
function standardizeUnit(unit) {
  const mapping = {
    'g': 'g',
    'gram': 'g',
    'grams': 'g',
    'kg': 'kg',
    'kilo': 'kg',
    'kilos': 'kg',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'ml': 'ml',
    'milliliter': 'ml',
    'millilitre': 'ml',
    'l': 'l',
    'liter': 'l',
    'litre': 'l',
    'oz': 'oz',
    'ounce': 'oz',
    'ounces': 'oz',
    'lb': 'lb',
    'lbs': 'lb',
    'pound': 'lb',
    'pounds': 'lb'
  };

  return mapping[unit.toLowerCase()] || unit.toLowerCase();
}

/**
 * Find the optimal product from a list
 * @param {Array} products - List of products
 * @param {number} targetQuantity - Required quantity
 * @param {string} targetUnit - Required unit
 * @returns {Object} Best matching product
 */
function findOptimalProduct(products, targetQuantity, targetUnit) {
  if (!products || products.length === 0) return null;

  // Score each product
  const scoredProducts = products.map(product => {
    const size = product.packageSize;
    if (!size) return { product, score: 0 };

    // Convert units if needed
    let quantity = size.quantity;
    let unit = size.unit;
    if (unit !== targetUnit) {
      const converted = convertUnit(quantity, unit, true); // Convert to metric for comparison
      quantity = converted.quantity;
      unit = converted.unit;
    }

    // Calculate score based on:
    // 1. Size difference (closer to target = better)
    // 2. Price per unit (lower = better)
    // 3. Package size (prefer slightly larger than needed)
    const sizeDiff = Math.abs(quantity - targetQuantity);
    const sizeRatio = quantity / targetQuantity;
    const pricePerUnit = product.price / quantity;

    let score = 100;
    score -= sizeDiff * 2; // Penalize size difference
    score -= Math.abs(sizeRatio - 1.2) * 10; // Prefer packages ~20% larger than needed
    score -= pricePerUnit * 5; // Penalize higher price per unit

    return { product, score };
  });

  // Return product with highest score
  return scoredProducts.sort((a, b) => b.score - a.score)[0]?.product || null;
}

module.exports = {
  findBestMatch,
  searchProducts
}; 