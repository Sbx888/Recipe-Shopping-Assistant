const express = require('express');
const router = express.Router();
const { parseRecipe } = require('../services/recipeParser');
const { findBestMatch } = require('../services/supermarketApi');

// Get recipe and shopping list from URL
router.get('/', async (req, res) => {
  try {
    const { url, servings, postcode, supermarket, useMetric } = req.query;
    const scaleFactor = servings ? parseFloat(servings) : 1;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Parse recipe from URL
    const recipe = await parseRecipe(url, useMetric === 'true');

    // Scale ingredients if needed
    if (scaleFactor !== 1) {
      recipe.ingredients = recipe.ingredients.map(ing => ({
        ...ing,
        quantity: ing.quantity * scaleFactor
      }));
    }

    // Generate shopping list if supermarket and postcode provided
    let shoppingList = [];
    if (supermarket && postcode) {
      shoppingList = await Promise.all(
        recipe.ingredients.map(async ingredient => {
          try {
            const product = await findBestMatch(
              ingredient.name,
              ingredient.quantity,
              ingredient.unit,
              supermarket,
              postcode
            );

            return {
              ingredient: ingredient.original,
              product: product ? {
                name: product.name,
                brand: product.brand,
                price: product.price,
                size: product.packageSize,
                link: product.link,
                image: product.imageUrl
              } : null,
              quantity: ingredient.quantity,
              unit: ingredient.unit
            };
          } catch (error) {
            console.error('Error finding product match:', error);
            return {
              ingredient: ingredient.original,
              product: null,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              error: 'Product not found'
            };
          }
        })
      );
    }

    res.json({
      success: true,
      recipe,
      shoppingList: shoppingList.length > 0 ? shoppingList : undefined
    });

  } catch (error) {
    console.error('Error processing recipe:', error);
    res.status(500).json({
      error: 'Failed to process recipe',
      details: error.message
    });
  }
});

module.exports = router; 