/**
 * Measurement units and their variations
 */
const UNITS = {
  volume: {
    metric: ['ml', 'l', 'milliliter', 'millilitre', 'liter', 'litre'],
    imperial: ['fl oz', 'cup', 'cups', 'pint', 'pints', 'quart', 'quarts', 'gallon', 'gallons']
  },
  weight: {
    metric: ['mg', 'g', 'kg', 'milligram', 'gram', 'kilogram'],
    imperial: ['oz', 'lb', 'lbs', 'ounce', 'ounces', 'pound', 'pounds']
  },
  count: ['whole', 'piece', 'pieces', 'slice', 'slices', 'bunch', 'bunches']
};

/**
 * Common fraction words and their decimal equivalents
 */
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

/**
 * Unit conversion ratios
 */
const CONVERSION_RATIOS = {
  // Volume
  'ml_to_fl_oz': 0.033814,
  'cup_to_ml': 250,
  'pint_to_ml': 473.176,
  'quart_to_ml': 946.353,
  'gallon_to_ml': 3785.41,
  
  // Weight
  'g_to_oz': 0.035274,
  'kg_to_lb': 2.20462,
  'mg_to_g': 0.001
};

/**
 * Parse ingredient text into structured data
 * Example: "2 cups flour" -> { ingredient: "flour", quantity: 2, unit: "cup" }
 */
async function parse(text) {
  // Simple implementation for now
  if (typeof text !== 'string') {
    return text;
  }

  const units = [
    'g', 'gram', 'grams',
    'kg', 'kilogram', 'kilograms',
    'ml', 'milliliter', 'milliliters',
    'l', 'liter', 'liters',
    'cup', 'cups',
    'tbsp', 'tablespoon', 'tablespoons',
    'tsp', 'teaspoon', 'teaspoons',
    'oz', 'ounce', 'ounces',
    'lb', 'pound', 'pounds',
    'piece', 'pieces'
  ];

  // Match pattern: [quantity] [unit] [ingredient]
  const pattern = new RegExp(`^(\\d+(?:\\.\\d+)?)\\s*(${units.join('|')})\\s+(.+)$`, 'i');
  const match = text.match(pattern);

  if (match) {
    const [, quantity, unit, ingredient] = match;
    return {
      ingredient: ingredient.trim(),
      quantity: parseFloat(quantity),
      unit: standardizeUnit(unit.toLowerCase())
    };
  }

  // If no match, return the text as the ingredient name
  return {
    ingredient: text.trim(),
    quantity: 1,
    unit: 'piece'
  };
}

/**
 * Standardize unit names (e.g., "grams" -> "g", "cups" -> "cup")
 */
function standardizeUnit(unit) {
  const unitMap = {
    'grams': 'g',
    'gram': 'g',
    'kilograms': 'kg',
    'kilogram': 'kg',
    'milliliters': 'ml',
    'milliliter': 'ml',
    'liters': 'l',
    'liter': 'l',
    'tablespoons': 'tbsp',
    'tablespoon': 'tbsp',
    'teaspoons': 'tsp',
    'teaspoon': 'tsp',
    'ounces': 'oz',
    'ounce': 'oz',
    'pounds': 'lb',
    'pound': 'lb',
    'pieces': 'piece'
  };

  return unitMap[unit] || unit;
}

module.exports = {
  parse
}; 