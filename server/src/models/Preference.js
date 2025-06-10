import mongoose from 'mongoose';

const brandPreferenceSchema = new mongoose.Schema({
  brandName: { type: String, required: true },
  productCategory: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  usageCount: { type: Number, default: 0 },
  lastUsed: { type: Date },
  notes: String
});

const preferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filteredIngredients: [{
    ingredient: { type: String, required: true },
    reason: { type: String, enum: ['allergy', 'dietary', 'dislike', 'other'] },
    severity: { type: String, enum: ['must_avoid', 'prefer_avoid'] },
    notes: String,
    dateAdded: { type: Date, default: Date.now }
  }],
  dietaryPreferences: [String],
  allergies: [String],
  avoidedIngredients: [String],
  substitutionHistory: [{
    originalIngredient: String,
    substitutedWith: String,
    rating: Number,
    timestamp: Date
  }],
  brandPreferences: [brandPreferenceSchema],
  preferredStores: [String],
  pricePreference: {
    type: String,
    enum: ['budget', 'mid-range', 'premium'],
    default: 'mid-range'
  }
});

const Preference = mongoose.model('Preference', preferenceSchema);
export { Preference };
export default Preference; 