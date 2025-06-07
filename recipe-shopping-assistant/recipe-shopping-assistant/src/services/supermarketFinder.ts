import axios from 'axios';

export interface Supermarket {
  name: string;
  address: string;
  distance: number;
  id: string;
}

export class SupermarketFinder {
  // In a real application, this would come from an environment variable
  private static readonly GEOCODING_API_KEY = 'YOUR_API_KEY';
  
  private static async getCoordinates(postcode: string): Promise<{ lat: number; lng: number }> {
    try {
      // For UK postcodes, you can use the postcodes.io API (free, no key required)
      const response = await axios.get(`https://api.postcodes.io/postcodes/${postcode}`);
      return {
        lat: response.data.result.latitude,
        lng: response.data.result.longitude
      };
    } catch (error) {
      console.error('Error getting coordinates:', error);
      throw new Error('Invalid postcode');
    }
  }

  static async findNearestSupermarkets(postcode: string): Promise<Supermarket[]> {
    try {
      const { lat, lng } = await this.getCoordinates(postcode);
      
      // This is a mock implementation. In a real application, you would:
      // 1. Use a supermarket's API or
      // 2. Use Google Places API with type='supermarket' or
      // 3. Have your own database of supermarket locations
      const mockSupermarkets: Supermarket[] = [
        {
          name: 'Tesco',
          address: '123 High Street',
          distance: 0.5,
          id: 'tesco-1'
        },
        {
          name: 'Sainsbury\'s',
          address: '456 Main Road',
          distance: 1.2,
          id: 'sainsburys-1'
        },
        {
          name: 'ASDA',
          address: '789 Market Square',
          distance: 1.8,
          id: 'asda-1'
        }
      ];

      // Sort by distance
      return mockSupermarkets.sort((a, b) => a.distance - b.distance);
    } catch (error) {
      console.error('Error finding supermarkets:', error);
      throw new Error('Failed to find nearby supermarkets');
    }
  }
} 