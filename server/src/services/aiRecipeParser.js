import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID
});

/**
 * Parse a recipe from free-form text using AI
 * @param {string} recipeText - The recipe text to parse
 * @returns {Promise<Object>} Parsed recipe with ingredients and instructions
 */
export async function parseRecipeText(recipeText) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: `You are a recipe parsing expert. Analyze the given recipe text and extract:
1. Recipe title
2. List of ingredients with quantities and units
3. Step-by-step instructions
4. Servings (if specified)
5. Prep time and cook time (if specified)

Handle variations in spelling, formatting, and units. Standardize measurements.
Return a JSON object with these components.`
        },
        {
          role: "user",
          content: recipeText
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const parsedRecipe = JSON.parse(completion.choices[0].message.content);
    return parsedRecipe;
  } catch (error) {
    console.error('Error parsing recipe with AI:', error);
    throw error;
  }
}

/**
 * Clean and standardize ingredient text
 * @param {string} ingredientText - Raw ingredient text
 * @returns {Promise<Object>} Cleaned and standardized ingredient
 */
export async function standardizeIngredient(ingredientText) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: `You are an ingredient parsing expert. Given an ingredient description:
1. Extract the quantity, unit, and ingredient name
2. Standardize the unit to a common format
3. Handle spelling variations and common abbreviations
4. Return a structured JSON object

Example input: "2 tblsp fresh minced garlic"
Example output: {
  "quantity": 2,
  "unit": "tablespoon",
  "ingredient": "garlic",
  "notes": "fresh, minced"
}`
        },
        {
          role: "user",
          content: ingredientText
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const standardizedIngredient = JSON.parse(completion.choices[0].message.content);
    return standardizedIngredient;
  } catch (error) {
    console.error('Error standardizing ingredient:', error);
    throw error;
  }
}

/**
 * Extract cooking instructions from text
 * @param {string} instructionsText - Raw cooking instructions
 * @returns {Promise<Array>} Array of cleaned and numbered steps
 */
export async function parseInstructions(instructionsText) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: `You are a cooking instructions expert. Given a block of cooking instructions:
1. Split into clear, logical steps
2. Clean up formatting and punctuation
3. Ensure steps are in correct order
4. Return an array of instruction steps

Handle various formats like numbered lists, paragraphs, or bullet points.`
        },
        {
          role: "user",
          content: instructionsText
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const parsedInstructions = JSON.parse(completion.choices[0].message.content);
    return parsedInstructions.steps;
  } catch (error) {
    console.error('Error parsing instructions:', error);
    throw error;
  }
} 