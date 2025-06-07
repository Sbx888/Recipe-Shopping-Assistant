import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface ParsedRecipe {
  title: string;
  ingredients: Ingredient[];
  url: string;
}

export class RecipeParser {
  private static cleanText(text: string): string {
    return text.trim().replace(/\s+/g, ' ');
  }

  private static parseAmount(text: string): { amount: string; unit: string } {
    const match = text.match(/^([\d./\s]+)?\s*(cup|cups|tbsp|tsp|g|gram|grams|kg|ml|l|oz|ounce|ounces|pound|pounds|lb|lbs|piece|pieces|pinch|handful|to taste|)?/i);
    return {
      amount: match?.[1]?.trim() || '',
      unit: match?.[2]?.trim().toLowerCase() || ''
    };
  }

  private static getProxyUrl(url: string): string {
    try {
      const originalUrl = new URL(url);
      // If it's a taste.com.au URL, use our local server
      if (originalUrl.hostname === 'www.taste.com.au') {
        // Make sure we're getting a recipe page
        if (!originalUrl.pathname.includes('/recipes/')) {
          throw new Error('Please provide a specific recipe URL from taste.com.au (should contain /recipes/ in the URL)');
        }
        return `http://localhost:3001/api/recipe?url=${encodeURIComponent(url)}`;
      }
      return url;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Invalid URL format');
    }
  }

  static async parseRecipeUrl(url: string): Promise<ParsedRecipe> {
    try {
      if (!url.startsWith('http')) {
        throw new Error('Please enter a valid URL starting with http:// or https://');
      }

      console.log('Starting to parse recipe from URL:', url);
      const proxyUrl = this.getProxyUrl(url);
      console.log('Using proxy URL:', proxyUrl);

      const response = await axios.get(proxyUrl);

      if (!response.data || !response.data.html) {
        throw new Error('No data received from the recipe page');
      }

      console.log('Successfully fetched page content');
      const $ = cheerio.load(response.data.html);
      const ingredients: Ingredient[] = [];

      // First try to find structured recipe data
      try {
        const jsonLdScripts = $('script[type="application/ld+json"]');
        let found = false;

        jsonLdScripts.each((_, script) => {
          if (found) return;
          try {
            const jsonLd = JSON.parse($(script).text());
            const recipes = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
            
            for (const item of recipes) {
              if (item['@type'] === 'Recipe' && Array.isArray(item.recipeIngredient)) {
                found = true;
                item.recipeIngredient.forEach((ingredient: string) => {
                  const text = this.cleanText(ingredient);
                  const { amount, unit } = this.parseAmount(text);
                  const name = text.replace(`${amount} ${unit}`, '').trim();
                  
                  if (name) {
                    ingredients.push({ name, amount, unit });
                    console.log('Found ingredient from JSON-LD:', { name, amount, unit });
                  }
                });
                break;
              }
            }
          } catch (e) {
            console.log('Failed to parse JSON-LD data from script:', e);
          }
        });

        if (found) {
          console.log('Successfully parsed ingredients from structured data');
        }
      } catch (e) {
        console.log('Failed to process structured data:', e);
      }

      // If no ingredients found from structured data, try HTML selectors
      if (ingredients.length === 0) {
        const selectors = [
          // Taste.com.au specific selectors
          '.ingredient-table__cell',
          '.ingredient-description',
          '.ingredients-table__cell',
          // Generic recipe selectors
          '[itemprop="recipeIngredient"]',
          '.recipe-ingredients li',
          '.ingredients-list li',
          '.ingredients li',
          '.ingredient-list li',
          '.wprm-recipe-ingredient',
          '.ingredient',
          '[data-ingredient]',
          '.recipe__ingredient',
          '.recipe-ingredients__list-item',
          '.ingredient_list li'
        ];

        for (const selector of selectors) {
          const elements = $(selector);
          console.log(`Trying selector "${selector}" - found ${elements.length} elements`);
          
          if (elements.length > 0) {
            elements.each((_, element) => {
              const text = this.cleanText($(element).text());
              console.log('Found ingredient text:', text);
              
              const { amount, unit } = this.parseAmount(text);
              const name = text.replace(`${amount} ${unit}`, '').trim();
              
              if (name) {
                ingredients.push({ name, amount, unit });
              }
            });
            break;
          }
        }
      }

      if (ingredients.length === 0) {
        throw new Error('No ingredients found. Please check if the URL is a valid recipe page.');
      }

      console.log(`Found ${ingredients.length} ingredients`);

      // Try to find the recipe title
      let title = 'Untitled Recipe';
      
      // First try JSON-LD
      try {
        const jsonLdScripts = $('script[type="application/ld+json"]');
        jsonLdScripts.each((_, script) => {
          try {
            const jsonLd = JSON.parse($(script).text());
            const recipes = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
            
            for (const item of recipes) {
              if (item['@type'] === 'Recipe' && item.name) {
                title = this.cleanText(item.name);
                return false; // break the loop
              }
            }
          } catch (e) {
            console.log('Failed to get title from JSON-LD script:', e);
          }
        });
      } catch (e) {
        console.log('Failed to process JSON-LD for title:', e);
      }

      // If no title from JSON-LD, try HTML
      if (title === 'Untitled Recipe') {
        const titleSelectors = [
          'h1[itemprop="name"]',
          '.recipe-title',
          '.recipe-header h1',
          '.recipe__title',
          '.recipe-summary__h1',
          'h1.heading',
          'h1'
        ];

        for (const selector of titleSelectors) {
          const titleElement = $(selector).first();
          if (titleElement.length > 0) {
            const titleText = this.cleanText(titleElement.text());
            if (titleText && titleText.length > 0) {
              title = titleText;
              console.log('Found recipe title:', title);
              break;
            }
          }
        }
      }

      return {
        title,
        ingredients,
        url
      };
    } catch (error: unknown) {
      console.error('Error parsing recipe:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Recipe page not found. Please check the URL.');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        } else if (error.response?.status === 403) {
          throw new Error('Access to the recipe page was blocked. Please try a different recipe website.');
        } else if (error.message === 'Network Error') {
          throw new Error('Network error occurred. Please check your internet connection and try again.');
        }
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to parse recipe: ${errorMessage}`);
    }
  }
} 