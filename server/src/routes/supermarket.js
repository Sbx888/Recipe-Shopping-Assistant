import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { searchProducts, findSubstitutes, comparePrices } from '../services/supermarketService.js';

const router = express.Router();

/**
 * Search for products in a specific supermarket
 * @route GET /api/supermarket/search
 */
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { ingredient, supermarket, postcode } = req.query;
    
    if (!ingredient || !supermarket || !postcode) {
      return res.status(400).json({ 
        error: 'Missing required parameters: ingredient, supermarket, postcode' 
      });
    }

    const products = await searchProducts(ingredient, supermarket, postcode);
    res.json({ products });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

/**
 * Find substitutes for an ingredient
 * @route GET /api/supermarket/substitutes
 */
router.get('/substitutes', authenticateToken, async (req, res) => {
  try {
    const { ingredient, postcode } = req.query;
    const dietaryRequirements = req.query.dietaryRequirements 
      ? JSON.parse(req.query.dietaryRequirements) 
      : null;

    if (!ingredient || !postcode) {
      return res.status(400).json({ 
        error: 'Missing required parameters: ingredient, postcode' 
      });
    }

    const substitutes = await findSubstitutes(ingredient, dietaryRequirements, postcode);
    res.json({ substitutes });
  } catch (error) {
    console.error('Error finding substitutes:', error);
    res.status(500).json({ error: 'Failed to find substitutes' });
  }
});

/**
 * Compare prices across supermarkets
 * @route GET /api/supermarket/compare-prices
 */
router.get('/compare-prices', authenticateToken, async (req, res) => {
  try {
    const { ingredient, postcode } = req.query;

    if (!ingredient || !postcode) {
      return res.status(400).json({ 
        error: 'Missing required parameters: ingredient, postcode' 
      });
    }

    const comparison = await comparePrices(ingredient, postcode);
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing prices:', error);
    res.status(500).json({ error: 'Failed to compare prices' });
  }
});

export default router; 