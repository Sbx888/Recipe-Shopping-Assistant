import React from 'react';
import { 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  Typography, 
  Divider 
} from '@mui/material';
import { Ingredient } from '../services/recipeParser';

interface IngredientsListProps {
  title: string;
  ingredients: Ingredient[];
}

const IngredientsList: React.FC<IngredientsListProps> = ({ title, ingredients }) => {
  return (
    <Paper elevation={3} sx={{ mt: 3, p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        {title}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <List>
        {ingredients.map((ingredient, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={ingredient.name}
              secondary={`${ingredient.amount} ${ingredient.unit}`.trim()}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default IngredientsList; 