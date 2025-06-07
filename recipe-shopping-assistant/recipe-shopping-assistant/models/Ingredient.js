const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  fromUnit: {
    type: String,
    required: true
  },
  toUnit: {
    type: String,
    required: true
  },
  ratio: {
    type: Number,
    required: true
  }
});

const substituteSchema = new mongoose.Schema({
  ingredient: {
    type: String,
    required: true
  },
  ratio: {
    type: Number,
    required: true,
    default: 1
  },
  notes: String
});

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  aliases: [{
    type: String,
    lowercase: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['pantry', 'produce', 'dairy', 'meat', 'spices', 'other']
  },
  defaultUnit: {
    type: String,
    required: true
  },
  conversions: [conversionSchema],
  substitutes: [substituteSchema],
  estimatedShelfLife: {
    type: Number, // in days
    default: 365
  },
  commonServingSize: {
    quantity: Number,
    unit: String
  },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  }
}, {
  timestamps: true
});

// Add text index for search
ingredientSchema.index({
  name: 'text',
  aliases: 'text'
});

// Method to find best unit conversion path
ingredientSchema.methods.convertUnit = function(fromUnit, toUnit, quantity) {
  if (fromUnit === toUnit) return quantity;
  
  // Direct conversion
  const directConversion = this.conversions.find(
    c => c.fromUnit === fromUnit && c.toUnit === toUnit
  );
  if (directConversion) {
    return quantity * directConversion.ratio;
  }
  
  // Reverse conversion
  const reverseConversion = this.conversions.find(
    c => c.fromUnit === toUnit && c.toUnit === fromUnit
  );
  if (reverseConversion) {
    return quantity / reverseConversion.ratio;
  }
  
  // Two-step conversion through default unit
  const toDefault = this.conversions.find(
    c => c.fromUnit === fromUnit && c.toUnit === this.defaultUnit
  );
  const fromDefault = this.conversions.find(
    c => c.fromUnit === this.defaultUnit && c.toUnit === toUnit
  );
  
  if (toDefault && fromDefault) {
    const inDefaultUnit = quantity * toDefault.ratio;
    return inDefaultUnit * fromDefault.ratio;
  }
  
  throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`);
};

// Static method to find ingredient by name or alias
ingredientSchema.statics.findByNameOrAlias = async function(name) {
  const normalizedName = name.toLowerCase();
  return this.findOne({
    $or: [
      { name: normalizedName },
      { aliases: normalizedName }
    ]
  });
};

const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient; 