const axios = require('axios');
const cheerio = require('cheerio');
const ingredientAnalyzer = require('./ingredientAnalyzer');
const DietaryRequirement = require('../models/DietaryRequirement');

class SupermarketApi {
  constructor() {
    this.baseUrls = {
      woolworths: 'https://www.woolworths.com.au/apis/ui/Search/products',
      coles: 'https://shop.coles.com.au/search/resources/store'
    };
  }

  /**
   * Search for products in the specified supermarket
   * @param {string} query - Search query
   * @param {string} supermarket - Supermarket name
   * @param {string} postcode - Store postcode
   * @param {Object} dietaryRequirements - User's dietary requirements
   * @returns {Promise<Array>} List of matching products
   */
  async searchProducts(query, supermarket, postcode, dietaryRequirements = null) {
    try {
      let products = [];
      
      switch (supermarket.toLowerCase()) {
        case 'woolworths':
          products = await this.searchWoolworths(query, postcode);
          break;
        case 'coles':
          products = await this.searchColes(query, postcode);
          break;
        default:
          throw new Error('Unsupported supermarket');
      }

      // Analyze ingredients and filter based on dietary requirements
      if (dietaryRequirements) {
        products = await this.filterProductsByDietaryRequirements(
          products,
          dietaryRequirements
        );
      }

      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  /**
   * Search for products in Woolworths
   * @param {string} query - Search query
   * @param {string} postcode - Store postcode
   * @returns {Promise<Array>} List of matching products
   */
  async searchWoolworths(query, postcode) {
    const response = await axios.post(this.baseUrls.woolworths, {
      SearchTerm: query,
      PageNumber: 1,
      PageSize: 24,
      SortType: 'TraderRelevance',
      Location: `/store/${postcode}/`,
      Filters: []
    });

    const products = response.data.Products.map(async product => {
      // Fetch detailed product information including ingredients
      const details = await this.fetchWoolworthsProductDetails(product.Stockcode);
      
      return {
        id: product.Stockcode,
        name: product.Name,
        brand: product.Brand,
        price: product.Price,
        packageSize: product.PackageSize,
        unitPrice: product.CupPrice,
        unitType: product.CupMeasure,
        imageUrl: product.SmallImageFile,
        link: `https://www.woolworths.com.au/shop/productdetails/${product.Stockcode}`,
        ingredients: details.ingredients || [],
        allergenWarnings: details.allergenWarnings || [],
        nutritionalInfo: details.nutritionalInfo || {},
        containsStatement: details.containsStatement,
        mayContainStatement: details.mayContainStatement
      };
    });

    return Promise.all(products);
  }

  /**
   * Search for products in Coles
   * @param {string} query - Search query
   * @param {string} postcode - Store postcode
   * @returns {Promise<Array>} List of matching products
   */
  async searchColes(query, postcode) {
    const response = await axios.get(`${this.baseUrls.coles}/${postcode}`, {
      params: {
        searchTerm: query
      }
    });

    const products = response.data.products.map(async product => {
      // Fetch detailed product information including ingredients
      const details = await this.fetchColesProductDetails(product.id);
      
      return {
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price.value,
        packageSize: product.size,
        unitPrice: product.unitPrice.value,
        unitType: product.unitPrice.unit,
        imageUrl: product.image,
        link: `https://shop.coles.com.au/a/national/product/${product.id}`,
        ingredients: details.ingredients || [],
        allergenWarnings: details.allergenWarnings || [],
        nutritionalInfo: details.nutritionalInfo || {},
        containsStatement: details.containsStatement,
        mayContainStatement: details.mayContainStatement
      };
    });

    return Promise.all(products);
  }

  /**
   * Fetch detailed product information from Woolworths
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Detailed product information
   */
  async fetchWoolworthsProductDetails(productId) {
    try {
      const response = await axios.get(
        `https://www.woolworths.com.au/apis/ui/product/${productId}`
      );

      const productInfo = response.data;
      const ingredientText = productInfo.NutritionalInformation?.Ingredients || '';
      const allergenText = productInfo.NutritionalInformation?.AllergenStatement || '';
      
      // Use ingredient analyzer to extract information
      const analyzed = ingredientAnalyzer.analyze(ingredientText + ' ' + allergenText);
      const nutritionalInfo = ingredientAnalyzer.extractNutritionalInfo(
        productInfo.NutritionalInformation?.NutritionalPanel || ''
      );

      return {
        ...analyzed,
        nutritionalInfo
      };
    } catch (error) {
      console.error('Error fetching Woolworths product details:', error);
      return {};
    }
  }

  /**
   * Fetch detailed product information from Coles
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Detailed product information
   */
  async fetchColesProductDetails(productId) {
    try {
      const response = await axios.get(
        `https://shop.coles.com.au/product-details/${productId}`
      );

      const $ = cheerio.load(response.data);
      const ingredientText = $('.product-details__ingredients-content').text();
      const allergenText = $('.product-details__allergen-statement').text();
      
      // Use ingredient analyzer to extract information
      const analyzed = ingredientAnalyzer.analyze(ingredientText + ' ' + allergenText);
      const nutritionalInfo = ingredientAnalyzer.extractNutritionalInfo(
        $('.product-details__nutrition-panel').text()
      );

      return {
        ...analyzed,
        nutritionalInfo
      };
    } catch (error) {
      console.error('Error fetching Coles product details:', error);
      return {};
    }
  }

  /**
   * Filter products based on dietary requirements
   * @param {Array} products - List of products
   * @param {Object} dietaryRequirements - Dietary requirements
   * @returns {Promise<Array>} Filtered list of products
   */
  async filterProductsByDietaryRequirements(products, dietaryRequirements) {
    return products.map(product => {
      const analysis = ingredientAnalyzer.checkDietaryCompliance(product, dietaryRequirements);
      
      return {
        ...product,
        dietaryAnalysis: analysis,
        isSafe: analysis.safe,
        warnings: analysis.warnings,
        incompatibleReasons: analysis.incompatibleReasons
      };
    });
  }

  /**
   * Find the best match for an ingredient based on dietary requirements
   * @param {string} ingredient - Ingredient name
   * @param {number} quantity - Required quantity
   * @param {string} unit - Unit of measurement
   * @param {string} supermarket - Supermarket name
   * @param {string} postcode - Store postcode
   * @param {Object} dietaryRequirements - Dietary requirements
   * @returns {Promise<Object>} Best matching product
   */
  async findBestMatch(ingredient, quantity, unit, supermarket, postcode, dietaryRequirements = null) {
    try {
      const products = await this.searchProducts(
        ingredient,
        supermarket,
        postcode,
        dietaryRequirements
      );

      if (products.length === 0) {
        return null;
      }

      // Filter safe products if dietary requirements are specified
      const safeProducts = dietaryRequirements
        ? products.filter(p => p.isSafe)
        : products;

      if (safeProducts.length === 0) {
        return {
          ...products[0],
          warning: 'No products match dietary requirements'
        };
      }

      // Sort by unit price if available, otherwise by price
      return safeProducts.sort((a, b) => {
        if (a.unitPrice && b.unitPrice) {
          return a.unitPrice - b.unitPrice;
        }
        return a.price - b.price;
      })[0];
    } catch (error) {
      console.error('Error finding best match:', error);
      return null;
    }
  }
}

module.exports = new SupermarketApi(); 