const mongoose = require('mongoose');

const pantryItemSchema = new mongoose.Schema({
  ingredient: {
    type: String,
    required: true,
    trim: true
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
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  notes: String
});

const pantrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [pantryItemSchema],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated timestamp on save
pantrySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Method to add or update an ingredient
pantrySchema.methods.updateIngredient = function(ingredient, quantity, unit) {
  const existingItem = this.items.find(
    item => item.ingredient.toLowerCase() === ingredient.toLowerCase() && 
           item.unit.toLowerCase() === unit.toLowerCase()
  );

  if (existingItem) {
    existingItem.quantity = quantity;
    existingItem.purchaseDate = new Date();
  } else {
    this.items.push({
      ingredient,
      quantity,
      unit,
      purchaseDate: new Date()
    });
  }
};

// Method to check if there's enough of an ingredient
pantrySchema.methods.hasEnough = function(ingredient, requiredQuantity, unit) {
  const item = this.items.find(
    item => item.ingredient.toLowerCase() === ingredient.toLowerCase() && 
           item.unit.toLowerCase() === unit.toLowerCase()
  );
  
  return item && item.quantity >= requiredQuantity;
};

// Method to use ingredients (reduce quantity)
pantrySchema.methods.useIngredients = function(ingredients) {
  ingredients.forEach(({ ingredient, quantity, unit }) => {
    const item = this.items.find(
      item => item.ingredient.toLowerCase() === ingredient.toLowerCase() && 
             item.unit.toLowerCase() === unit.toLowerCase()
    );
    
    if (item && item.quantity >= quantity) {
      item.quantity -= quantity;
      // Remove item if quantity becomes 0
      if (item.quantity === 0) {
        this.items = this.items.filter(i => i !== item);
      }
    }
  });
};

const Pantry = mongoose.model('Pantry', pantrySchema);

module.exports = Pantry; 