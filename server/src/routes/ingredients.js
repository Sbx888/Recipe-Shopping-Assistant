import express from 'express';
const router = express.Router();

// Basic ingredients routes - we can expand these later
router.get('/', (req, res) => {
  // TODO: Implement get ingredients
  res.status(501).json({ message: 'Not implemented yet' });
});

export { router as default }; 