import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import tinyduration from 'tinyduration';
import openai from './utils/openai.js';
import { createRecipeExtractionPrompt } from './prompts/recipePrompt.js';

export class RecipeExtractor {
  constructor(aiApiKey = null) {
    this.aiApiKey = aiApiKey;
    this.openaiClient = aiApiKey ? openai : null;
  }

  // Main extraction method
  async extractRecipe(url) {
    try {
      console.log(`Extracting recipe from: ${url}`);
      
      // Step 1: Fetch the webpage
      const html = await this.fetchPage(url);
      
      // Step 2: Try JSON-LD extraction first (most reliable)
      const jsonLdRecipe = await this.extractFromJsonLD(html);
      if (jsonLdRecipe) {
        console.log('✅ Successfully extracted via JSON-LD');
        return { success: true, method: 'json-ld', recipe: jsonLdRecipe };
      }

      // Step 3: Try microdata extraction
      const microdataRecipe = await this.extractFromMicrodata(html);
      if (microdataRecipe) {
        console.log('✅ Successfully extracted via Microdata');
        return { success: true, method: 'microdata', recipe: microdataRecipe };
      }

      // Step 4: AI-powered extraction as fallback
      const aiRecipe = await this.extractWithAI(html, url);
      if (aiRecipe) {
        console.log('✅ Successfully extracted via AI');
        return { success: true, method: 'ai', recipe: aiRecipe };
      }

      return { success: false, error: 'No recipe data found' };
      
    } catch (error) {
      console.error('Recipe extraction failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Fetch webpage with headers that avoid bot detection
  async fetchPage(url) {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.text();
  }

  // Extract recipe from JSON-LD structured data
  async extractFromJsonLD(html) {
    const $ = cheerio.load(html);
    const scripts = $("script[type='application/ld+json']");
    
    for (let i = 0; i < scripts.length; i++) {
      try {
        const scriptContent = $(scripts[i]).html();
        if (!scriptContent) continue;
        
        let jsonData = JSON.parse(scriptContent);
        
        // Handle different JSON-LD structures
        if (Array.isArray(jsonData)) {
          jsonData = jsonData[0];
        } else if (jsonData['@graph']) {
          const recipeItem = jsonData['@graph'].find(item => 
            item['@type'] === 'Recipe' || 
            (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))
          );
          if (recipeItem) jsonData = recipeItem;
        }
        
        // Check if this is a recipe
        const types = Array.isArray(jsonData['@type']) ? jsonData['@type'] : [jsonData['@type']];
        if (types.includes('Recipe')) {
          return this.normalizeRecipeData(jsonData);
        }
        
      } catch (error) {
        console.warn('Failed to parse JSON-LD script:', error.message);
        continue;
      }
    }
    
    return null;
  }

  // Extract recipe from microdata
  async extractFromMicrodata(html) {
    const $ = cheerio.load(html);
    
    const recipeElement = $('[itemtype*="Recipe"]').first();
    if (recipeElement.length === 0) return null;
    
    const recipe = {};
    
    recipe.name = this.extractMicrodataProp($, recipeElement, 'name');
    recipe.description = this.extractMicrodataProp($, recipeElement, 'description');
    recipe.image = this.extractMicrodataProp($, recipeElement, 'image');
    
    const ingredients = [];
    recipeElement.find('[itemprop="recipeIngredient"]').each((i, el) => {
      ingredients.push($(el).text().trim());
    });
    recipe.ingredients = ingredients;
    
    const instructions = [];
    recipeElement.find('[itemprop="recipeInstructions"]').each((i, el) => {
      instructions.push($(el).text().trim());
    });
    recipe.instructions = instructions;
    
    recipe.prepTime = this.extractMicrodataProp($, recipeElement, 'prepTime');
    recipe.cookTime = this.extractMicrodataProp($, recipeElement, 'cookTime');
    recipe.totalTime = this.extractMicrodataProp($, recipeElement, 'totalTime');
    
    return Object.keys(recipe).length > 3 ? recipe : null;
  }

  extractMicrodataProp($, element, prop) {
    const propElement = element.find(`[itemprop="${prop}"]`).first();
    if (propElement.length === 0) return null;
    
    const content = propElement.attr('content') || propElement.text().trim();
    return content || null;
  }

  // AI-powered extraction using OpenAI client
  async extractWithAI(html, url) {
    if (!this.openaiClient) {
      console.warn('No OpenAI client configured, skipping AI extraction');
      return null;
    }

    const $ = cheerio.load(html);
    
    // Remove scripts, styles, and other non-content elements
    $('script, style, nav, header, footer, .advertisement, .ads').remove();
    
    // Get clean text content
    const cleanText = $('body').text()
      .replace(/\s+/g, ' ')
      .substring(0, 4000);
    
    const prompt = createRecipeExtractionPrompt(cleanText, url);
    
    try {
      const completion = await this.openaiClient.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a precise recipe extraction specialist. Return only valid JSON.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });
      
      const response = completion.choices[0].message.content;
      return this.parseAIResponse(response);
      
    } catch (error) {
      console.error('AI extraction failed:', error);
      return null;
    }
  }

