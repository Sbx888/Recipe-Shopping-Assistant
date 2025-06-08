export function parse(text) {
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