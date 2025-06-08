import express from 'express';
import auth from '../middleware/auth.js';
import Pantry from '../models/Pantry.js';

const router = express.Router();

// Get user's pantry
router.get('/', auth, async (req, res) => {
  try {
    const pantry = await Pantry.findOne({ userId: req.user._id });
    if (!pantry) {
      return res.status(404).json({ error: 'Pantry not found' });
    }
    res.json(pantry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add item to pantry
router.post('/items', auth, async (req, res) => {
  try {
    const { name, quantity, unit, category, expirationDate } = req.body;
    
    let pantry = await Pantry.findOne({ userId: req.user._id });
    
    if (!pantry) {
      pantry = new Pantry({
        userId: req.user._id,
        name,
        quantity,
        unit,
        category,
        expirationDate
      });
    } else {
      Object.assign(pantry, {
        name,
        quantity,
        unit,
        category,
        expirationDate
      });
    }
    
    await pantry.save();
    res.status(201).json(pantry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update pantry item
router.put('/items/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    const pantry = await Pantry.findOneAndUpdate(
      { userId: req.user._id, _id: req.params.id },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!pantry) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(pantry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete pantry item
router.delete('/items/:id', auth, async (req, res) => {
  try {
    const pantry = await Pantry.findOneAndDelete({
      userId: req.user._id,
      _id: req.params.id
    });
    
    if (!pantry) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 