const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import services
const ingredientParser = require('./services/ingredientParser');
const supermarketApi = require('./services/supermarketApi');
const configService = require('./services/configService');

// Import routes
const userRoutes = require('./routes/users');
const pantryRoutes = require('./routes/pantry');
const ingredientRoutes = require('./routes/ingredients');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3005;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/recipe-assistant', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// More detailed CORS configuration
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add OPTIONS handler for preflight requests
app.options('*', cors());

// Parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  next();
});

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/admin', adminRoutes);

// Recipe endpoint with enhanced functionality
app.get('/api/recipe', async (req, res) => {
  try {
    const { url, servings, postcode, supermarket, useMetric } = req.query;
    const scaleFactor = servings ? parseFloat(servings) : 1;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    // Fetch and parse recipe
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    
    // Extract recipe information
    const recipe = {
      title: $('h1').first().text().trim(),
      ingredients: [],
      method: [],
      servings: '',
      prepTime: '',
      cookTime: ''
    };

    // Get cooking info
    recipe.servings = $('[class*="serves"], [class*="cooking-info-serves"]').first().text().trim();
    recipe.prepTime = $('[class*="prep"], [class*="cooking-info-prep"]').first().text().trim();
    recipe.cookTime = $('[class*="cook"], [class*="cooking-info-cook"]').first().text().trim();

    // Get ingredients with multiple selector attempts
    const ingredientSelectors = [
      '.ingredient-description',
      '.ingredients-list li',
      '.ingredient',
      '[class*="ingredients"] li',
      '#ingredients li'
    ];

    const rawIngredients = [];
    ingredientSelectors.forEach(selector => {
      $(selector).each((i, el) => {
        const ingredient = $(el).text().trim();
        if (ingredient && !rawIngredients.includes(ingredient)) {
          rawIngredients.push(ingredient);
        }
      });
    });

    // Parse and standardize ingredients
    const parsedIngredients = await Promise.all(
      rawIngredients.map(async ingredient => {
        const parsed = await ingredientParser.parse(ingredient);
        if (parsed.quantity && scaleFactor !== 1) {
          parsed.quantity *= scaleFactor;
        }
        return parsed;
      })
    );

    recipe.ingredients = parsedIngredients.map(i => i.original);

    // Get method steps
    const methodSelectors = [
      '.recipe-method-step-content',
      '.method-step',
      '.method li',
      '[class*="method"] li',
      '#method li',
      '.instructions li',  // Added for vjcooks.com
      '.instructions ol li',  // Added for vjcooks.com
      'ol li'  // More generic selector as fallback
    ];

    methodSelectors.forEach(selector => {
      $(selector).each((i, el) => {
        const step = $(el).text().trim();
        if (step && !recipe.method.includes(step)) {
          recipe.method.push(step);
        }
      });
    });

    // If no method steps found, try getting them from a paragraph format
    if (recipe.method.length === 0) {
      $('.instructions, .method, [class*="method"]').find('p').each((i, el) => {
        const step = $(el).text().trim();
        if (step && !recipe.method.includes(step)) {
          recipe.method.push(step);
        }
      });
    }

    // Generate shopping list if supermarket and postcode provided
    let shoppingList = [];
    if (supermarket && postcode) {
      shoppingList = await Promise.all(
        parsedIngredients.map(async ingredient => {
          try {
            const product = await supermarketApi.findBestMatch(
              ingredient.ingredient,
              ingredient.quantity,
              ingredient.unit,
              supermarket,
              postcode
            );

            return {
              ingredient: ingredient.original,
              product: product ? {
                name: product.name,
                brand: product.brand,
                price: product.price,
                size: product.packageSize,
                link: product.link,
                image: product.imageUrl
              } : null,
              quantity: ingredient.quantity,
              unit: ingredient.unit
            };
          } catch (error) {
            console.error('Error finding product match:', error);
            return {
              ingredient: ingredient.original,
              product: null,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              error: 'Product not found'
            };
          }
        })
      );
    }

    res.json({
      success: true,
      recipe,
      shoppingList: shoppingList.length > 0 ? shoppingList : undefined
    });

  } catch (error) {
    console.error('Error fetching recipe:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    res.status(500).json({
      error: 'Failed to fetch recipe',
      details: error.message,
      status: error.response?.status
    });
  }
});

