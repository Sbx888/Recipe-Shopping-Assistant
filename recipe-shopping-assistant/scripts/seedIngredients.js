const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ingredient = require('../models/Ingredient');

// Load environment variables
dotenv.config();

// Common ingredients with their properties
const ingredients = [
  {
    name: 'flour',
    aliases: ['all-purpose flour', 'plain flour', 'wheat flour'],
    category: 'pantry',
    defaultUnit: 'g',
    conversions: [
      { fromUnit: 'cup', toUnit: 'g', ratio: 125 },
      { fromUnit: 'g', toUnit: 'oz', ratio: 0.035274 }
    ],
    estimatedShelfLife: 240, // 8 months
    commonServingSize: { quantity: 100, unit: 'g' }
  },
  {
    name: 'sugar',
    aliases: ['white sugar', 'granulated sugar', 'caster sugar'],
    category: 'pantry',
    defaultUnit: 'g',
    conversions: [
      { fromUnit: 'cup', toUnit: 'g', ratio: 200 },
      { fromUnit: 'g', toUnit: 'oz', ratio: 0.035274 }
    ],
    estimatedShelfLife: 720, // 2 years
    commonServingSize: { quantity: 50, unit: 'g' }
  },
  {
    name: 'milk',
    aliases: ['whole milk', 'full cream milk'],
    category: 'dairy',
    defaultUnit: 'ml',
    conversions: [
      { fromUnit: 'cup', toUnit: 'ml', ratio: 250 },
      { fromUnit: 'ml', toUnit: 'fl oz', ratio: 0.033814 }
    ],
    estimatedShelfLife: 7,
    commonServingSize: { quantity: 250, unit: 'ml' }
  },
  {
    name: 'eggs',
    aliases: ['egg', 'whole egg'],
    category: 'dairy',
    defaultUnit: 'piece',
    conversions: [],
    estimatedShelfLife: 30,
    commonServingSize: { quantity: 1, unit: 'piece' }
  },
  {
    name: 'butter',
    aliases: ['unsalted butter', 'salted butter'],
    category: 'dairy',
    defaultUnit: 'g',
    conversions: [
      { fromUnit: 'cup', toUnit: 'g', ratio: 227 },
      { fromUnit: 'g', toUnit: 'oz', ratio: 0.035274 },
      { fromUnit: 'stick', toUnit: 'g', ratio: 113 }
    ],
    estimatedShelfLife: 90,
    commonServingSize: { quantity: 30, unit: 'g' }
  },
  {
    name: 'olive oil',
    aliases: ['extra virgin olive oil', 'EVOO'],
    category: 'pantry',
    defaultUnit: 'ml',
    conversions: [
      { fromUnit: 'cup', toUnit: 'ml', ratio: 240 },
      { fromUnit: 'ml', toUnit: 'fl oz', ratio: 0.033814 }
    ],
    estimatedShelfLife: 540, // 18 months
    commonServingSize: { quantity: 15, unit: 'ml' }
  },
  {
    name: 'salt',
    aliases: ['table salt', 'sea salt', 'kosher salt'],
    category: 'pantry',
    defaultUnit: 'g',
    conversions: [
      { fromUnit: 'tsp', toUnit: 'g', ratio: 5 },
      { fromUnit: 'tbsp', toUnit: 'g', ratio: 15 }
    ],
    estimatedShelfLife: 1825, // 5 years
    commonServingSize: { quantity: 1, unit: 'g' }
  },
  {
    name: 'black pepper',
    aliases: ['ground black pepper', 'cracked black pepper'],
    category: 'spices',
    defaultUnit: 'g',
    conversions: [
      { fromUnit: 'tsp', toUnit: 'g', ratio: 2.5 },
      { fromUnit: 'tbsp', toUnit: 'g', ratio: 7.5 }
    ],
    estimatedShelfLife: 730, // 2 years
    commonServingSize: { quantity: 0.5, unit: 'g' }
  },
  {
    name: 'onion',
    aliases: ['brown onion', 'yellow onion'],
    category: 'produce',
    defaultUnit: 'piece',
    conversions: [
      { fromUnit: 'piece', toUnit: 'g', ratio: 150 }
    ],
    estimatedShelfLife: 30,
    commonServingSize: { quantity: 1, unit: 'piece' }
  },
  {
    name: 'garlic',
    aliases: ['garlic clove', 'fresh garlic'],
    category: 'produce',
    defaultUnit: 'clove',
    conversions: [
      { fromUnit: 'clove', toUnit: 'g', ratio: 5 }
    ],
    estimatedShelfLife: 90,
    commonServingSize: { quantity: 1, unit: 'clove' }
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/recipe-assistant', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Clear existing ingredients
    await Ingredient.deleteMany({});
    console.log('Cleared existing ingredients');

    // Insert new ingredients
    const result = await Ingredient.insertMany(ingredients);
    console.log(`Added ${result.length} ingredients to the database`);

    // Add some common substitutes
    const flour = await Ingredient.findOne({ name: 'flour' });
    if (flour) {
      flour.substitutes.push({
        ingredient: 'almond flour',
        ratio: 1
      });
      await flour.save();
    }

    const sugar = await Ingredient.findOne({ name: 'sugar' });
    if (sugar) {
      sugar.substitutes.push({
        ingredient: 'honey',
        ratio: 0.75 // Use 25% less honey than sugar
      });
      await sugar.save();
    }

    console.log('Added ingredient substitutes');
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}).catch(err => {
  console.error('MongoDB connection error:', err);
}); 