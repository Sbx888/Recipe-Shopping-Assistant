import mongoose from 'mongoose'

const storageSpaceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['refrigerator', 'freezer', 'pantry', 'cellar', 'cabinet', 'other']
  },
  minTemp: {
    type: Number,
    default: null
  },
  maxTemp: {
    type: Number,
    default: null
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  trackExpiry: {
    type: Boolean,
    default: true
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
storageSpaceSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

const StorageSpace = mongoose.model('StorageSpace', storageSpaceSchema)

export default StorageSpace 