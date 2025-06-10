import express from 'express';
import { parseRecipeFromUrl } from '../services/recipeParser.js';
import { updatePreferences, recordSubstitution } from '../services/ingredientMatcher.js';
import { authenticateToken } from '../middleware/auth.js';
import { parseRecipeText, standardizeIngredient, parseInstructions } from '../services/aiRecipeParser.js';
import { processRecipe } from '../services/recipeProcessor.js';
import { Recipe } from '../models/recipe.js';
import { getRecommendations } from '../services/recommendationService.js';

const router = express.Router();

/**
 * Health check endpoint
 * GET /api/recipes/health
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Parse a recipe from a URL and get shopping recommendations
 */
router.post('/parse-url', async (req, res) => {
  const startTime = Date.now();
  console.log('🔵 [Recipe Import] Starting new request:', {
    url: req.body.url,
    servings: req.body.servings,
    location: req.body.location,
    timestamp: new Date().toISOString()
  });

  try {
    const { url, servings, location } = req.body;
    const userId = req.user?.id; // Optional user ID for personalization

    // Validate request
    if (!url) {
      console.log('🔴 [Recipe Import] Missing URL parameter');
      return res.status(400).json({ error: 'URL is required' });
    }

    if (!url.startsWith('http')) {
      console.log('🔴 [Recipe Import] Invalid URL format:', url);
      return res.status(400).json({ error: 'Invalid URL format. URL must start with http:// or https://' });
    }

    console.log('🟡 [Recipe Import] Parsing recipe from URL:', url);
    
    // Parse recipe
    const recipe = await parseRecipeFromUrl(url, servings, userId, location);
    console.log('✅ [Recipe Import] Recipe parsed successfully');

    // Save to database
    console.log('🟡 [Recipe Import] Saving recipe to database...');
    const savedRecipe = await Recipe.create(recipe);
    console.log('✅ [Recipe Import] Recipe saved to database');

    // Get personalized recommendations if user is logged in
    let recommendations = [];
    if (userId) {
      console.log('🟡 [Recipe Import] Getting personalized recommendations...');
      try {
        recommendations = await getRecommendations(userId, recipe.ingredients);
        console.log('✅ [Recipe Import] Recommendations generated successfully');
      } catch (error) {
        console.warn('⚠️ [Recipe Import] Failed to get recommendations:', error.message);
        // Don't fail the whole request if recommendations fail
      }
    }

    // Calculate total processing time
    const duration = Date.now() - startTime;
    console.log('✅ [Recipe Import] Request completed successfully:', {
      recipeId: savedRecipe._id,
      duration,
      recommendationsCount: recommendations.length
    });

    res.json({
      recipe: savedRecipe,
      recommendations,
      duration
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('🔴 [Recipe Import] Error:', {
      message: error.message,
      code: error.code,
      phase: error.response ? 'network' : error.message.includes('parse') ? 'parsing' : 'database',
      status: error.response?.status,
      duration
    });

    // Send appropriate error response
    const status = error.response?.status === 404 ? 404 :
                  error.message.includes('parse') ? 422 :
                  error.code === 11000 ? 409 :
                  error.response?.status || 500;

    const errorResponse = {
      error: {
        message: error.message,
        phase: error.response ? 'network' : error.message.includes('parse') ? 'parsing' : 'database',
        details: error.response?.status === 404 ? 'Recipe URL not found' :
                error.message.includes('parse') ? 'Failed to extract recipe data' :
                error.code === 11000 ? 'Recipe already exists' :
                'Internal server error'
      }
    };

    res.status(status).json(errorResponse);
  }
});

/**
 * Update user preferences
 */
router.post('/preferences', authenticateToken, async (req, res) => {
  try {
    const preferences = await updatePreferences(req.user._id, req.body);
    res.json(preferences);
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Record ingredient substitution feedback
 */
router.post('/substitution-feedback', authenticateToken, async (req, res) => {
  try {
    const { originalIngredient, substitutedWith, rating } = req.body;

    if (!originalIngredient || !substitutedWith || rating === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await recordSubstitution(req.user._id, originalIngredient, substitutedWith, rating);
    res.json({ message: 'Feedback recorded successfully' });
  } catch (error) {
    console.error('Error recording substitution feedback:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Parse a recipe from free-form text
 * POST /api/recipes/parse-manual
 */
router.post('/parse-manual', async (req, res) => {
  try {
    const { recipeText } = req.body;
    if (!recipeText) {
      return res.status(400).json({ error: 'Recipe text is required' });
    }

    const parsedRecipe = await parseRecipeText(recipeText);
    return res.json(parsedRecipe);
  } catch (error) {
    console.error('Error in recipe parsing route:', error);
    return res.status(500).json({ error: 'Failed to parse recipe' });
  }
});

/**
 * Standardize a single ingredient
 * POST /api/recipes/standardize-ingredient
 */
router.post('/standardize-ingredient', async (req, res) => {
  try {
    const { ingredientText } = req.body;
    if (!ingredientText) {
      return res.status(400).json({ error: 'Ingredient text is required' });
    }

    const standardized = await standardizeIngredient(ingredientText);
    return res.json(standardized);
  } catch (error) {
    console.error('Error in ingredient standardization route:', error);
    return res.status(500).json({ error: 'Failed to standardize ingredient' });
  }
});

/**
 * Parse cooking instructions
 * POST /api/recipes/parse-instructions
 */
router.post('/parse-instructions', async (req, res) => {
  try {
    const { instructionsText } = req.body;
    if (!instructionsText) {
      return res.status(400).json({ error: 'Instructions text is required' });
    }

    const parsedInstructions = await parseInstructions(instructionsText);
    return res.json({ steps: parsedInstructions });
  } catch (error) {
    console.error('Error in instructions parsing route:', error);
    return res.status(500).json({ error: 'Failed to parse instructions' });
  }
});

/**
 * Process a recipe URL or data and return enhanced information
 */
router.post('/process', authenticateToken, async (req, res) => {
  try {
    const { recipeData, selectedStore } = req.body;
    const userId = req.user.id;

    if (!recipeData) {
      return res.status(400).json({ error: 'Recipe data is required' });
    }

    const processedRecipe = await processRecipe(recipeData, userId, selectedStore);
    res.json(processedRecipe);
  } catch (error) {
    console.error('Error processing recipe:', error);
    res.status(500).json({ error: 'Failed to process recipe' });
  }
});

export default router; 