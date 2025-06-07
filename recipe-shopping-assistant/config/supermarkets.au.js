module.exports = [
  {
    country: 'AU',
    name: 'Woolworths',
    apiEndpoint: 'https://api.woolworths.com.au/apis/ui/v1',
    active: true,
    apiKey: process.env.WOOLWORTHS_API_KEY || '',
    description: 'Woolworths Supermarket API',
    features: {
      delivery: true,
      pickup: true,
      realTimeInventory: true,
      nutritionInfo: true,
      priceHistory: false
    },
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  {
    country: 'AU',
    name: 'Coles',
    apiEndpoint: 'https://api.coles.com.au/v1',
    active: true,
    apiKey: process.env.COLES_API_KEY || '',
    description: 'Coles Supermarket API',
    features: {
      delivery: true,
      pickup: true,
      realTimeInventory: true,
      nutritionInfo: true,
      priceHistory: false
    },
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  {
    country: 'AU',
    name: 'IGA',
    apiEndpoint: 'https://api.metcashfood.com/v1',
    active: true,
    apiKey: process.env.IGA_API_KEY || '',
    description: 'IGA (Metcash Food) API',
    features: {
      delivery: false,
      pickup: true,
      realTimeInventory: false,
      nutritionInfo: false,
      priceHistory: false
    },
    defaultHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
]; 