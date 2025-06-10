import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  ingredients: [{
    type: String,
    required: true,
    trim: true
  }],
  instructions: [{
    type: String,
    required: true,
    trim: true
  }],
  servings: {
    type: Number,
    default: 4
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  importDate: {
    type: Date,
    default: Date.now
  },
  parseTime: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes
recipeSchema.index({ userId: 1 });
recipeSchema.index({ title: 'text' });

export const Recipe = mongoose.model('Recipe', recipeSchema); 