import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import Preference from '../models/Preference.js';
import { updateBrandPreference } from '../services/ingredientMatcher.js';

const router = express.Router();

/**
 * Get user preferences
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    let preferences = await Preference.findOne({ userId: req.user._id });
    
    if (!preferences) {
      // Create default preferences if none exist
      preferences = new Preference({
        userId: req.user._id,
        dietaryPreferences: [],
        allergies: [],
        preferredBrands: [],
        avoidedIngredients: [],
        substitutions: [],
        shoppingPreferences: {
          preferredStores: [],
          maxPrice: null,
          preferredBrands: [],
          organicPreference: false,
          localPreference: false
        }
      });
      await preferences.save();
    }
    
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update user preferences
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    const preferences = await Preference.findOneAndUpdate(
      { userId: req.user._id },
      updates,
      { new: true, runValidators: true, upsert: true }
    );
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update user location
 */
router.put('/location', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, address } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const preferences = await Preference.findOne({ userId: req.user._id });
    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    await preferences.updateLocation(latitude, longitude, address);
    res.json(preferences);
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get substitution history
 */
router.get('/substitutions', authenticateToken, async (req, res) => {
  try {
    const preferences = await Preference.findOne({ userId: req.user._id });
    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }
    
    const substitutions = preferences.getRecentSubstitutions(10);
    res.json(substitutions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add substitution feedback
 */
router.post('/substitutions', authenticateToken, async (req, res) => {
  try {
    const { originalIngredient, substitutedWith, rating } = req.body;
    
    let preferences = await Preference.findOne({ userId: req.user._id });
    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }
    
    preferences.substitutions.push({
      originalIngredient,
      substitutedWith,
      rating
    });
    
    await preferences.save();
    res.status(201).json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update brand preference
 */
router.post('/brand-preference', authenticateToken, async (req, res) => {
  try {
    const { brandName, productCategory, rating } = req.body;
    const userId = req.user.id;

    if (!brandName || !productCategory || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    await updateBrandPreference(userId, { brandName, productCategory, rating });
    res.json({ message: 'Brand preference updated successfully' });
  } catch (error) {
    console.error('Error updating brand preference:', error);
    res.status(500).json({ error: 'Failed to update brand preference' });
  }
});

/**
 * Add a filtered ingredient
 */
router.post('/filtered-ingredients', authenticateToken, async (req, res) => {
  try {
    const { ingredient, reason, severity, notes } = req.body;
    const userId = req.user.id;

    if (!ingredient) {
      return res.status(400).json({ error: 'Ingredient name is required' });
    }

    const update = {
      $push: {
        filteredIngredients: {
          ingredient,
          reason: reason || 'other',
          severity: severity || 'prefer_avoid',
          notes,
          dateAdded: new Date()
        }
      }
    };

    await Preference.findOneAndUpdate({ userId }, update, { new: true, upsert: true });
    res.json({ message: 'Filtered ingredient added successfully' });
  } catch (error) {
    console.error('Error adding filtered ingredient:', error);
    res.status(500).json({ error: 'Failed to add filtered ingredient' });
  }
});

/**
 * Remove a filtered ingredient
 */
router.delete('/filtered-ingredients/:ingredient', authenticateToken, async (req, res) => {
  try {
    const { ingredient } = req.params;
    const userId = req.user.id;

    const update = {
      $pull: {
        filteredIngredients: { ingredient }
      }
    };

    await Preference.findOneAndUpdate({ userId }, update);
    res.json({ message: 'Filtered ingredient removed successfully' });
  } catch (error) {
    console.error('Error removing filtered ingredient:', error);
    res.status(500).json({ error: 'Failed to remove filtered ingredient' });
  }
});

/**
 * Get all filtered ingredients
 */
router.get('/filtered-ingredients', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const prefs = await Preference.findOne({ userId });
    res.json(prefs?.filteredIngredients || []);
  } catch (error) {
    console.error('Error getting filtered ingredients:', error);
    res.status(500).json({ error: 'Failed to get filtered ingredients' });
  }
});

export default router; 