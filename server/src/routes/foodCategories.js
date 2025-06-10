import express from 'express'
import FoodCategory from '../models/FoodCategory.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Initialize default categories
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    await FoodCategory.initializeDefaultCategories()
    res.status(200).json({ message: 'Food categories initialized successfully' })
  } catch (error) {
    console.error('Error initializing food categories:', error)
    res.status(500).json({ error: 'Failed to initialize food categories' })
  }
})

// Get all food categories
router.get('/', authenticateToken, async (req, res) => {
  try {
    const categories = await FoodCategory.find()
    res.json(categories)
  } catch (error) {
    console.error('Error fetching food categories:', error)
    res.status(500).json({ error: 'Failed to fetch food categories' })
  }
})

// Get a specific food category
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const category = await FoodCategory.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ error: 'Food category not found' })
    }
    res.json(category)
  } catch (error) {
    console.error('Error fetching food category:', error)
    res.status(500).json({ error: 'Failed to fetch food category' })
  }
})

// Create a custom food category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const category = new FoodCategory(req.body)
    await category.save()
    res.status(201).json(category)
  } catch (error) {
    console.error('Error creating food category:', error)
    res.status(500).json({ error: 'Failed to create food category' })
  }
})

// Update a food category
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const category = await FoodCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!category) {
      return res.status(404).json({ error: 'Food category not found' })
    }
    res.json(category)
  } catch (error) {
    console.error('Error updating food category:', error)
    res.status(500).json({ error: 'Failed to update food category' })
  }
})

// Delete a food category
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const category = await FoodCategory.findByIdAndDelete(req.params.id)
    if (!category) {
      return res.status(404).json({ error: 'Food category not found' })
    }
    res.json({ message: 'Food category deleted successfully' })
  } catch (error) {
    console.error('Error deleting food category:', error)
    res.status(500).json({ error: 'Failed to delete food category' })
  }
})

export default router 