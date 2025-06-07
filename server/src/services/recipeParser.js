import axios from 'axios';
import * as cheerio from 'cheerio';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the server root directory
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

// Initialize OpenAI with explicit configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',  // Explicit empty string fallback
  organization: process.env.OPENAI_ORG_ID
});

// Debug: Log API key format (safely)
console.log('API Key format check:', process.env.OPENAI_API_KEY ? 'Key is set' : 'Key is NOT set');
console.log('API Key starts with:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 8) : 'N/A');

async function extractTextContent(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Remove unnecessary elements
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('header').remove();
    $('footer').remove();
    $('aside').remove();
    $('.advertisement').remove();
    $('#comments').remove();
    $('.social-share').remove();
    $('.author-bio').remove();
    
    // Get the main content
    let content = '';
    
    // Try to get structured content first
    const recipeCard = $('.recipe-card, .recipe, [itemtype*="Recipe"]').first();
    if (recipeCard.length) {
      content = recipeCard.text();
    } else {
      // Fallback to main content areas
      content = $('main, article, .content, .post-content').text();
    }
    
    return content.trim();
  } catch (error) {
    console.error('Error fetching recipe:', error);
    throw new Error('Failed to fetch recipe from URL');
  }
}

async function parseRecipeWithAI(url, servings) {
  try {
    const content = await extractTextContent(url);
    
    const completion = await openai.chat.completions.create({
      model: process.env.MODEL || 'gpt-4-1106-preview',
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that extracts recipe information from text. Return the recipe details in a clean JSON format with the following structure:
{
  title: string,
  ingredients: string[],  // Format each ingredient naturally, e.g. "2 tablespoons olive oil", "1 pound ground beef"
  instructions: string[],
  servings: number,
  prepTime: string,
  cookTime: string,
  totalTime: string,
  equipment: string[],
  notes: string
}

Format ingredients in natural language with:
- Full words for measurements (tablespoons not tbsp, cups not c)
- Clear ingredient names
- Proper spacing and formatting
- No JSON or code-like syntax`
        },
        {
          role: "user",
          content: `Extract the recipe information from this text and adjust for ${servings} servings:\n\n${content}`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the JSON response
    const recipe = JSON.parse(completion.choices[0].message.content);
    
    return recipe;
  } catch (error) {
    console.error('Error parsing recipe with AI:', error);
    throw new Error('Failed to parse recipe');
  }
}

export {
  parseRecipeWithAI
}; 