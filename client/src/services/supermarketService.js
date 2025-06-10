import api from './api';

export default {
  /**
   * Search for products in a specific supermarket
   * @param {string} ingredient - The ingredient to search for
   * @param {string} supermarket - The supermarket name (woolworths/coles)
   * @param {string} postcode - The store location postcode
   * @returns {Promise<Array>} List of matching products
   */
  async searchProducts(ingredient, supermarket, postcode) {
    const response = await api.get('/supermarket/search', {
      params: { ingredient, supermarket, postcode }
    });
    return response.data.products;
  },

  /**
   * Find substitutes for an ingredient
   * @param {string} ingredient - The ingredient to find substitutes for
   * @param {string} postcode - The store location postcode
   * @param {Object} dietaryRequirements - Optional dietary requirements
   * @returns {Promise<Array>} List of substitute suggestions
   */
  async findSubstitutes(ingredient, postcode, dietaryRequirements = null) {
    const response = await api.get('/supermarket/substitutes', {
      params: {
        ingredient,
        postcode,
        dietaryRequirements: dietaryRequirements ? JSON.stringify(dietaryRequirements) : null
      }
    });
    return response.data.substitutes;
  },

  /**
   * Compare prices across supermarkets
   * @param {string} ingredient - The ingredient to compare prices for
   * @param {string} postcode - The store location postcode
   * @returns {Promise<Object>} Price comparison data
   */
  async comparePrices(ingredient, postcode) {
    const response = await api.get('/supermarket/compare-prices', {
      params: { ingredient, postcode }
    });
    return response.data;
  }
}; 