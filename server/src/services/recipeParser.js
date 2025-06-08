import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import { parse as parseIngredient } from './ingredientParser.js';
import { findSubstitutes, getRecommendations } from './ingredientMatcher.js';
import { findRecipeProducts, calculateShoppingRoute } from './supermarketService.js';
import Preference from '../models/Preference.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

/**
 * Parse recipe from URL with AI-powered ingredient matching
 */
export async function parseRecipeFromUrl(url, servings = 4, userId, location) {
  try {
    console.log('Starting recipe parsing process:', { url, servings, location });
    
    if (!url || !url.startsWith('http')) {
      throw new Error('Invalid URL format. URL must start with http:// or https://');
    }

    // Validate OpenAI configuration
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }
    if (!process.env.OPENAI_ORG_ID) {
      throw new Error('OpenAI Organization ID is not configured');
    }

    console.log('OpenAI Configuration:', {
      apiKeySet: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY?.length,
      orgIdSet: !!process.env.OPENAI_ORG_ID,
      model: "gpt-4-1106-preview"
    });

    // Fetch user preferences
    const preferences = await Preference.findOne({ userId }).populate('userId');
    if (!preferences) {
      throw new Error('User preferences not found');
    }

    // Fetch recipe page
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    // Extract basic recipe information
    const title = $('h1').first().text().trim();
    const description = $('meta[name="description"]').attr('content');
    const imageUrl = $('meta[property="og:image"]').attr('content');

    // Use OpenAI to extract recipe details
    const content = $('body').text();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: `You are a recipe parsing expert. Extract the following from the recipe:
            1. List of ingredients with quantities
            2. Step by step instructions
            3. Cooking time
            4. Difficulty level
            5. Cuisine type
            6. Dietary tags (vegetarian, vegan, etc.)
            7. Equipment needed
            
            Format the response as JSON with the following structure:
            {
              "ingredients": [{"item": "ingredient", "quantity": "amount", "unit": "measurement"}],
              "instructions": ["step 1", "step 2", ...],
              "cookingTime": {"prep": "minutes", "cook": "minutes"},
              "difficulty": "easy/medium/hard",
              "cuisine": "type",
              "dietaryTags": ["tag1", "tag2"],
              "equipment": ["item1", "item2"]
            }`
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const recipeData = JSON.parse(completion.choices[0].message.content);

    // Process ingredients with user preferences
    const processedIngredients = await Promise.all(recipeData.ingredients.map(async (ingredient) => {
      const parsed = parseIngredient(`${ingredient.quantity} ${ingredient.unit} ${ingredient.item}`);
      
      // Check for dietary restrictions and allergies
      const isAllergic = preferences.allergies.some(allergy => 
        ingredient.item.toLowerCase().includes(allergy.toLowerCase())
      );

      const violatesDiet = preferences.dietaryPreferences.some(diet => {
        switch(diet) {
          case 'vegetarian':
            return ingredient.item.toLowerCase().match(/meat|beef|chicken|pork|fish/);
          case 'vegan':
            return ingredient.item.toLowerCase().match(/meat|beef|chicken|pork|fish|egg|milk|dairy|honey/);
          case 'gluten-free':
            return ingredient.item.toLowerCase().match(/wheat|flour|bread|pasta/);
          // Add more dietary checks as needed
          default:
            return false;
        }
      });

      // Get ingredient substitutions if needed
      let substitutes = [];
      if (isAllergic || violatesDiet) {
        const substitutionPrompt = `Suggest 3 substitutes for ${ingredient.item} that are:
          ${preferences.allergies.length > 0 ? `- Free from these allergens: ${preferences.allergies.join(', ')}` : ''}
          ${preferences.dietaryPreferences.length > 0 ? `- Suitable for: ${preferences.dietaryPreferences.join(', ')}` : ''}
          Format as JSON array: ["substitute1", "substitute2", "substitute3"]`;

        const substitutionCompletion = await openai.chat.completions.create({
          model: 'gpt-4-1106-preview',
          messages: [
            {
              role: 'system',
              content: 'You are a culinary expert specializing in ingredient substitutions.'
            },
            {
              role: 'user',
              content: substitutionPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        });

        substitutes = JSON.parse(substitutionCompletion.choices[0].message.content);
      }

      // Adjust quantity for requested servings
      const servingRatio = servings / 4; // Assuming original recipe is for 4 servings
      const adjustedQuantity = parsed.quantity * servingRatio;

      return {
        ...parsed,
        quantity: adjustedQuantity,
        isAllergic,
        violatesDiet,
        substitutes,
        original: ingredient
      };
    }));

    // Find best matching products and calculate shopping route
    const productMatches = await findRecipeProducts(recipeData, location);
    const shoppingRoute = await calculateShoppingRoute(
      productMatches.flatMap(match => match.matches),
      location
    );

    // Return complete recipe data
    const enhancedRecipe = {
      url,
      title,
      description,
      imageUrl,
      servings,
      ingredients: processedIngredients,
      instructions: recipeData.instructions,
      cookingTime: recipeData.cookingTime,
      difficulty: recipeData.difficulty,
      cuisine: recipeData.cuisine,
      dietaryTags: recipeData.dietaryTags,
      equipment: recipeData.equipment,
      userPreferences: {
        allergies: preferences.allergies,
        dietaryPreferences: preferences.dietaryPreferences
      },
      shopping: {
        productMatches,
        shoppingRoute
      }
    };

    console.log('Successfully enhanced recipe:', {
      title: enhancedRecipe.title,
      ingredients: enhancedRecipe.ingredients.length,
      instructions: enhancedRecipe.instructions.length,
      servings: enhancedRecipe.servings,
      hasShoppingPlan: !!enhancedRecipe.shopping
    });

    return enhancedRecipe;

  } catch (error) {
    console.error('Error parsing recipe:', error);
    throw new Error(`Failed to parse recipe: ${error.message}`);
  }
} 