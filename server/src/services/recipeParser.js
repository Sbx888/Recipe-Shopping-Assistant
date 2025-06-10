import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Parse a recipe from a URL
 * @param {string} url - The recipe URL
 * @param {number} servings - Number of servings
 * @param {string} userId - Optional user ID for personalization
 * @param {string} location - Location for store-specific data
 * @returns {Promise<Object>} Parsed recipe
 */
export async function parseRecipeFromUrl(url, servings = 4, userId = null, location = 'default') {
  const startTime = Date.now();
  console.log('🟡 [Recipe Parser] Starting recipe parse:', { url, servings, location });

  try {
    // Validate URL
    if (!url || !url.startsWith('http')) {
      throw new Error('Invalid URL format. URL must start with http:// or https://');
    }

    // Fetch recipe page
    console.log('🟡 [Recipe Parser] Fetching recipe URL...');
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/'
      },
      timeout: 30000, // Increase timeout to 30 seconds
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 300; // Only accept success status codes
      }
    });

    if (!response.data) {
      throw new Error('No content received from URL');
    }

    console.log('✅ [Recipe Parser] Successfully fetched URL');

    // Parse HTML
    console.log('🟡 [Recipe Parser] Parsing HTML content...');
    const $ = cheerio.load(response.data);

    // Extract recipe data
    console.log('🟡 [Recipe Parser] Extracting recipe data...');
    
    // Try multiple selectors for title
    const title = $('h1').first().text().trim() 
      || $('title').text().trim()
      || $('.recipe-title').text().trim()
      || $('.recipe-name').text().trim();

    const ingredients = new Set();
    const instructions = new Set();

    // Try to find ingredients with multiple selectors
    console.log('🟡 [Recipe Parser] Looking for ingredients...');
    [
      '.recipe-ingredients li',
      '.ingredients li',
      '.ingredient-list li',
      '[itemprop="recipeIngredient"]',
      '.ingredients-list li',
      'li' // fallback to all list items
    ].forEach(selector => {
      $(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 5 && text.length < 200) {
          ingredients.add(text);
        }
      });
    });

    // Try to find instructions with multiple selectors
    console.log('🟡 [Recipe Parser] Looking for instructions...');
    [
      '.recipe-instructions li',
      '.instructions li',
      '.method li',
      '[itemprop="recipeInstructions"]',
      '.recipe-method li',
      'ol li' // fallback to ordered list items
    ].forEach(selector => {
      $(selector).each((i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 10) {
          instructions.add(text);
        }
      });
    });

    // Validate extracted data
    if (!title) {
      console.warn('🟡 [Recipe Parser] Could not find recipe title, using URL as fallback');
      const urlTitle = url.split('/').pop()?.replace(/-/g, ' ') || 'Untitled Recipe';
      title = urlTitle.charAt(0).toUpperCase() + urlTitle.slice(1);
    }

    if (ingredients.size === 0) {
      throw new Error('Could not find recipe ingredients. The website might be blocking our access or using a different structure.');
    }

    if (instructions.size === 0) {
      throw new Error('Could not find recipe instructions. The website might be blocking our access or using a different structure.');
    }

    // Create recipe object
    const recipe = {
      title,
      url,
      ingredients: Array.from(ingredients),
      instructions: Array.from(instructions),
      servings,
      userId,
      importDate: new Date(),
      parseTime: Date.now() - startTime
    };

    console.log('✅ [Recipe Parser] Recipe parsing completed successfully:', {
      title: recipe.title,
      ingredientsCount: recipe.ingredients.length,
      instructionsCount: recipe.instructions.length
    });
    
    return recipe;

  } catch (error) {
    console.error('🔴 [Recipe Parser] Error:', {
      message: error.message,
      code: error.code,
      phase: error.response ? 'network' : 'parsing',
      status: error.response?.status,
      statusText: error.response?.statusText,
      duration: Date.now() - startTime,
      url
    });
    
    // Enhance error message for user
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Could not connect to the recipe website. The site might be down or blocking our access.');
    } else if (error.response?.status === 404) {
      throw new Error('Recipe page not found. Please check if the URL is correct.');
    } else if (error.response?.status === 403) {
      throw new Error('Access to the recipe website was denied. The site might be blocking automated access.');
    } else {
      throw new Error(`Failed to import recipe: ${error.message}`);
    }
  }
} 