import React, { useState } from 'react';
import {
  Container,
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import RecipeInput from './components/RecipeInput';
import RecipeDetails from './components/RecipeDetails';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [shoppingList, setShoppingList] = useState(null);
  const [leftoverIngredients, setLeftoverIngredients] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      // First, fetch the recipe
      const recipeResponse = await fetch(`http://localhost:3005/api/recipe?url=${encodeURIComponent(formData.recipeUrl)}&servings=${formData.servings}`);
      const recipeData = await recipeResponse.json();
      
      if (!recipeResponse.ok) {
        throw new Error(recipeData.error || 'Failed to fetch recipe');
      }

      setRecipe(recipeData.recipe);

      // TODO: Implement supermarket API integration
      // For now, using mock data
      setShoppingList([
        {
          product: 'Example Product 1',
          quantity: 1,
          unit: 'kg',
          price: 5.99
        },
        {
          product: 'Example Product 2',
          quantity: 2,
          unit: 'pieces',
          price: 3.99
        }
      ]);

      // Mock leftover ingredients
      setLeftoverIngredients([
        {
          ingredient: 'Example Leftover 1',
          quantity: 0.5,
          unit: 'bunch'
        }
      ]);

    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">
            Recipe Shopping Assistant
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <RecipeInput onSubmit={handleSubmit} />
        
        {loading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ my: 2, p: 2, bgcolor: 'error.main', color: 'error.contrastText', borderRadius: 1 }}>
            <Typography>{error}</Typography>
          </Box>
        )}

        {recipe && (
          <RecipeDetails
            recipe={recipe}
            shoppingList={shoppingList}
            leftoverIngredients={leftoverIngredients}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App; 