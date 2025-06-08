import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all ingredients
router.get('/', auth, async (req, res) => {
  try {
    // TODO: Implement get all ingredients
    res.json({ ingredients: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new ingredient
router.post('/', auth, async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }
    // TODO: Implement add ingredient
    res.status(201).json({ message: 'Ingredient added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 