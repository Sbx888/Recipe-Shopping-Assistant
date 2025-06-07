# Recipe Shopping Assistant

A Node.js application that helps users manage their pantry, find recipes, and create shopping lists based on what they need.

## Features

- User Authentication
- Pantry Management
- Recipe Search
- Shopping List Generation
- Multiple Supermarket Support
- Metric/Imperial Unit Conversion

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/recipe-shopping-assistant.git
cd recipe-shopping-assistant
```

2. Install dependencies:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies (if you have a client)
cd ../client
npm install
```

3. Create a `.env` file in the server directory with the following variables:
```env
# Server Configuration
PORT=3005
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost/recipe-assistant

# JWT Configuration
JWT_SECRET=your-secret-key-here

# CORS Configuration
CLIENT_URL=http://localhost:3000

# Optional: External API Keys
SPOONACULAR_API_KEY=your-api-key-here
```

## Running the Application

1. Start MongoDB:
```bash
# Using MongoDB Community Server
mongod

# Or if using Docker
docker run -d -p 27017:27017 --name recipe-db mongo
```

2. Start the server:
```bash
cd server
npm run dev
```

3. Start the client (if available):
```bash
cd client
npm start
```

## API Endpoints

### Authentication
- POST `/api/users/register` - Register a new user
- POST `/api/users/login` - Login user
- GET `/api/users/profile` - Get user profile

### Pantry Management
- GET `/api/pantry` - Get user's pantry contents
- POST `/api/pantry/ingredients` - Add/update ingredient
- DELETE `/api/pantry/ingredients/:ingredient` - Remove ingredient
- POST `/api/pantry/check-ingredients` - Check ingredient availability
- POST `/api/pantry/use-ingredients` - Use ingredients from pantry

### Recipe Management (Coming Soon)
- GET `/api/recipes` - Get all recipes
- POST `/api/recipes` - Create new recipe
- GET `/api/recipes/:id` - Get recipe by ID
- PUT `/api/recipes/:id` - Update recipe
- DELETE `/api/recipes/:id` - Delete recipe

### Shopping List (Coming Soon)
- GET `/api/shopping-list` - Get user's shopping list
- POST `/api/shopping-list` - Add items to shopping list
- DELETE `/api/shopping-list/:item` - Remove item from list

## Testing

Run the test suite:
```bash
cd server
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
