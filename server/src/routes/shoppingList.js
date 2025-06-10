import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import ShoppingList from '../models/ShoppingList.js'

const router = express.Router()

// Add items to shopping list
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, store } = req.body
    const userId = req.user.id

    // Create or update shopping list
    const shoppingList = await ShoppingList.findOneAndUpdate(
      { userId, store },
      {
        $push: {
          items: {
            $each: items.map(item => ({
              ...item,
              addedAt: new Date()
            }))
          }
        }
      },
      { upsert: true, new: true }
    )

    res.status(200).json(shoppingList)
  } catch (error) {
    console.error('Error adding items to shopping list:', error)
    res.status(500).json({ error: 'Failed to add items to shopping list' })
  }
})

// Get user's shopping lists
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const shoppingLists = await ShoppingList.find({ userId })
    res.json(shoppingLists)
  } catch (error) {
    console.error('Error fetching shopping lists:', error)
    res.status(500).json({ error: 'Failed to fetch shopping lists' })
  }
})

// Get shopping list by store
router.get('/:store', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { store } = req.params
    const shoppingList = await ShoppingList.findOne({ userId, store })
    res.json(shoppingList || { items: [] })
  } catch (error) {
    console.error('Error fetching shopping list:', error)
    res.status(500).json({ error: 'Failed to fetch shopping list' })
  }
})

// Clear shopping list
router.delete('/:store', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id
    const { store } = req.params
    await ShoppingList.findOneAndDelete({ userId, store })
    res.status(200).json({ message: 'Shopping list cleared successfully' })
  } catch (error) {
    console.error('Error clearing shopping list:', error)
    res.status(500).json({ error: 'Failed to clear shopping list' })
  }
})

export default router 