import express from 'express';
import { SupermarketService } from '../services/supermarketService';
import { validateApiKey } from '../middleware/auth';

const router = express.Router();
const supermarketService = new SupermarketService();

// Get supermarkets near a location
router.get('/', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const supermarkets = await supermarketService.findNearby(
      parseFloat(lat as string),
      parseFloat(lng as string)
    );

    res.json(supermarkets);
  } catch (error) {
    console.error('Error finding nearby supermarkets:', error);
    res.status(500).json({ error: 'Failed to find nearby supermarkets' });
  }
});

// Add a custom supermarket API
router.post('/custom', validateApiKey, async (req, res) => {
  try {
    const { name, apiEndpoint, apiKey } = req.body;

    if (!name || !apiEndpoint) {
      return res.status(400).json({ error: 'Name and API endpoint are required' });
    }

    const newSupermarket = await supermarketService.addCustomSupermarket({
      name,
      apiEndpoint,
      apiKey,
      userId: req.user.id
    });

    res.status(201).json(newSupermarket);
  } catch (error) {
    console.error('Error adding custom supermarket:', error);
    res.status(500).json({ error: 'Failed to add custom supermarket' });
  }
});

// Remove a custom supermarket API
router.delete('/custom/:id', validateApiKey, async (req, res) => {
  try {
    const { id } = req.params;
    
    await supermarketService.removeCustomSupermarket(id, req.user.id);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error removing custom supermarket:', error);
    res.status(500).json({ error: 'Failed to remove custom supermarket' });
  }
});

// Get supported supermarkets by country
router.get('/country/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;
    
    const supermarkets = await supermarketService.getSupermarketsByCountry(countryCode);
    
    res.json(supermarkets);
  } catch (error) {
    console.error('Error getting supermarkets by country:', error);
    res.status(500).json({ error: 'Failed to get supermarkets' });
  }
});

// Validate custom supermarket API
router.post('/custom/validate', validateApiKey, async (req, res) => {
  try {
    const { apiEndpoint, apiKey } = req.body;

    if (!apiEndpoint) {
      return res.status(400).json({ error: 'API endpoint is required' });
    }

    const isValid = await supermarketService.validateCustomApi(apiEndpoint, apiKey);
    
    res.json({ isValid });
  } catch (error) {
    console.error('Error validating custom supermarket API:', error);
    res.status(500).json({ error: 'Failed to validate API' });
  }
});

export default router; 