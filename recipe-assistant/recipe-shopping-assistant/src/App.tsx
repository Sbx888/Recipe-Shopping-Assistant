import { useState } from 'react'
import { Container, Typography, CssBaseline, ThemeProvider, createTheme, Alert } from '@mui/material'
import RecipeInput from './components/RecipeInput'
import PostcodeInput from './components/PostcodeInput'
import IngredientsList from './components/IngredientsList'
import ShoppingList from './components/ShoppingList'
import { RecipeParser, ParsedRecipe } from './services/recipeParser'
import { SupermarketFinder, Supermarket } from './services/supermarketFinder'
import { IngredientTracker, IngredientWithPrice } from './services/ingredientTracker'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [currentRecipe, setCurrentRecipe] = useState<ParsedRecipe | null>(null);
  const [selectedSupermarket, setSelectedSupermarket] = useState<string>('');
  const [postcode, setPostcode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [nearbyStores, setNearbyStores] = useState<Supermarket[]>([]);
  const [shoppingList, setShoppingList] = useState<IngredientWithPrice[]>([]);

  const handleRecipeSubmit = async (url: string) => {
    try {
      setError('');
      const recipe = await RecipeParser.parseRecipeUrl(url);
      setCurrentRecipe(recipe);
      
      if (selectedSupermarket) {
        const ingredients = IngredientTracker.calculateNeededAmount(
          recipe.ingredients,
          selectedSupermarket
        );
        setShoppingList(ingredients);
      }
    } catch (err) {
      setError('Failed to parse recipe. Please check the URL and try again.');
      console.error('Error parsing recipe:', err);
    }
  };

  const handlePostcodeSubmit = async (newPostcode: string) => {
    try {
      setError('');
      setPostcode(newPostcode);
      const stores = await SupermarketFinder.findNearestSupermarkets(newPostcode);
      setNearbyStores(stores);
    } catch (err) {
      setError('Failed to find supermarkets. Please check the postcode and try again.');
      console.error('Error finding supermarkets:', err);
    }
  };

  const handleSupermarketSelect = (supermarket: string) => {
    setSelectedSupermarket(supermarket);
    if (currentRecipe) {
      const ingredients = IngredientTracker.calculateNeededAmount(
        currentRecipe.ingredients,
        supermarket
      );
      setShoppingList(ingredients);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Recipe Shopping Assistant
        </Typography>
        
        <PostcodeInput 
          onPostcodeSubmit={handlePostcodeSubmit}
          onSupermarketSelect={handleSupermarketSelect}
        />
        
        <RecipeInput onSubmit={handleRecipeSubmit} />
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {currentRecipe && (
          <IngredientsList 
            title={currentRecipe.title}
            ingredients={currentRecipe.ingredients}
          />
        )}

        {shoppingList.length > 0 && selectedSupermarket && (
          <ShoppingList 
            ingredients={shoppingList}
            supermarket={selectedSupermarket}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App
