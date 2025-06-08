import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { readFile } from 'fs/promises';
import { join } from 'path';

interface Supermarket {
  id: string;
  name: string;
  country: string;
  apiEndpoint?: string;
  features: {
    delivery: boolean;
    pickup: boolean;
    realTimeInventory: boolean;
  };
}

interface CustomSupermarket extends Supermarket {
  userId: string;
  apiKey?: string;
}

export class SupermarketService {
  private customSupermarkets: Map<string, CustomSupermarket>;
  private supportedSupermarkets: Map<string, Supermarket[]>;

  constructor() {
    this.customSupermarkets = new Map();
    this.supportedSupermarkets = new Map();
    this.loadSupportedSupermarkets();
  }

  private async loadSupportedSupermarkets() {
    try {
      // Load supermarket configurations for different countries
      const countries = ['au', 'uk', 'us'];
      
      for (const country of countries) {
        const configPath = join(__dirname, `../../config/supermarkets.${country}.js`);
        const supermarkets = await import(configPath);
        this.supportedSupermarkets.set(country.toUpperCase(), supermarkets.default);
      }
    } catch (error) {
      console.error('Error loading supermarket configurations:', error);
    }
  }

  async findNearby(lat: number, lng: number): Promise<Supermarket[]> {
    try {
      // Use Google Places API to find supermarkets near the coordinates
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json`,
        {
          params: {
            location: `${lat},${lng}`,
            radius: 5000, // 5km radius
            type: 'supermarket',
            key: process.env.GOOGLE_MAPS_API_KEY
          }
        }
      );

      // Get supported supermarkets in the user's country
      const countryCode = await this.getCountryFromCoordinates(lat, lng);
      const supportedSupermarkets = this.supportedSupermarkets.get(countryCode) || [];

      // Filter Google Places results to only include supported supermarkets
      const nearbySupported = response.data.results
        .filter(place => 
          supportedSupermarkets.some(s => 
            place.name.toLowerCase().includes(s.name.toLowerCase())
          )
        )
        .map(place => {
          const supported = supportedSupermarkets.find(s =>
            place.name.toLowerCase().includes(s.name.toLowerCase())
          );
          return {
            ...supported,
            id: place.place_id,
            distance: this.calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
          };
        });

      // Add custom supermarkets for the user's country
      const customSupermarkets = Array.from(this.customSupermarkets.values())
        .filter(s => s.country === countryCode);

      return [...nearbySupported, ...customSupermarkets].sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Error finding nearby supermarkets:', error);
      return [];
    }
  }

  private async getCountryFromCoordinates(lat: number, lng: number): Promise<string> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            latlng: `${lat},${lng}`,
            key: process.env.GOOGLE_MAPS_API_KEY,
            result_type: 'country'
          }
        }
      );

      return response.data.results[0]?.address_components[0]?.short_name || 'US';
    } catch (error) {
      console.error('Error getting country from coordinates:', error);
      return 'US'; // Default to US if geocoding fails
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async addCustomSupermarket(data: Omit<CustomSupermarket, 'id'>): Promise<CustomSupermarket> {
    const id = uuidv4();
    const newSupermarket: CustomSupermarket = {
      id,
      ...data,
      features: {
        delivery: false,
        pickup: false,
        realTimeInventory: false
      }
    };

    this.customSupermarkets.set(id, newSupermarket);
    return newSupermarket;
  }

  async removeCustomSupermarket(id: string, userId: string): Promise<void> {
    const supermarket = this.customSupermarkets.get(id);
    
    if (!supermarket || supermarket.userId !== userId) {
      throw new Error('Supermarket not found or unauthorized');
    }

    this.customSupermarkets.delete(id);
  }

  async getSupermarketsByCountry(countryCode: string): Promise<Supermarket[]> {
    return this.supportedSupermarkets.get(countryCode.toUpperCase()) || [];
  }

  async validateCustomApi(apiEndpoint: string, apiKey?: string): Promise<boolean> {
    try {
      // Try to make a test request to the API
      const response = await axios.get(apiEndpoint, {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
        timeout: 5000
      });

      return response.status === 200;
    } catch (error) {
      console.error('Error validating custom API:', error);
      return false;
    }
  }
} 