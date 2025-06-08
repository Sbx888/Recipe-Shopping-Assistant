import mongoose from 'mongoose';

const PantryItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  category: {
    type: String,
    enum: ['dairy', 'meat', 'produce', 'grains', 'spices', 'canned', 'frozen', 'other'],
    default: 'other'
  },
  expirationDate: {
    type: Date
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  notes: String
}, {
  timestamps: true
});

// Create compound index for userId and name to ensure unique items per user
PantryItemSchema.index({ userId: 1, name: 1 }, { unique: true });

const Pantry = mongoose.model('Pantry', PantryItemSchema);

export default Pantry; 