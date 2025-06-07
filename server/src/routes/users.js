import express from 'express';
const router = express.Router();

// Basic user routes - we can expand these later
router.post('/register', (req, res) => {
  // TODO: Implement user registration
  res.status(501).json({ message: 'Not implemented yet' });
});

router.post('/login', (req, res) => {
  // TODO: Implement user login
  res.status(501).json({ message: 'Not implemented yet' });
});

export { router as default }; 