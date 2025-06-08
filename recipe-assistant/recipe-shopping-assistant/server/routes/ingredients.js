const express = require('express');
const router = express.Router();

// GET /api/ingredients
router.get('/', async (req, res) => {
  try {
    res.json({ message: 'Ingredients route working' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 