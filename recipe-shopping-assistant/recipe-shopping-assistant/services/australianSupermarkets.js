const axios = require('axios');
const configService = require('./configService');

class AustralianSupermarketsService {
  constructor() {
    this.configService = configService;
  }

  async getWoolworthsToken(apiKey) {
    try {
      const response = await axios.post('https://api.woolworths.com.au/apis/ui/v1/token', {}, {
        headers: {
          'Authorization': `Basic ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting Woolworths token:', error.message);
      throw new Error('Failed to authenticate with Woolworths API');
    }
  }

  async searchWoolworths(query, postcode) {
    const config = await this.configService.getSupermarketsByCountry('AU');
    const woolworths = config.find(s => s.name === 'Woolworths');
    
    if (!woolworths || !woolworths.apiKey) {
      throw new Error('Woolworths API configuration not found');
    }

    try {
      const token = await this.getWoolworthsToken(woolworths.apiKey);
      const response = await axios.get(`${woolworths.apiEndpoint}/products/search`, {
        params: {
          searchTerm: query,
          pageSize: 10,
          sortType: 'Relevance',
          location: postcode
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.products.map(product => ({
        id: product.stockcode,
        name: product.name,
        brand: product.brand,
        price: product.price,
        packageSize: product.packageSize,
        imageUrl: product.mediumImageFile,
        link: `https://www.woolworths.com.au/shop/productdetails/${product.stockcode}`
      }));
    } catch (error) {
      console.error('Error searching Woolworths:', error.message);
      return [];
    }
  }

  async searchColes(query, postcode) {
    const config = await this.configService.getSupermarketsByCountry('AU');
    const coles = config.find(s => s.name === 'Coles');
    
    if (!coles || !coles.apiKey) {
      throw new Error('Coles API configuration not found');
    }

    try {
      const response = await axios.post(`${coles.apiEndpoint}/search`, {
        query,
        filters: {
          fulfillment: {
            type: 'DELIVERY',
            postcode
          }
        },
        pageSize: 10
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${coles.apiKey}`
        }
      });

      return response.data.products.map(product => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price.value,
        packageSize: product.size,
        imageUrl: product.images.primary,
        link: `https://shop.coles.com.au/a/national/product/${product.urlKey}`
      }));
    } catch (error) {
      console.error('Error searching Coles:', error.message);
      return [];
    }
  }

  async searchIGA(query, postcode) {
    const config = await this.configService.getSupermarketsByCountry('AU');
    const iga = config.find(s => s.name === 'IGA');
    
    if (!iga || !iga.apiKey) {
      throw new Error('IGA API configuration not found');
    }

    try {
      // IGA uses a different API structure through Metcash Food
      const response = await axios.get(`${iga.apiEndpoint}/products`, {
        params: {
          search: query,
          postcode: postcode,
          limit: 10
        },
        headers: {
          'X-API-Key': iga.apiKey
        }
      });

      return response.data.products.map(product => ({
        id: product.sku,
        name: product.name,
        brand: product.brand,
        price: product.price,
        packageSize: product.weight,
        imageUrl: product.image_url,
        link: `https://www.iga.com.au/product/${product.sku}`
      }));
    } catch (error) {
      console.error('Error searching IGA:', error.message);
      return [];
    }
  }

  async searchAll(query, postcode) {
    const [woolworthsResults, colesResults, igaResults] = await Promise.allSettled([
      this.searchWoolworths(query, postcode),
      this.searchColes(query, postcode),
      this.searchIGA(query, postcode)
    ]);

    return {
      woolworths: woolworthsResults.status === 'fulfilled' ? woolworthsResults.value : [],
      coles: colesResults.status === 'fulfilled' ? colesResults.value : [],
      iga: igaResults.status === 'fulfilled' ? igaResults.value : []
    };
  }
}

module.exports = new AustralianSupermarketsService(); 