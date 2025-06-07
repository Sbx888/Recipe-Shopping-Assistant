const Ingredient = require('../models/Ingredient');

// Common measurement units and their variations
const UNITS = {
  volume: {
    metric: ['ml', 'l', 'milliliter', 'millilitre', 'liter', 'litre'],
    imperial: ['fl oz', 'cup', 'cups', 'pint', 'pints', 'quart', 'quarts', 'gallon', 'gallons']
  },
  weight: {
    metric: ['mg', 'g', 'kg', 'milligram', 'gram', 'kilogram'],
    imperial: ['oz', 'lb', 'lbs', 'ounce', 'ounces', 'pound', 'pounds']
  },
  length: {
    metric: ['mm', 'cm', 'm', 'millimeter', 'centimeter', 'meter'],
    imperial: ['in', 'inch', 'inches', 'ft', 'foot', 'feet']
  },
  count: ['whole', 'piece', 'pieces', 'slice', 'slices', 'bunch', 'bunches']
};

// Common fraction words and their decimal equivalents
const FRACTIONS = {
  'half': 0.5,
  'quarter': 0.25,
  'third': 0.333,
  'fourth': 0.25,
  'eighth': 0.125,
  'three-quarters': 0.75,
  'two-thirds': 0.667,
  'one-half': 0.5,
  'one-quarter': 0.25,
  'one-third': 0.333,
  'one-fourth': 0.25,
  'one-eighth': 0.125
};

class IngredientParser {
  constructor() {
    this.numberPattern = /(\d+(\.\d+)?|\d+\/\d+|\d+\s+\d+\/\d+)/;
    this.fractionPattern = new RegExp(Object.keys(FRACTIONS).join('|'), 'i');
  }

  // Convert fraction string to decimal
  parseFraction(fraction) {
    if (!fraction) return null;
    
    // Handle word fractions
    const lowerFraction = fraction.toLowerCase();
    if (FRACTIONS[lowerFraction]) {
      return FRACTIONS[lowerFraction];
    }

    // Handle mixed numbers (e.g., "1 1/2")
    if (fraction.includes(' ')) {
      const [whole, frac] = fraction.split(' ');
      return parseFloat(whole) + this.parseFraction(frac);
    }

    // Handle simple fractions (e.g., "1/2")
    if (fraction.includes('/')) {
      const [num, denom] = fraction.split('/');
      return parseFloat(num) / parseFloat(denom);
    }

    return parseFloat(fraction);
  }

  // Find the unit in the ingredient text
  findUnit(text) {
    const words = text.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      for (const system of Object.values(UNITS)) {
        if (Array.isArray(system)) {
          if (system.includes(word)) return word;
        } else {
          for (const units of Object.values(system)) {
            if (units.includes(word)) return word;
          }
        }
      }
    }
    
    return null;
  }

  // Parse an ingredient string into structured data
  async parse(ingredientText) {
    const text = ingredientText.toLowerCase().trim();
    let quantity = null;
    let unit = null;
    let ingredient = text;

    // Try to find a numeric quantity
    const numberMatch = text.match(this.numberPattern);
    if (numberMatch) {
      quantity = this.parseFraction(numberMatch[0]);
      ingredient = ingredient.replace(numberMatch[0], '').trim();
    } else {
      // Try to find a word fraction
      const fractionMatch = text.match(this.fractionPattern);
      if (fractionMatch) {
        quantity = FRACTIONS[fractionMatch[0].toLowerCase()];
        ingredient = ingredient.replace(fractionMatch[0], '').trim();
      }
    }

    // Try to find a unit
    const foundUnit = this.findUnit(ingredient);
    if (foundUnit) {
      unit = foundUnit;
      // Remove the unit from the ingredient text
      ingredient = ingredient.replace(new RegExp(`\\b${foundUnit}\\b`), '').trim();
    }

    // Clean up the ingredient name
    ingredient = ingredient
      .replace(/^\W+|\W+$/g, '') // Remove leading/trailing non-word chars
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    // Try to match with standardized ingredient
    try {
      const standardIngredient = await Ingredient.findOne({
        $or: [
          { name: ingredient },
          { aliases: ingredient }
        ]
      });

      if (standardIngredient) {
        return {
          original: ingredientText,
          quantity,
          unit: unit || standardIngredient.defaultUnit,
          ingredient: standardIngredient.name,
          category: standardIngredient.category,
          standardized: true
        };
      }
    } catch (error) {
      console.error('Error matching ingredient:', error);
    }

    // Return non-standardized result if no match found
    return {
      original: ingredientText,
      quantity,
      unit,
      ingredient,
      standardized: false
    };
  }

  // Convert between metric and imperial measurements
  async convertMeasurement(quantity, fromUnit, toUnit, ingredient) {
    try {
      const standardIngredient = await Ingredient.findOne({
        $or: [
          { name: ingredient },
          { aliases: ingredient }
        ]
      });

      if (standardIngredient) {
        return standardIngredient.convert(quantity, fromUnit, toUnit);
      }

      throw new Error('Ingredient not found in database');
    } catch (error) {
      console.error('Error converting measurement:', error);
      throw error;
    }
  }
}

module.exports = new IngredientParser(); 