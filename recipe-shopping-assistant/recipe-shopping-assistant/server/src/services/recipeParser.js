const axios = require('axios');
const cheerio = require('cheerio');
const { parseIngredient } = require('./ingredientParser');

/**
 * Parse a recipe from a URL
 * @param {string} url - The recipe URL
 * @param {boolean} useMetric - Whether to use metric measurements
 * @returns {Promise<Object>} Parsed recipe
 */
async function parseRecipe(url, useMetric = true) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    
    // Try to find structured recipe data first
    const structuredData = extractStructuredData($);
    if (structuredData) {
      return structuredData;
    }

    // Fallback to HTML parsing
    return parseHtmlRecipe($, useMetric);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw new Error('Failed to fetch recipe from URL');
  }
}

/**
 * Extract recipe data from structured data (JSON-LD)
 * @param {CheerioStatic} $ - Cheerio instance
 * @returns {Object|null} Parsed recipe or null
 */
function extractStructuredData($) {
  try {
    const scripts = $('script[type="application/ld+json"]');
    for (let i = 0; i < scripts.length; i++) {
      const data = JSON.parse($(scripts[i]).html());
      if (data['@type'] === 'Recipe' || (Array.isArray(data) && data[0]?.['@type'] === 'Recipe')) {
        const recipe = Array.isArray(data) ? data[0] : data;
        return {
          title: recipe.name,
          description: recipe.description,
          servings: recipe.recipeYield,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          ingredients: recipe.recipeIngredient.map(ing => parseIngredient(ing)),
          instructions: recipe.recipeInstructions.map(step => 
            typeof step === 'string' ? step : step.text
          )
        };
      }
    }
  } catch (error) {
    console.error('Error parsing structured data:', error);
  }
  return null;
}

/**
 * Parse recipe from HTML content
 * @param {CheerioStatic} $ - Cheerio instance
 * @param {boolean} useMetric - Whether to use metric measurements
 * @returns {Object} Parsed recipe
 */
function parseHtmlRecipe($, useMetric) {
  // Common selectors for recipe elements
  const selectors = {
    title: [
      'h1[class*="title"]',
      'h1[class*="recipe"]',
      'h1.entry-title',
      'h1:first'
    ],
    ingredients: [
      '[class*="ingredient-list"] li',
      '[class*="ingredients"] li',
      '.recipe-ingredients li',
      '#ingredients li'
    ],
    instructions: [
      '[class*="instruction-list"] li',
      '[class*="method"] li',
      '.recipe-instructions li',
      '#instructions li',
      '.recipe-method li'
    ],
    servings: [
      '[class*="servings"]',
      '[class*="serves"]',
      '[class*="yield"]'
    ]
  };

  // Find first matching selector's content
  const findContent = (selectorList) => {
    for (const selector of selectorList) {
      const element = $(selector);
      if (element.length) {
        return element;
      }
    }
    return null;
  };

  // Extract recipe components
  const titleElement = findContent(selectors.title);
  const ingredientElements = findContent(selectors.ingredients);
  const instructionElements = findContent(selectors.instructions);
  const servingsElement = findContent(selectors.servings);

  // Parse ingredients
  const ingredients = [];
  ingredientElements?.each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      ingredients.push(parseIngredient(text, useMetric));
    }
  });

  // Parse instructions
  const instructions = [];
  instructionElements?.each((_, el) => {
    const text = $(el).text().trim();
    if (text) {
      instructions.push(text);
    }
  });

  return {
    title: titleElement?.text().trim() || 'Untitled Recipe',
    ingredients,
    instructions,
    servings: servingsElement?.text().trim() || 'Not specified'
  };
}

module.exports = {
  parseRecipe
}; 