import mongoose from 'mongoose';

const SubstitutionSchema = new mongoose.Schema({
  originalIngredient: {
    type: String,
    required: true
  },
  substitutedWith: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const PreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  dietaryPreferences: [{
    type: String,
    enum: [
      'vegetarian',
      'vegan',
      'pescatarian',
      'gluten-free',
      'dairy-free',
      'keto',
      'paleo',
      'halal',
      'kosher',
      'low-carb',
      'low-fat',
      'low-sodium'
    ]
  }],
  allergies: [String],
  preferredBrands: [String],
  avoidedIngredients: [String],
  substitutions: [SubstitutionSchema],
  shoppingPreferences: {
    preferredStores: [String],
    maxPrice: Number,
    preferredBrands: [String],
    organicPreference: Boolean,
    localPreference: Boolean
  },
  lastLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    address: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Create indexes
PreferenceSchema.index({ 'lastLocation.coordinates': '2dsphere' });

// Add methods
PreferenceSchema.methods.updateLocation = async function(latitude, longitude, address) {
  this.lastLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
    address,
    lastUpdated: new Date()
  };
  await this.save();
};

PreferenceSchema.methods.addSubstitution = async function(originalIngredient, substitutedWith, rating) {
  this.substitutions.push({
    originalIngredient,
    substitutedWith,
    rating,
    timestamp: new Date()
  });
  await this.save();
};

PreferenceSchema.methods.getRecentSubstitutions = function(limit = 10) {
  return this.substitutions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

PreferenceSchema.methods.getTopRatedSubstitutions = function() {
  const substitutions = {};
  
  this.substitutions.forEach(sub => {
    const key = `${sub.originalIngredient}:${sub.substitutedWith}`;
    if (!substitutions[key]) {
      substitutions[key] = {
        originalIngredient: sub.originalIngredient,
        substitutedWith: sub.substitutedWith,
        ratings: []
      };
    }
    substitutions[key].ratings.push(sub.rating);
  });

  return Object.values(substitutions)
    .map(sub => ({
      ...sub,
      averageRating: sub.ratings.reduce((a, b) => a + b, 0) / sub.ratings.length
    }))
    .sort((a, b) => b.averageRating - a.averageRating);
};

// Check if model exists before compiling
const Preference = mongoose.models.Preference || mongoose.model('Preference', PreferenceSchema);

export default Preference; 