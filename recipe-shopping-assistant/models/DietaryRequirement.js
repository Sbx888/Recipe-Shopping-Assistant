const mongoose = require('mongoose');

const allergenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    lowercase: true
  },
  severity: {
    type: String,
    enum: ['strict', 'cautious', 'preference'],
    default: 'strict'
  },
  notes: String
});

const dietaryRequirementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  diet: {
    type: String,
    enum: [
      'none',
      'vegetarian',
      'vegan',
      'pescatarian',
      'kosher',
      'halal',
      'gluten-free',
      'dairy-free',
      'keto',
      'paleo'
    ],
    default: 'none'
  },
  allergens: [allergenSchema],
  preferences: [{
    type: String,
    enum: [
      'low-sodium',
      'low-sugar',
      'low-fat',
      'organic',
      'non-gmo',
      'no-artificial-colors',
      'no-artificial-flavors',
      'no-preservatives'
    ]
  }],
  avoidIngredients: [{
    ingredient: String,
    reason: String
  }],
  preferredBrands: [{
    brand: String,
    reason: String
  }],
  notes: String
}, {
  timestamps: true
});

// Common allergens list
dietaryRequirementSchema.statics.commonAllergens = [
  'milk',
  'eggs',
  'fish',
  'shellfish',
  'tree nuts',
  'peanuts',
  'wheat',
  'soybeans',
  'sesame',
  'celery',
  'mustard',
  'sulphites',
  'lupin',
  'molluscs'
];

// Method to check if a product is safe based on dietary requirements
dietaryRequirementSchema.methods.isProductSafe = function(productIngredients, allergenWarnings = []) {
  // Check diet compatibility
  if (this.diet !== 'none') {
    const incompatibleIngredients = this.getDietIncompatibleIngredients(productIngredients);
    if (incompatibleIngredients.length > 0) {
      return {
        safe: false,
        reason: `Contains ingredients incompatible with ${this.diet} diet: ${incompatibleIngredients.join(', ')}`
      };
    }
  }

  // Check allergens
  for (const allergen of this.allergens) {
    // Check ingredients list
    const allergenFound = productIngredients.some(ingredient =>
      ingredient.toLowerCase().includes(allergen.name.toLowerCase())
    );

    // Check allergen warnings for strict and cautious severities
    const warningFound = allergenWarnings.some(warning =>
      warning.toLowerCase().includes(allergen.name.toLowerCase())
    );

    if (allergenFound || (allergen.severity !== 'preference' && warningFound)) {
      return {
        safe: false,
        reason: `Contains or may contain allergen: ${allergen.name}`
      };
    }
  }

  // Check avoided ingredients
  for (const avoided of this.avoidIngredients) {
    if (productIngredients.some(ingredient =>
      ingredient.toLowerCase().includes(avoided.ingredient.toLowerCase())
    )) {
      return {
        safe: false,
        reason: `Contains avoided ingredient: ${avoided.ingredient}`
      };
    }
  }

  // Check preferences
  const violatedPreferences = [];
  for (const pref of this.preferences) {
    switch (pref) {
      case 'organic':
        if (!productIngredients.some(i => i.toLowerCase().includes('organic'))) {
          violatedPreferences.push('not organic');
        }
        break;
      case 'non-gmo':
        if (productIngredients.some(i => i.toLowerCase().includes('genetically modified'))) {
          violatedPreferences.push('contains GMO ingredients');
        }
        break;
      // Add more preference checks as needed
    }
  }

  return {
    safe: true,
    warnings: violatedPreferences.length > 0 ? violatedPreferences : undefined
  };
};

// Helper method to check diet compatibility
dietaryRequirementSchema.methods.getDietIncompatibleIngredients = function(ingredients) {
  const incompatible = [];
  const lowerIngredients = ingredients.map(i => i.toLowerCase());

  switch (this.diet) {
    case 'vegetarian':
      if (lowerIngredients.some(i => 
        i.includes('meat') || 
        i.includes('beef') || 
        i.includes('chicken') || 
        i.includes('pork') ||
        i.includes('gelatin')
      )) {
        incompatible.push('meat products');
      }
      break;

    case 'vegan':
      if (lowerIngredients.some(i => 
        i.includes('meat') || 
        i.includes('milk') || 
        i.includes('egg') || 
        i.includes('honey') ||
        i.includes('gelatin') ||
        i.includes('whey') ||
        i.includes('casein')
      )) {
        incompatible.push('animal products');
      }
      break;

    case 'gluten-free':
      if (lowerIngredients.some(i => 
        i.includes('wheat') || 
        i.includes('barley') || 
        i.includes('rye') || 
        i.includes('malt') ||
        i.includes('oats')
      )) {
        incompatible.push('gluten-containing ingredients');
      }
      break;

    // Add more diet checks as needed
  }

  return incompatible;
};

const DietaryRequirement = mongoose.model('DietaryRequirement', dietaryRequirementSchema);

module.exports = DietaryRequirement; 