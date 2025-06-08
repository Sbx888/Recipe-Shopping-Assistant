import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Grid,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const RecipeDetails = ({ recipe, shoppingList, leftoverIngredients }) => {
  if (!recipe) return null;

  return (
    <Grid container spacing={3}>
      {/* Recipe Information */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {recipe.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            {recipe.prepTime && (
              <Chip
                icon={<AccessTimeIcon />}
                label={`Prep: ${recipe.prepTime}`}
                variant="outlined"
              />
            )}
            {recipe.cookTime && (
              <Chip
                icon={<AccessTimeIcon />}
                label={`Cook: ${recipe.cookTime}`}
                variant="outlined"
              />
            )}
            {recipe.servings && (
              <Chip
                icon={<RestaurantIcon />}
                label={`Serves: ${recipe.servings}`}
                variant="outlined"
              />
            )}
          </Box>

          <Typography variant="h6" gutterBottom>
            Ingredients
          </Typography>
          <List>
            {recipe.ingredients.map((ingredient, index) => (
              <ListItem key={index}>
                <ListItemText primary={ingredient} />
              </ListItem>
            ))}
          </List>

          <Typography variant="h6" gutterBottom>
            Method
          </Typography>
          <List>
            {recipe.method.map((step, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${index + 1}. ${step}`}
                  sx={{ whiteSpace: 'pre-wrap' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Shopping List */}
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCartIcon />
            Shopping List
          </Typography>
          
          {shoppingList?.map((item, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {item.product}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {item.quantity} {item.unit}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${item.price.toFixed(2)}
                </Typography>
              </Box>
              {index < shoppingList.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}

          {leftoverIngredients?.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Leftover Ingredients
              </Typography>
              <List>
                {leftoverIngredients.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.ingredient}
                      secondary={`${item.quantity} ${item.unit} remaining`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default RecipeDetails; 