const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

class IngredientAnalyzer {
  constructor() {
    // Common ingredient list patterns
    this.ingredientPatterns = [
      /ingredients:?\s*(.*?)(?:\.|$)/i,
      /contains:?\s*(.*?)(?:\.|$)/i
    ];

    // Common allergen warning patterns
    this.allergenPatterns = [
      /may contain:?\s*(.*?)(?:\.|$)/i,
      /allergen warning:?\s*(.*?)(?:\.|$)/i,
      /produced in a facility that processes:?\s*(.*?)(?:\.|$)/i,
      /manufactured on equipment that processes:?\s*(.*?)(?:\.|$)/i
    ];

    // Common ingredient separators
    this.separators = [',', ';', '•', '|'];

    // Common parenthetical patterns
    this.parentheticalPattern = /\((.*?)\)/g;
  }

  /**
   * Extract ingredients from product text
   * @param {string} text - Product description or ingredients list
   * @returns {Object} Extracted ingredients and allergen warnings
   */
  analyze(text) {
    const result = {
      ingredients: [],
      allergenWarnings: [],
      containsStatement: null,
      mayContainStatement: null
    };

    if (!text) return result;

    // Extract main ingredients list
    for (const pattern of this.ingredientPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.ingredients = this.parseIngredientList(match[1]);
        break;
      }
    }