  parseAIResponse(response) {
    try {
      const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      return JSON.parse(cleanResponse);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return null;
    }
  }

  // Normalize recipe data from JSON-LD to consistent format
  normalizeRecipeData(jsonLdData) {
    const recipe = {};
    
    recipe.name = jsonLdData.name;
    recipe.description = jsonLdData.description;
    recipe.image = this.extractImageUrl(jsonLdData.image);
    
    recipe.prepTime = this.formatDuration(jsonLdData.prepTime);
    recipe.cookTime = this.formatDuration(jsonLdData.cookTime);
    recipe.totalTime = this.formatDuration(jsonLdData.totalTime);
    
    recipe.servings = this.extractYield(jsonLdData.recipeYield);
    
    recipe.category = this.normalizeArray(jsonLdData.recipeCategory);
    recipe.cuisine = this.normalizeArray(jsonLdData.recipeCuisine);
    
    recipe.ingredients = this.normalizeArray(jsonLdData.recipeIngredient) || [];
    recipe.instructions = this.parseInstructions(jsonLdData.recipeInstructions) || [];
    
    if (jsonLdData.nutrition) {
      recipe.nutrition = this.parseNutrition(jsonLdData.nutrition);
    }
    
    if (jsonLdData.keywords) {
      recipe.tags = typeof jsonLdData.keywords === 'string' 
        ? jsonLdData.keywords.split(',').map(k => k.trim())
        : jsonLdData.keywords;
    }
    
    if (jsonLdData.aggregateRating) {
      recipe.rating = {
        value: jsonLdData.aggregateRating.ratingValue,
        count: jsonLdData.aggregateRating.ratingCount
      };
    }
    
    if (jsonLdData.author) {
      recipe.author = typeof jsonLdData.author === 'string' 
        ? jsonLdData.author 
        : jsonLdData.author.name;
    }
    
    return recipe;
  }

  // Helper methods
  extractImageUrl(imageData) {
    if (!imageData) return null;
    if (typeof imageData === 'string') return imageData;
    if (Array.isArray(imageData)) return imageData[0];
    if (imageData.url) return imageData.url;
    return null;
  }

  formatDuration(duration) {
    if (!duration) return null;
    
    try {
      const parsed = tinyduration.parse(duration);
      const parts = [];
      
      if (parsed.hours) parts.push(`${parsed.hours} hour${parsed.hours !== 1 ? 's' : ''}`);
      if (parsed.minutes) parts.push(`${parsed.minutes} minute${parsed.minutes !== 1 ? 's' : ''}`);
      if (parsed.seconds) parts.push(`${parsed.seconds} second${parsed.seconds !== 1 ? 's' : ''}`);
      
      return parts.length > 0 ? parts.join(' and ') : null;
    } catch (error) {
      return duration;
    }
  }

  extractYield(yieldData) {
    if (!yieldData) return null;
    if (Array.isArray(yieldData)) return yieldData[0];
    return yieldData;
  }

  normalizeArray(data) {
    if (!data) return null;
    if (Array.isArray(data)) return data;
    return [data];
  }

  parseInstructions(instructions) {
    if (!instructions) return [];
    
    const result = [];
    for (const instruction of instructions) {
      if (typeof instruction === 'string') {
        result.push(instruction);
      } else if (instruction['@type'] === 'HowToStep' && instruction.text) {
        result.push(instruction.text);
      } else if (instruction.name && instruction.text) {
        result.push(`${instruction.name}: ${instruction.text}`);
      }
    }
    return result;
  }

  parseNutrition(nutritionData) {
    if (!nutritionData) return null;
    
    return {
      calories: nutritionData.calories,
      protein: nutritionData.proteinContent,
      carbs: nutritionData.carbohydrateContent,
      fat: nutritionData.fatContent,
      fiber: nutritionData.fiberContent,
      sugar: nutritionData.sugarContent,
      sodium: nutritionData.sodiumContent
    };
  }
}

// Export functions for easy usage
export async function extractRecipeFromUrl(url, aiApiKey = null) {
  const extractor = new RecipeExtractor(aiApiKey);
  return await extractor.extractRecipe(url);
}

export async function extractMultipleRecipes(urls, aiApiKey = null, concurrency = 3) {
  const extractor = new RecipeExtractor(aiApiKey);
  const results = [];
  
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);
    const batchPromises = batch.map(url => extractor.extractRecipe(url));
    const batchResults = await Promise.allSettled(batchPromises);
    
    results.push(...batchResults.map((result, index) => ({
      url: batch[index],
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason.message : null
    })));
    
    if (i + concurrency < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
} 