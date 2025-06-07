import express from 'express';
const router = express.Router();

// Basic pantry routes - we can expand these later
router.get('/', (req, res) => {
  // TODO: Implement get pantry items
  res.json({ items: [] });
});

router.post('/check-ingredients', (req, res) => {
  // TODO: Implement ingredient checking
  res.json({ 
    ingredients: [],
    allAvailable: true
  });
});

export { router as default }; 