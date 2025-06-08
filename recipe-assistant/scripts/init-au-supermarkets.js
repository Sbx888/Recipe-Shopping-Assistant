require('dotenv').config();
const mongoose = require('mongoose');
const Config = require('../models/Config');
const auSupermarkets = require('../config/supermarkets.au');

async function initializeAustralianSupermarkets() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/recipe-assistant');
    console.log('Connected to MongoDB');

    // Get existing config
    let config = await Config.findOne({});
    if (!config) {
      config = new Config();
    }

    // Remove existing AU supermarkets
    config.supermarkets = config.supermarkets.filter(s => s.country !== 'AU');

    // Add new AU supermarkets
    config.supermarkets.push(...auSupermarkets);

    // Save configuration
    await config.save();
    console.log('Successfully initialized Australian supermarket configurations');

    // Log current status
    console.log('\nCurrent supermarket configurations:');
    config.supermarkets.forEach(s => {
      console.log(`\n${s.name} (${s.country}):`);
      console.log(`  Active: ${s.active}`);
      console.log(`  API Key Set: ${Boolean(s.apiKey)}`);
      console.log(`  Features: ${Object.entries(s.features)
        .filter(([_, enabled]) => enabled)
        .map(([feature]) => feature)
        .join(', ')}`);
    });

  } catch (error) {
    console.error('Error initializing supermarkets:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the initialization
initializeAustralianSupermarkets(); 