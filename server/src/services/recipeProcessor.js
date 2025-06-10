import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { findSubstitutes, getRecommendations } from './ingredientMatcher.js';
import Preference from '../models/Preference.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

/**
 * Check ingredients against user's filtered ingredients list
 */
async function checkFilteredIngredients(ingredients, userId) {
  const userPrefs = await Preference.findOne({ userId });
  if (!userPrefs || !userPrefs.filteredIngredients) return [];

  const filteredResults = [];
  
  for (const ingredient of ingredients) {
    // Check against user's filtered ingredients
    const matches = userPrefs.filteredIngredients.filter(filter => {
      // Case insensitive search
      const regex = new RegExp(filter.ingredient, 'i');
      return regex.test(ingredient.name);
    });

    if (matches.length > 0) {
      filteredResults.push({
        ingredient: ingredient.name,
        matches: matches.map(match => ({
          filteredIngredient: match.ingredient,
          reason: match.reason,
          severity: match.severity,
          notes: match.notes
        }))
      });
    }
  }

  return filteredResults;
}

/**
 * Process a recipe and return enhanced information
 */
export async function processRecipe(recipeData, userId, selectedStore) {
  try {
    // First, get a simplified summary while maintaining style
    const summary = await getRecipeSummary(recipeData);
    
    // Process ingredients with detailed information
    const enhancedIngredients = await Promise.all(recipeData.ingredients.map(async (ingredient) => {
      const substitutes = await findSubstitutes(ingredient, userId, selectedStore);
      const recommendations = await getRecommendations(userId, ingredient, selectedStore);
      
      return {
        ...ingredient,
        substitutes,
        recommendations,
        storageType: determineStorageType(ingredient),
        estimatedQuantity: estimateQuantity(ingredient)
      };
    }));

    // Check for filtered ingredients
    const filteredIngredients = await checkFilteredIngredients(recipeData.ingredients, userId);

    return {
      summary,
      ingredients: enhancedIngredients,
      filteredIngredients,
      totalTime: recipeData.totalTime,
      servings: recipeData.servings,
      instructions: recipeData.instructions
    };
  } catch (error) {
    console.error('Error processing recipe:', error);
    throw error;
  }
}

/**
 * Generate a simplified but style-consistent summary
 */
async function getRecipeSummary(recipeData) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
      {
        role: "system",
        content: `You are a culinary expert that simplifies recipes while maintaining their original style and voice.
Create a concise summary that includes:
1. Key preparation steps
2. Essential timing information
3. Critical techniques
4. Important tips
5. Expected outcomes

Maintain the recipe author's tone and language style.`
      },
      {
        role: "user",
        content: JSON.stringify(recipeData)
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7
  });

  return JSON.parse(completion.choices[0].message.content);
}

/**
 * Process ingredients with detailed information
 */
async function processIngredients(ingredients, userId, selectedStore) {
  const processedIngredients = [];

  for (const ingredient of ingredients) {
    // Get substitutes
    const substitutes = await findSubstitutes(ingredient, userId, selectedStore);
    
    // Get store products
    const storeProducts = await getRecommendations(userId, ingredient, selectedStore);
    
    // Estimate quantities for liquid/sauce ingredients
    const quantities = await estimateQuantities(ingredient);

    processedIngredients.push({
      original: ingredient,
      substitutes,
      storeProducts,
      quantities,
      storageType: determineStorageType(ingredient),
      isCheckedForShopping: true // Default to true, can be toggled by user
    });
  }

  return processedIngredients;
}

/**
 * Estimate quantities for liquid/sauce ingredients
 */
async function estimateQuantities(ingredient) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    messages: [
      {
        role: "system",
        content: `You are a culinary expert that estimates ingredient quantities.
For the given ingredient, provide:
1. Estimated percentage of container used
2. Typical container sizes
3. Measurement conversions
4. Usage guidelines

Return precise measurements where possible.`
      },
      {
        role: "user",
        content: ingredient
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.7
  });

  return JSON.parse(completion.choices[0].message.content);
}

/**
 * Determine if ingredient belongs in fridge, pantry, or other storage
 */
function determineStorageType(ingredient) {
  // This is a simple initial implementation
  // Could be enhanced with ML/AI for more accurate categorization
  const fridgeKeywords = ['fresh', 'milk', 'dairy', 'meat', 'fish', 'vegetable', 'fruit'];
  const pantryKeywords = ['dried', 'canned', 'spice', 'herb', 'flour', 'sugar', 'oil'];
  
  const lowerIngredient = ingredient.toLowerCase();
  
  if (fridgeKeywords.some(keyword => lowerIngredient.includes(keyword))) {
    return 'fridge';
  }
  
  if (pantryKeywords.some(keyword => lowerIngredient.includes(keyword))) {
    return 'pantry';
  }
  
  return 'other';
} 