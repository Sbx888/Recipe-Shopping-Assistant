const express = require('express');
const router = express.Router();
const configService = require('../services/configService');
const { isAdmin } = require('../middleware/auth');

// Get all configuration settings
router.get('/config', isAdmin, async (req, res) => {
  try {
    const config = await configService.getConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update general configuration
router.patch('/config', isAdmin, async (req, res) => {
  try {
    const config = await configService.updateConfig(req.body);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supermarket management
router.post('/config/supermarkets', isAdmin, async (req, res) => {
  try {
    const config = await configService.addSupermarket(req.body);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/config/supermarkets/:id', isAdmin, async (req, res) => {
  try {
    const config = await configService.updateSupermarket(req.params.id, req.body);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/config/supermarkets/:id', isAdmin, async (req, res) => {
  try {
    const config = await configService.removeSupermarket(req.params.id);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Translation service configuration
router.post('/config/translation', isAdmin, async (req, res) => {
  try {
    const { provider, apiKey, region } = req.body;
    const config = await configService.updateTranslationService(provider, apiKey, region);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get supermarkets by country
router.get('/config/supermarkets/country/:country', isAdmin, async (req, res) => {
  try {
    const supermarkets = await configService.getSupermarketsByCountry(req.params.country);
    res.json(supermarkets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 