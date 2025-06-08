import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '../.env');
console.log('Loading environment variables from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Error loading .env file:', result.error);
  process.exit(1);
}

// Verify environment variables are loaded
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'OPENAI_API_KEY'];
const missingVars = [];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingVars.push(envVar);
  }
}

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Import routes
import userRoutes from './routes/users.js';
import pantryRoutes from './routes/pantry.js';
import recipeRoutes from './routes/recipes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/pantry', pantryRoutes);
app.use('/api/recipes', recipeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB
try {
  console.log('Attempting to connect to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('Connected to MongoDB successfully');
} catch (err) {
  console.error('MongoDB connection error:', err);
  process.exit(1);
}

// Function to find an available port
const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (port < startPort + 10) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(port, '0.0.0.0')
          .once('error', (err) => {
            server.close();
            if (err.code === 'EADDRINUSE') {
              port++;
              resolve(false);
            } else {
              reject(err);
            }
          })
          .once('listening', () => {
            server.close();
            resolve(true);
          });
      });
      return port;
    } catch (err) {
      console.error(`Error trying port ${port}:`, err);
      port++;
    }
  }
  throw new Error('No available ports found');
};

// Start server
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    const availablePort = await findAvailablePort(PORT);
    const server = app.listen(availablePort, '0.0.0.0', () => {
      console.log(`Server is running at http://localhost:${availablePort}`);
      console.log('Server is listening on all network interfaces');
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log('Received shutdown signal. Closing server...');
      server.close(() => {
        console.log('Server closed. Closing MongoDB connection...');
        mongoose.connection.close(false, () => {
          console.log('MongoDB connection closed. Exiting process.');
          process.exit(0);
        });
      });

      // Force exit if graceful shutdown fails
      setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer(); 