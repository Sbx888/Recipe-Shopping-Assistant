import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the server root directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Debug: Check OpenAI configuration
console.log('OpenAI Key Format:', process.env.OPENAI_API_KEY ? `sk-${process.env.OPENAI_API_KEY.split('-')[1].substring(0, 3)}...` : 'Not set');
console.log('OpenAI Org ID:', process.env.OPENAI_ORG_ID ? 'Set' : 'Not set');

// Import routes
import userRoutes from './routes/users.js';
import recipeRoutes from './routes/recipes.js';
import pantryRoutes from './routes/pantry.js';
import ingredientRoutes from './routes/ingredients.js';

const app = express();
const PORT = process.env.PORT || 3005;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/recipe-assistant')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/ingredients', ingredientRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log('Server is listening on all network interfaces');
}); 