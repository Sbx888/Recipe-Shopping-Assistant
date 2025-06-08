import { Ingredient } from './recipeParser';

export interface IngredientWithPrice extends Ingredient {
  price: number;
  quantity: number;  // How many units/packages needed
  packageSize: number;  // Size of standard package
  leftover: number;  // Amount left after recipe
}

export interface StoredIngredient {
  name: string;
  amount: number;
  unit: string;
  expiryDate?: Date;
}

export class IngredientTracker {
  private static storage: StoredIngredient[] = [];

  // Mock price database - in a real app, this would come from a supermarket's API
  private static readonly mockPrices: Record<string, { price: number; size: number; unit: string }> = {
    'flour': { price: 1.50, size: 1000, unit: 'g' },
    'sugar': { price: 1.00, size: 1000, unit: 'g' },
    'eggs': { price: 2.50, size: 12, unit: 'pieces' },
    'milk': { price: 1.20, size: 1000, unit: 'ml' },
    'butter': { price: 2.00, size: 250, unit: 'g' },
    // Add more ingredients as needed
  };

  static addLeftoverIngredient(ingredient: StoredIngredient): void {
    const existingIndex = this.storage.findIndex(i => 
      i.name === ingredient.name && i.unit === ingredient.unit
    );

    if (existingIndex >= 0) {
      this.storage[existingIndex].amount += ingredient.amount;
    } else {
      this.storage.push(ingredient);
    }
  }

  static getAvailableIngredients(): StoredIngredient[] {
    // Remove expired ingredients
    const now = new Date();
    this.storage = this.storage.filter(i => !i.expiryDate || i.expiryDate > now);
    return this.storage;
  }

  static calculateNeededAmount(
    recipeIngredients: Ingredient[],
    supermarket: string
  ): IngredientWithPrice[] {
    const available = this.getAvailableIngredients();
    
    return recipeIngredients.map(ingredient => {
      // Find matching stored ingredient
      const stored = available.find(i => 
        i.name.toLowerCase() === ingredient.name.toLowerCase() && 
        i.unit === ingredient.unit
      );

      // Get price info (mock data)
      const priceInfo = this.mockPrices[ingredient.name.toLowerCase()] || {
        price: 1.00,  // Default price
        size: 1,
        unit: ingredient.unit
      };

      // Parse recipe amount
      const recipeAmount = parseFloat(ingredient.amount) || 0;
      
      // Calculate needed amount considering what's available
      const storedAmount = stored ? stored.amount : 0;
      const neededAmount = Math.max(0, recipeAmount - storedAmount);
      
      // Calculate packages needed
      const packagesNeeded = Math.ceil(neededAmount / priceInfo.size);
      const totalPrice = packagesNeeded * priceInfo.price;
      const leftover = (packagesNeeded * priceInfo.size) - neededAmount;

      return {
        ...ingredient,
        price: totalPrice,
        quantity: packagesNeeded,
        packageSize: priceInfo.size,
        leftover: leftover
      };
    });
  }
} 