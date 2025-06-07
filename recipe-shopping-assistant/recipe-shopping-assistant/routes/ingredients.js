const express = require('express');
const { auth } = require('../middleware/auth');
const Ingredient = require('../models/Ingredient');

const router = express.Router();

// Get common ingredients
router.get('/common', auth, async (req, res) => {
  try {
    const ingredients = await Ingredient.find()
      .select('name aliases defaultUnit conversions')
      .sort('name')
      .limit(100);
    
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching ingredients',
      details: error.message
    });
  }
});

// Search ingredients
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const ingredients = await Ingredient.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { aliases: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);

    res.json(ingredients);
  } catch (error) {
    res.status(500).json({
      error: 'Error searching ingredients',
      details: error.message
    });
  }
});

// Get ingredient details
router.get('/:id', auth, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }
    res.json(ingredient);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching ingredient',
      details: error.message
    });
  }
});

// Get ingredient substitutes
router.get('/:id/substitutes', auth, async (req, res) => {
  try {
    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    const substitutes = await Promise.all(
      ingredient.substitutes.map(async (sub) => {
        const substituteIngredient = await Ingredient.findOne({
          name: sub.ingredient.toLowerCase()
        });
        return {
          ...sub.toObject(),
          details: substituteIngredient
        };
      })
    );

    res.json(substitutes);
  } catch (error) {
    res.status(500).json({
      error: 'Error fetching substitutes',
      details: error.message
    });
  }
});

// Convert units for an ingredient
router.post('/:id/convert', auth, async (req, res) => {
  try {
    const { fromUnit, toUnit, quantity } = req.body;
    if (!fromUnit || !toUnit || !quantity) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const ingredient = await Ingredient.findById(req.params.id);
    if (!ingredient) {
      return res.status(404).json({ error: 'Ingredient not found' });
    }

    try {
      const convertedQuantity = ingredient.convertUnit(fromUnit, toUnit, quantity);
      res.json({
        from: { quantity, unit: fromUnit },
        to: { quantity: convertedQuantity, unit: toUnit }
      });
    } catch (error) {
      res.status(400).json({
        error: 'Conversion error',
        details: error.message
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Error converting units',
      details: error.message
    });
  }
});

module.exports = router; 