import mongoose from 'mongoose'

const shoppingListItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  estimatedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  purchased: {
    type: Boolean,
    default: false
  },
  actualPrice: {
    type: Number,
    min: 0
  }
})

const shoppingListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: String,
    required: true
  },
  items: [shoppingListItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  totalEstimatedPrice: {
    type: Number,
    default: 0
  },
  totalActualPrice: {
    type: Number,
    default: 0
  }
})

// Update timestamps before saving
shoppingListSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  
  // Calculate total prices
  this.totalEstimatedPrice = this.items.reduce((total, item) => total + item.estimatedPrice, 0)
  this.totalActualPrice = this.items.reduce((total, item) => total + (item.actualPrice || 0), 0)
  
  next()
})

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema)

export default ShoppingList 