import React from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import { IngredientWithPrice } from '../services/ingredientTracker';

interface ShoppingListProps {
  ingredients: IngredientWithPrice[];
  supermarket: string;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ ingredients, supermarket }) => {
  const totalCost = ingredients.reduce((sum, item) => sum + item.price, 0);

  return (
    <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Shopping List - {supermarket}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <List>
        {ingredients.map((ingredient, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={ingredient.name}
              secondary={
                <React.Fragment>
                  <Typography component="span" variant="body2" color="text.primary">
                    {ingredient.quantity} × {ingredient.packageSize}{ingredient.unit} 
                    {' '}(£{ingredient.price.toFixed(2)})
                  </Typography>
                  {ingredient.leftover > 0 && (
                    <Typography component="p" variant="body2" color="text.secondary">
                      Leftover: {ingredient.leftover}{ingredient.unit}
                    </Typography>
                  )}
                </React.Fragment>
              }
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2 }}>
        <Typography variant="h6">Total Cost:</Typography>
        <Typography variant="h6">£{totalCost.toFixed(2)}</Typography>
      </Box>
    </Paper>
  );
};

export default ShoppingList; 