// New endpoint to detect recipes on a page
app.get('/api/detect-recipes', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log('Detecting recipes from:', url);
    console.log('Making request with headers:', {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    });

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.taste.com.au/'
      },
      timeout: 30000, // Increased timeout
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Accept all responses to handle them manually
      }
    });

    if (response.status !== 200) {
      console.error('Non-200 response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    if (!response.data || typeof response.data !== 'string') {
      console.error('Invalid response data:', response.data);
      throw new Error('Invalid response from the recipe page');
    }

    console.log('Successfully fetched page, content length:', response.data.length);
    const $ = cheerio.load(response.data);
    const recipes = [];

    // First check if this is a single recipe page by looking for recipe-specific elements
    const isSingleRecipe = Boolean(
      $('.recipe-cooking-info').length ||
      $('.ingredients-list').length ||
      $('.method-list').length ||
      $('[itemtype*="Recipe"]').length
    );

    if (isSingleRecipe) {
      // This is a single recipe page
      const recipeTitle = $('h1').first().text().trim();
      const recipeUrl = url;
      
      if (!recipeTitle) {
        console.log('No recipe title found on single recipe page');
        throw new Error('Could not find recipe title. Please check if this is a valid recipe page.');
      }
      
      console.log('Found single recipe page:', recipeTitle);
      res.json({
        isGalleryPage: false,
        recipes: [{
          title: recipeTitle,
          url: recipeUrl
        }]
      });
    } else {
      // This is a gallery/collection page
      const MAX_RECIPES = 5;
      let foundRecipes = new Set();

      // Helper function to check if a recipe section looks like an ad
      const isLikelyAd = (element) => {
        const text = $(element).text().toLowerCase();
        const classes = $(element).attr('class') || '';
        return text.includes('sponsored') ||
               text.includes('advertisement') ||
               text.includes('promotion') ||
               classes.includes('ad') ||
               classes.includes('sponsored') ||
               classes.includes('promotion');
      };

      // Helper function to normalize image URLs
      const normalizeImageUrl = (url) => {
        if (!url) return '';
        // Handle relative URLs
        if (url.startsWith('//')) {
          return `https:${url}`;
        }
        // Handle relative paths
        if (url.startsWith('/')) {
          return `https://www.taste.com.au${url}`;
        }
        // Handle data URLs or complete URLs
        return url;
      };

      // Helper function to scale ingredient quantities
      const scaleIngredient = (ingredient, scaleFactor) => {
        // Regular expression to match numbers (including decimals and fractions)
        const numberRegex = /(\d*\.?\d+|\d+\/\d+)/g;
        
        return ingredient.replace(numberRegex, (match) => {
          let num;
          if (match.includes('/')) {
            // Handle fractions
            const [numerator, denominator] = match.split('/');
            num = parseFloat(numerator) / parseFloat(denominator);
          } else {
            num = parseFloat(match);
          }
          
          // Scale the number
          const scaled = num * scaleFactor;
          
          // Format the result (keep 2 decimal places if needed)
          return scaled % 1 === 0 ? scaled.toString() : scaled.toFixed(2);
        });
      };

      // Helper function to add a recipe if it's valid
      const addRecipe = (el, context) => {
        if (foundRecipes.size >= MAX_RECIPES) return false;
        
        const container = $(el).closest('article, div');
        if (isLikelyAd(container)) return true;
        
        const link = $(el).attr('href');
        let title = '';
        
        // Try multiple ways to get the title
        const possibleTitle = $(el).find('h3').first().text().trim() ||
                            $(el).closest('article').find('h3').first().text().trim() ||
                            $(el).attr('title') ||
                            $(el).text().trim();
        
        if (possibleTitle) {
          title = possibleTitle;
        }
        
        if (link && 
            (link.includes('/recipes/') || link.includes('/recipe/')) && 
            title && 
            title.length > 0 && 
            title.length < 100 && 
            !foundRecipes.has(title)) {
          
          // Get image with improved handling
          let imageUrl = '';
          const findImage = (element) => {
            const img = element.find('img').first();
            if (img.length) {
              // Try multiple image attributes
              return normalizeImageUrl(
                img.attr('src') || 
                img.attr('data-src') || 
                img.attr('data-lazy-src') ||
                img.attr('srcset')?.split(',')[0]?.trim()?.split(' ')[0] ||
                ''
              );
            }
            return '';
          };
          
          // Look for images in multiple places
          imageUrl = findImage($(el)) ||                     // Direct child image
                    findImage($(el).closest('article')) ||   // Article container image
                    findImage($(el).closest('.recipe-card')) || // Recipe card image
                    findImage($(el).parent());              // Parent container image
          
          if (imageUrl) {
            const fullUrl = link.startsWith('http') ? link : `https://www.taste.com.au${link}`;
            foundRecipes.add(title);
            recipes.push({
              title: title,
              url: fullUrl,
              imageUrl: imageUrl,
              context: context
            });
          }
        }
        return true;
      };

      // Priority order for finding recipes:
      // 1. Main featured recipe if it exists
      $('.recipe-feature a, .featured-recipe a').each((i, el) => addRecipe(el, 'featured'));
      
      // 2. Recipes from the main content area with images
      if (foundRecipes.size < MAX_RECIPES) {
        $('.recipe-grid a, .recipe-card a').each((i, el) => addRecipe(el, 'main grid'));
      }
      
      // 3. Related recipes section
      if (foundRecipes.size < MAX_RECIPES) {
        $('.related-recipes a, .similar-recipes a').each((i, el) => addRecipe(el, 'related'));
      }
      
      // 4. Any remaining recipe links with images in the main content
      if (foundRecipes.size < MAX_RECIPES) {
        $('article a, .content-area a').each((i, el) => addRecipe(el, 'content'));
      }

      console.log(`Found ${recipes.length} recipes on gallery page (limited to ${MAX_RECIPES})`);
      
      // Validate we found at least some recipes
      if (recipes.length === 0) {
        console.log('No recipes found on gallery page');
        throw new Error('No recipes found on this page. Please check if this is a valid recipe gallery.');
      }
      
      res.json({
        isGalleryPage: true,
        recipes: recipes.slice(0, MAX_RECIPES) // Ensure we never return more than MAX_RECIPES
      });
    }
  } catch (error) {
    console.error('Error detecting recipes:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({
      error: 'Failed to detect recipes',
      details: error.message,
      status: error.response?.status
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log('Server is listening on all network interfaces');
}); 