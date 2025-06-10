import mongoose from 'mongoose'

const foodCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  icon: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  commonItems: [{
    type: String,
    trim: true
  }],
  storageRecommendations: {
    type: String,
    trim: true,
    default: ''
  }
})

// Default categories
const defaultCategories = [
  {
    name: 'Dairy & Eggs',
    icon: 'milk',
    description: 'Dairy products and eggs',
    commonItems: ['Milk', 'Cheese', 'Yogurt', 'Butter', 'Eggs', 'Cream'],
    storageRecommendations: 'Store between 0-4°C (32-39°F)'
  },
  {
    name: 'Meat & Poultry',
    icon: 'meat',
    description: 'Fresh and processed meats',
    commonItems: ['Chicken', 'Beef', 'Pork', 'Turkey', 'Sausages', 'Ground Meat'],
    storageRecommendations: 'Store between 0-2°C (32-36°F)'
  },
  {
    name: 'Fruits & Vegetables',
    icon: 'produce',
    description: 'Fresh produce',
    commonItems: ['Apples', 'Bananas', 'Carrots', 'Lettuce', 'Tomatoes', 'Onions'],
    storageRecommendations: 'Most produce best stored between 4-8°C (39-46°F)'
  },
  {
    name: 'Bread & Bakery',
    icon: 'bread',
    description: 'Breads and baked goods',
    commonItems: ['Bread', 'Rolls', 'Bagels', 'Muffins', 'Pastries', 'Tortillas'],
    storageRecommendations: 'Store at room temperature or freeze for longer shelf life'
  },
  {
    name: 'Beverages',
    icon: 'drink',
    description: 'Drinks and liquid refreshments',
    commonItems: ['Water', 'Juice', 'Soda', 'Tea', 'Coffee', 'Sports Drinks'],
    storageRecommendations: 'Store according to type - refrigerate if opened'
  },
  {
    name: 'Condiments & Sauces',
    icon: 'sauce',
    description: 'Sauces, spreads, and seasonings',
    commonItems: ['Ketchup', 'Mustard', 'Mayonnaise', 'Hot Sauce', 'Salad Dressing', 'BBQ Sauce'],
    storageRecommendations: 'Most need refrigeration after opening'
  },
  {
    name: 'Canned & Jarred',
    icon: 'can',
    description: 'Preserved foods in cans and jars',
    commonItems: ['Soup', 'Beans', 'Tuna', 'Tomato Sauce', 'Pickles', 'Olives'],
    storageRecommendations: 'Store in a cool, dry place. Refrigerate after opening'
  },
  {
    name: 'Dry Goods & Pasta',
    icon: 'pasta',
    description: 'Pasta, grains, and dry ingredients',
    commonItems: ['Pasta', 'Rice', 'Flour', 'Sugar', 'Cereal', 'Crackers'],
    storageRecommendations: 'Store in airtight containers in a cool, dry place'
  },
  {
    name: 'Snacks',
    icon: 'snack',
    description: 'Chips, nuts, and other snack foods',
    commonItems: ['Chips', 'Nuts', 'Popcorn', 'Pretzels', 'Trail Mix', 'Dried Fruit'],
    storageRecommendations: 'Store in airtight containers in a cool, dry place'
  },
  {
    name: 'Frozen Foods',
    icon: 'frozen',
    description: 'Frozen meals and ingredients',
    commonItems: ['Ice Cream', 'Frozen Vegetables', 'Frozen Pizza', 'Frozen Meals', 'Ice', 'Frozen Fruit'],
    storageRecommendations: 'Keep at -18°C (0°F) or below'
  },
  {
    name: 'Alcohol',
    icon: 'wine',
    description: 'Alcoholic beverages',
    commonItems: ['Beer', 'Wine', 'Spirits', 'Liqueurs', 'Hard Seltzer', 'Cider'],
    storageRecommendations: 'Store according to type - some need refrigeration'
  },
  {
    name: 'Spices & Herbs',
    icon: 'spice',
    description: 'Dried spices and herbs',
    commonItems: ['Black Pepper', 'Salt', 'Cinnamon', 'Garlic Powder', 'Basil', 'Oregano'],
    storageRecommendations: 'Store in airtight containers away from heat and light'
  }
]

// Method to initialize default categories
foodCategorySchema.statics.initializeDefaultCategories = async function() {
  try {
    // Check if categories already exist
    const count = await this.countDocuments()
    if (count === 0) {
      await this.insertMany(defaultCategories)
      console.log('Default food categories initialized')
    }
  } catch (error) {
    console.error('Error initializing food categories:', error)
    throw error
  }
}

const FoodCategory = mongoose.model('FoodCategory', foodCategorySchema)

export default FoodCategory 