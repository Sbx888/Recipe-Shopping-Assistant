import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import OpenAI from 'openai';
import mongoose from 'mongoose';
import Preference from '../models/Preference.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});
/**
 * Find suitable substitutes for an ingredient based on user preferences and availability
 */
export async function findSubstitutes(ingredient, userId, storeInventory) {
  try {
    // Get user preferences
    const userPrefs = await Preference.findOne({ userId });
    
    // Prepare context for AI
    const context = {
      ingredient,
      dietaryPreferences: userPrefs?.dietaryPreferences || [],
      allergies: userPrefs?.allergies || [],
      avoidedIngredients: userPrefs?.avoidedIngredients || [],
      substitutionHistory: userPrefs?.substitutionHistory || [],
      availableProducts: storeInventory
    };

    // Ask AI for substitution recommendations
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: `You are a culinary expert AI that helps find suitable ingredient substitutes.
Consider:
1. Dietary restrictions and allergies
2. Cooking properties and flavor profile
3. Nutritional similarity
4. Previous successful substitutions
5. Current store availability

Return a JSON array of substitutes, ranked by suitability.`
        },
        {
          role: "user",
          content: JSON.stringify(context)
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const substitutes = JSON.parse(completion.choices[0].message.content);
    return substitutes;
  } catch (error) {
    console.error('Error finding substitutes:', error);
    throw error;
  }
}

/**
 * Update user preferences based on their choices and feedback
 */
export async function updatePreferences(userId, update) {
  try {
    const prefs = await Preference.findOneAndUpdate(
      { userId },
      { $set: update },
      { new: true, upsert: true }
    );
    return prefs;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw error;
  }
}

/**
 * Record a substitution and its success rating
 */
export async function recordSubstitution(userId, originalIngredient, substitutedWith, rating) {
  try {
    const update = {
      $push: {
        substitutionHistory: {
          originalIngredient,
          substitutedWith,
          rating,
          timestamp: new Date()
        }
      }
    };

    await Preference.findOneAndUpdate({ userId }, update, { new: true, upsert: true });
  } catch (error) {
    console.error('Error recording substitution:', error);
    throw error;
  }
}

/**
 * Get personalized product recommendations based on user history
 */
export async function getRecommendations(userId, ingredient, storeInventory) {
  try {
    const userPrefs = await Preference.findOne({ userId });
    
    // Prepare context for AI
    const context = {
      ingredient,
      userHistory: userPrefs?.substitutionHistory || [],
      preferredBrands: userPrefs?.preferredBrands || [],
      availableProducts: storeInventory
    };

    // Get AI recommendations
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: `You are a shopping assistant AI that recommends specific products.
Consider:
1. User's brand preferences
2. Previous purchase history
3. Price-quality ratio
4. Current availability
5. Package size appropriateness

Return a JSON array of recommended products, ranked by suitability.`
        },
        {
          role: "user",
          content: JSON.stringify(context)
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const recommendations = JSON.parse(completion.choices[0].message.content);
    return recommendations;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
} 