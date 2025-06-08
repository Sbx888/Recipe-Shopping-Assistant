import express from 'express';
import { parseRecipeFromUrl } from '../services/recipeParser.js';
import { updatePreferences, recordSubstitution } from '../services/ingredientMatcher.js';
import auth from '../middleware/auth.js';

const router = express.Router();

/**
 * Parse a recipe from a URL and get shopping recommendations
 */
router.post('/parse', auth, async (req, res) => {
  try {
    const { url, servings, location } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    if (!location) {
      return res.status(400).json({ error: 'Location is required for shopping recommendations' });
    }

    const recipe = await parseRecipeFromUrl(url, servings || 4, req.user._id, location);
    res.json(recipe);
  } catch (error) {
    console.error('Error parsing recipe:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update user preferences
 */
router.post('/preferences', auth, async (req, res) => {
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
router.post('/substitution-feedback', auth, async (req, res) => {
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

export default router; 