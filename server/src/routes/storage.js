import express from 'express'
import { authenticateToken } from '../middleware/auth.js'
import StorageSpace from '../models/StorageSpace.js'
import StorageItem from '../models/StorageItem.js'

const router = express.Router()

// Get all storage spaces for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const spaces = await StorageSpace.find({ userId: req.user._id })
    res.json(spaces)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create a new storage space
router.post('/', authenticateToken, async (req, res) => {
  const storageSpace = new StorageSpace({
    ...req.body,
    userId: req.user._id
  })

  try {
    const newSpace = await storageSpace.save()
    res.status(201).json(newSpace)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Get a specific storage space
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const space = await StorageSpace.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
    
    if (!space) {
      return res.status(404).json({ message: 'Storage space not found' })
    }
    
    res.json(space)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update a storage space
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const space = await StorageSpace.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true }
    )
    
    if (!space) {
      return res.status(404).json({ message: 'Storage space not found' })
    }
    
    res.json(space)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete a storage space
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const space = await StorageSpace.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    })
    
    if (!space) {
      return res.status(404).json({ message: 'Storage space not found' })
    }

    // Delete all items in this storage space
    await StorageItem.deleteMany({ storageSpaceId: req.params.id })
    
    res.json({ message: 'Storage space deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all items in a storage space
router.get('/:id/items', authenticateToken, async (req, res) => {
  try {
    const space = await StorageSpace.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
    
    if (!space) {
      return res.status(404).json({ message: 'Storage space not found' })
    }
    
    const items = await StorageItem.find({ storageSpaceId: req.params.id })
    res.json(items)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add an item to a storage space
router.post('/:id/items', authenticateToken, async (req, res) => {
  try {
    const space = await StorageSpace.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
    
    if (!space) {
      return res.status(404).json({ message: 'Storage space not found' })
    }
    
    const item = new StorageItem({
      ...req.body,
      storageSpaceId: req.params.id
    })
    
    const newItem = await item.save()
    res.status(201).json(newItem)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Update an item in a storage space
router.patch('/:id/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const space = await StorageSpace.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
    
    if (!space) {
      return res.status(404).json({ message: 'Storage space not found' })
    }
    
    const item = await StorageItem.findOneAndUpdate(
      { _id: req.params.itemId, storageSpaceId: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    )
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }
    
    res.json(item)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// Delete an item from a storage space
router.delete('/:id/items/:itemId', authenticateToken, async (req, res) => {
  try {
    const space = await StorageSpace.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
    
    if (!space) {
      return res.status(404).json({ message: 'Storage space not found' })
    }
    
    const item = await StorageItem.findOneAndDelete({
      _id: req.params.itemId,
      storageSpaceId: req.params.id
    })
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }
    
    res.json({ message: 'Item deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router 