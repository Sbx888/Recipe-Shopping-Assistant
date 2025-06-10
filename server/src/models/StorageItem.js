import mongoose from 'mongoose'

const storageItemSchema = new mongoose.Schema({
  storageSpaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StorageSpace',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodCategory',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// Update the updatedAt timestamp before saving
storageItemSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

const StorageItem = mongoose.model('StorageItem', storageItemSchema)

export default StorageItem 