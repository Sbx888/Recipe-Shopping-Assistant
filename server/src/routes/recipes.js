import express from 'express';
import { parseRecipeWithAI } from '../services/recipeParser.js';

const router = express.Router();

// Get recipe from URL
router.get('/', async (req, res) => {
  try {
    const { url, servings } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const recipe = await parseRecipeWithAI(url, parseInt(servings) || 4);
    res.json({ recipe });
    
  } catch (error) {
    console.error('Error parsing recipe:', error);
    res.status(500).json({ error: 'Failed to parse recipe' });
  }
});

export default router; 