import express from 'express';
import auth from '../middleware/auth.js';
import Preference from '../models/Preference.js';

const router = express.Router();

/**
 * Get user preferences
 */
router.get('/', auth, async (req, res) => {
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
router.put('/', auth, async (req, res) => {
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
router.put('/location', auth, async (req, res) => {
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
router.get('/substitutions', auth, async (req, res) => {
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
router.post('/substitutions', auth, async (req, res) => {
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

export default router; 