const mongoose = require('mongoose');

const pantrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ingredients: [{
    ingredient: {
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
    notes: {
      type: String
    }
  }]
}, {
  timestamps: true
});

// Create indexes
pantrySchema.index({ userId: 1 });
pantrySchema.index({ 'ingredients.ingredient': 1 });

// Method to add or update an ingredient
pantrySchema.methods.updateIngredient = function(ingredient, quantity, unit) {
  const existingItem = this.ingredients.find(
    item => item.ingredient.toLowerCase() === ingredient.toLowerCase() && 
           item.unit.toLowerCase() === unit.toLowerCase()
  );

  if (existingItem) {
    existingItem.quantity = quantity;
  } else {
    this.ingredients.push({
      ingredient,
      quantity,
      unit
    });
  }
};

// Method to check if there's enough of an ingredient
pantrySchema.methods.hasEnough = function(ingredient, requiredQuantity, unit) {
  const item = this.ingredients.find(
    item => item.ingredient.toLowerCase() === ingredient.toLowerCase() && 
           item.unit.toLowerCase() === unit.toLowerCase()
  );
  
  return item && item.quantity >= requiredQuantity;
};

// Method to use ingredients (reduce quantity)
pantrySchema.methods.useIngredients = function(ingredients) {
  ingredients.forEach(({ ingredient, quantity, unit }) => {
    const item = this.ingredients.find(
      item => item.ingredient.toLowerCase() === ingredient.toLowerCase() && 
             item.unit.toLowerCase() === unit.toLowerCase()
    );
    
    if (item && item.quantity >= quantity) {
      item.quantity -= quantity;
      // Remove item if quantity becomes 0
      if (item.quantity === 0) {
        this.ingredients = this.ingredients.filter(i => i !== item);
      }
    }
  });
};

module.exports = mongoose.model('Pantry', pantrySchema); 