    // Extract allergen warnings
    for (const pattern of this.allergenPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.allergenWarnings.push(match[1].trim());
      }
    }

    // Look for specific contains/may contain statements
    const containsMatch = text.match(/contains:?\s*(.*?)(?:\.|$)/i);
    if (containsMatch) {
      result.containsStatement = containsMatch[1].trim();
    }

    const mayContainMatch = text.match(/may contain:?\s*(.*?)(?:\.|$)/i);
    if (mayContainMatch) {
      result.mayContainStatement = mayContainMatch[1].trim();
    }

    return result;
  }

  /**
   * Parse ingredient list into individual ingredients
   * @param {string} ingredientList - Raw ingredient list text
   * @returns {string[]} Array of individual ingredients
   */
  parseIngredientList(ingredientList) {
    let ingredients = [ingredientList];

    // Split by common separators
    for (const separator of this.separators) {
      ingredients = ingredients
        .flatMap(item => item.split(separator))
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }

    // Process each ingredient
    return ingredients.map(ingredient => {
      // Extract parenthetical information
      const parentheticals = [];
      ingredient = ingredient.replace(this.parentheticalPattern, (match, content) => {
        parentheticals.push(content);
        return '';
      }).trim();

      // Clean up the ingredient
      ingredient = ingredient
        .replace(/\s+/g, ' ')
        .trim();

      // Add back relevant parenthetical information
      const relevantParentheticals = parentheticals.filter(p =>
        this.isRelevantParenthetical(p)
      );

      if (relevantParentheticals.length > 0) {
        ingredient += ` (${relevantParentheticals.join(', ')})`;
      }

      return ingredient;
    });
  }

  /**
   * Check if parenthetical content is relevant for ingredient analysis
   * @param {string} content - Content within parentheses
   * @returns {boolean} Whether the content is relevant
   */
  isRelevantParenthetical(content) {
    const relevantTerms = [
      'organic',
      'natural',
      'artificial',
      'color',
      'flavour',
      'flavor',
      'preservative',
      'from',
      'contains',
      'certified',
      'processed',
      'modified'
    ];

    const tokens = tokenizer.tokenize(content.toLowerCase());
    return tokens.some(token => relevantTerms.includes(token));
  }

  /**
   * Extract nutritional information from product text
   * @param {string} text - Product description or nutritional information
   * @returns {Object} Extracted nutritional information
   */
  extractNutritionalInfo(text) {
    const nutritionalInfo = {
      servingSize: null,
      calories: null,
      protein: null,
      fat: null,
      carbohydrates: null,
      sugar: null,
      sodium: null,
      fiber: null
    };

    if (!text) return nutritionalInfo;

    // Extract serving size
    const servingSizeMatch = text.match(/serving size:?\s*([\d.]+\s*[a-zA-Z]+)/i);
    if (servingSizeMatch) {
      nutritionalInfo.servingSize = servingSizeMatch[1];
    }

    // Extract numerical values with units
    const patterns = {
      calories: /calories:?\s*([\d.]+)/i,
      protein: /protein:?\s*([\d.]+)\s*g/i,
      fat: /fat:?\s*([\d.]+)\s*g/i,
      carbohydrates: /carbohydrates?:?\s*([\d.]+)\s*g/i,
      sugar: /sugars?:?\s*([\d.]+)\s*g/i,
      sodium: /sodium:?\s*([\d.]+)\s*mg/i,
      fiber: /fiber:?\s*([\d.]+)\s*g/i
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = text.match(pattern);
      if (match) {
        nutritionalInfo[key] = parseFloat(match[1]);
      }
    }

    return nutritionalInfo;
  }

  /**
   * Check if a product meets specific dietary requirements
   * @param {Object} product - Product information including ingredients and warnings
   * @param {Object} dietaryRequirements - Dietary requirements to check against
   * @returns {Object} Analysis results including safety and warnings
   */
  checkDietaryCompliance(product, dietaryRequirements) {
    const analysis = {
      safe: true,
      warnings: [],
      incompatibleReasons: []
    };

    if (!product || !product.ingredients) {
      analysis.safe = false;
      analysis.warnings.push('No ingredient information available');
      return analysis;
    }

    // Combine all allergen-related information
    const allergenWarnings = [
      ...(product.allergenWarnings || []),
      product.mayContainStatement
    ].filter(Boolean);

    // Check each dietary requirement
    if (dietaryRequirements.allergens) {
      for (const allergen of dietaryRequirements.allergens) {
        // Check ingredients
        const allergenFound = product.ingredients.some(ingredient =>
          ingredient.toLowerCase().includes(allergen.name.toLowerCase())
        );

        // Check warnings for strict and cautious severities
        const warningFound = allergenWarnings.some(warning =>
          warning.toLowerCase().includes(allergen.name.toLowerCase())
        );

        if (allergenFound || (allergen.severity !== 'preference' && warningFound)) {
          analysis.safe = false;
          analysis.incompatibleReasons.push(
            `Contains${warningFound ? ' or may contain' : ''} allergen: ${allergen.name}`
          );
        }
      }
    }

    // Check dietary restrictions
    if (dietaryRequirements.diet && dietaryRequirements.diet !== 'none') {
      const incompatible = this.checkDietCompatibility(
        product.ingredients,
        dietaryRequirements.diet
      );
      
      if (incompatible.length > 0) {
        analysis.safe = false;
        analysis.incompatibleReasons.push(
          `Not suitable for ${dietaryRequirements.diet} diet: ${incompatible.join(', ')}`
        );
      }
    }

    // Check preferences
    if (dietaryRequirements.preferences) {
      for (const preference of dietaryRequirements.preferences) {
        const violation = this.checkPreferenceCompliance(product, preference);
        if (violation) {
          analysis.warnings.push(violation);
        }
      }
    }

    return analysis;
  }

  /**
   * Check if ingredients are compatible with a specific diet
   * @param {string[]} ingredients - List of ingredients
   * @param {string} diet - Diet type
   * @returns {string[]} List of incompatible ingredients
   */
  checkDietCompatibility(ingredients, diet) {
    const incompatible = [];
    const lowerIngredients = ingredients.map(i => i.toLowerCase());

    const dietaryRestrictions = {
      vegetarian: [
        'meat', 'beef', 'chicken', 'pork', 'gelatin', 'lard',
        'animal fat', 'animal shortening'
      ],
      vegan: [
        'meat', 'milk', 'egg', 'honey', 'gelatin', 'whey',
        'casein', 'lactose', 'animal', 'butter', 'cream'
      ],
      'gluten-free': [
        'wheat', 'barley', 'rye', 'malt', 'oats', 'flour',
        'bread crumbs', 'semolina', 'spelt', 'triticale'
      ],
      'dairy-free': [
        'milk', 'cream', 'cheese', 'butter', 'whey',
        'casein', 'lactose', 'yogurt', 'dairy'
      ]
    };

    const restrictions = dietaryRestrictions[diet];
    if (restrictions) {
      for (const ingredient of lowerIngredients) {
        for (const restricted of restrictions) {
          if (ingredient.includes(restricted)) {
            incompatible.push(ingredient);
            break;
          }
        }
      }
    }

    return [...new Set(incompatible)];
  }

  /**
   * Check if a product complies with a specific preference
   * @param {Object} product - Product information
   * @param {string} preference - Preference to check
   * @returns {string|null} Violation message if any
   */
  checkPreferenceCompliance(product, preference) {
    const ingredients = product.ingredients.map(i => i.toLowerCase());

    switch (preference) {
      case 'organic':
        if (!ingredients.some(i => i.includes('organic'))) {
          return 'Not organic';
        }
        break;

      case 'non-gmo':
        if (ingredients.some(i => 
          i.includes('genetically modified') ||
          i.includes('gmo')
        )) {
          return 'Contains GMO ingredients';
        }
        break;

      case 'no-artificial-colors':
        if (ingredients.some(i =>
          i.includes('artificial color') ||
          i.includes('fd&c') ||
          i.includes('food coloring')
        )) {
          return 'Contains artificial colors';
        }
        break;

      case 'no-artificial-flavors':
        if (ingredients.some(i =>
          i.includes('artificial flavor') ||
          i.includes('artificial flavour')
        )) {
          return 'Contains artificial flavors';
        }
        break;

      case 'no-preservatives':
        const preservatives = [
          'sodium benzoate',
          'potassium sorbate',
          'bht',
          'bha',
          'sulfite',
          'nitrite',
          'nitrate'
        ];
        if (ingredients.some(i =>
          preservatives.some(p => i.includes(p))
        )) {
          return 'Contains preservatives';
        }
        break;
    }

    return null;
  }
}

module.exports = new IngredientAnalyzer(); 