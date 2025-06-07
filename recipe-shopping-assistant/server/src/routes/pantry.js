const express = require('express');
const { auth } = require('../middleware/auth');
const Pantry = require('../models/Pantry');
const ingredientParser = require('../services/ingredientParser');

const router = express.Router();

// Get user's pantry
router.get('/', auth, async (req, res) => {
  try {
    const pantry = await Pantry.findOne({ userId: req.user._id });
    if (!pantry) {
      return res.json({ ingredients: [] });
    }
    res.json({ ingredients: pantry.ingredients });
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching pantry',
      details: error.message
    });
  }
});

// Add or update ingredient in pantry
router.post('/ingredients', auth, async (req, res) => {
  try {
    const { ingredient, quantity, unit, notes } = req.body;
    
    // Parse ingredient if it's a string
    const parsedIngredient = await ingredientParser.parse(ingredient);
    
    let pantry = await Pantry.findOne({ userId: req.user._id });
    if (!pantry) {
      pantry = new Pantry({ userId: req.user._id, ingredients: [] });
    }

    // Find existing ingredient
    const existingIndex = pantry.ingredients.findIndex(
      i => i.ingredient.toLowerCase() === parsedIngredient.ingredient.toLowerCase()
    );

    if (existingIndex >= 0) {
      // Update existing ingredient
      pantry.ingredients[existingIndex] = {
        ingredient: parsedIngredient.ingredient,
        quantity: quantity || parsedIngredient.quantity,
        unit: unit || parsedIngredient.unit,
        notes: notes
      };
    } else {
      // Add new ingredient
      pantry.ingredients.push({
        ingredient: parsedIngredient.ingredient,
        quantity: quantity || parsedIngredient.quantity,
        unit: unit || parsedIngredient.unit,
        notes: notes
      });
    }

    await pantry.save();
    res.json({ message: 'Ingredient added/updated successfully', pantry });
  } catch (error) {
    res.status(500).json({
      error: 'Error updating pantry',
      details: error.message
    });
  }
});

// Delete ingredient from pantry
router.delete('/ingredients/:ingredient', auth, async (req, res) => {
  try {
    const ingredientName = decodeURIComponent(req.params.ingredient);
    const pantry = await Pantry.findOne({ userId: req.user._id });
    
    if (!pantry) {
      return res.status(404).json({ error: 'Pantry not found' });
    }

    const index = pantry.ingredients.findIndex(
      i => i.ingredient.toLowerCase() === ingredientName.toLowerCase()
    );

    if (index === -1) {
      return res.status(404).json({ error: 'Ingredient not found in pantry' });
    }

    pantry.ingredients.splice(index, 1);
    await pantry.save();

    res.json({ message: 'Ingredient deleted successfully', pantry });
  } catch (error) {
    res.status(500).json({
      error: 'Error deleting ingredient',
      details: error.message
    });
  }
});

// Check if ingredients are available in pantry
router.post('/check-ingredients', auth, async (req, res) => {
  try {
    const { ingredients } = req.body;
    const pantry = await Pantry.findOne({ userId: req.user._id });
    
    if (!pantry) {
      return res.json({
        available: false,
        missing: ingredients.map(i => i.ingredient)
      });
    }

    const missing = [];
    const available = [];

    for (const needed of ingredients) {
      const parsedNeeded = await ingredientParser.parse(needed.ingredient);
      const pantryItem = pantry.ingredients.find(
        i => i.ingredient.toLowerCase() === parsedNeeded.ingredient.toLowerCase()
      );

      if (!pantryItem || pantryItem.quantity < (needed.quantity || parsedNeeded.quantity)) {
        missing.push(parsedNeeded.ingredient);
      } else {
        available.push(parsedNeeded.ingredient);
      }
    }

    res.json({
      available: missing.length === 0,
      missing,
      available
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error checking ingredients',
      details: error.message
    });
  }
});

// Use ingredients from pantry
router.post('/use-ingredients', auth, async (req, res) => {
  try {
    const { ingredients } = req.body;
    const pantry = await Pantry.findOne({ userId: req.user._id });
    
    if (!pantry) {
      return res.status(404).json({ error: 'Pantry not found' });
    }

    const used = [];
    const notAvailable = [];

    for (const toUse of ingredients) {
      const parsedToUse = await ingredientParser.parse(toUse.ingredient);
      const index = pantry.ingredients.findIndex(
        i => i.ingredient.toLowerCase() === parsedToUse.ingredient.toLowerCase()
      );

      if (index === -1 || pantry.ingredients[index].quantity < (toUse.quantity || parsedToUse.quantity)) {
        notAvailable.push(parsedToUse.ingredient);
        continue;
      }

      // Update quantity
      pantry.ingredients[index].quantity -= (toUse.quantity || parsedToUse.quantity);
      used.push(parsedToUse.ingredient);

      // Remove if quantity is 0 or less
      if (pantry.ingredients[index].quantity <= 0) {
        pantry.ingredients.splice(index, 1);
      }
    }

    if (notAvailable.length > 0) {
      return res.status(400).json({
        error: 'Some ingredients not available',
        notAvailable,
        used
      });
    }

    await pantry.save();
    res.json({
      message: 'Ingredients used successfully',
      used,
      pantry
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error using ingredients',
      details: error.message
    });
  }
});

module.exports = router; 