import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const DietaryRequirementsDialog = ({ open, onClose, onSave, currentRequirements }) => {
  const [diet, setDiet] = useState(currentRequirements?.diet || 'none');
  const [allergens, setAllergens] = useState(currentRequirements?.allergens || []);
  const [preferences, setPreferences] = useState(currentRequirements?.preferences || []);
  const [avoidIngredients, setAvoidIngredients] = useState(currentRequirements?.avoidIngredients || []);
  const [newAllergen, setNewAllergen] = useState({ name: '', severity: 'strict' });
  const [newIngredient, setNewIngredient] = useState({ ingredient: '', reason: '' });

  const dietTypes = [
    { value: 'none', label: 'No Specific Diet' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'pescatarian', label: 'Pescatarian' },
    { value: 'kosher', label: 'Kosher' },
    { value: 'halal', label: 'Halal' },
    { value: 'gluten-free', label: 'Gluten Free' },
    { value: 'dairy-free', label: 'Dairy Free' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' }
  ];

  const preferenceOptions = [
    { value: 'low-sodium', label: 'Low Sodium' },
    { value: 'low-sugar', label: 'Low Sugar' },
    { value: 'low-fat', label: 'Low Fat' },
    { value: 'organic', label: 'Organic' },
    { value: 'non-gmo', label: 'Non-GMO' },
    { value: 'no-artificial-colors', label: 'No Artificial Colors' },
    { value: 'no-artificial-flavors', label: 'No Artificial Flavors' },
    { value: 'no-preservatives', label: 'No Preservatives' }
  ];

  const commonAllergens = [
    'milk',
    'eggs',
    'fish',
    'shellfish',
    'tree nuts',
    'peanuts',
    'wheat',
    'soybeans',
    'sesame',
    'celery',
    'mustard',
    'sulphites',
    'lupin',
    'molluscs'
  ];

  const handleAddAllergen = () => {
    if (newAllergen.name) {
      setAllergens([...allergens, { ...newAllergen }]);
      setNewAllergen({ name: '', severity: 'strict' });
    }
  };

  const handleRemoveAllergen = (index) => {
    setAllergens(allergens.filter((_, i) => i !== index));
  };

  const handleAddIngredient = () => {
    if (newIngredient.ingredient) {
      setAvoidIngredients([...avoidIngredients, { ...newIngredient }]);
      setNewIngredient({ ingredient: '', reason: '' });
    }
  };

  const handleRemoveIngredient = (index) => {
    setAvoidIngredients(avoidIngredients.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      diet,
      allergens,
      preferences,
      avoidIngredients
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Dietary Requirements</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Diet Type</InputLabel>
            <Select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              label="Diet Type"
            >
              {dietTypes.map(({ value, label }) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h6" sx={{ mb: 1 }}>
            Allergens
            <Tooltip title="Specify allergens and their severity">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <FormControl sx={{ flexGrow: 1 }}>
              <InputLabel>Allergen</InputLabel>
              <Select
                value={newAllergen.name}
                onChange={(e) => setNewAllergen({ ...newAllergen, name: e.target.value })}
                label="Allergen"
              >
                {commonAllergens.map(allergen => (
                  <MenuItem key={allergen} value={allergen}>
                    {allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ width: 150 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={newAllergen.severity}
                onChange={(e) => setNewAllergen({ ...newAllergen, severity: e.target.value })}
                label="Severity"
              >
                <MenuItem value="strict">Strict</MenuItem>
                <MenuItem value="cautious">Cautious</MenuItem>
                <MenuItem value="preference">Preference</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleAddAllergen}
              disabled={!newAllergen.name}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>

          <List>
            {allergens.map((allergen, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={allergen.name}
                  secondary={`Severity: ${allergen.severity}`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleRemoveAllergen(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Preferences
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {preferenceOptions.map(({ value, label }) => (
              <Chip
                key={value}
                label={label}
                onClick={() => {
                  if (preferences.includes(value)) {
                    setPreferences(preferences.filter(p => p !== value));
                  } else {
                    setPreferences([...preferences, value]);
                  }
                }}
                color={preferences.includes(value) ? 'primary' : 'default'}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Additional Ingredients to Avoid
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              label="Ingredient"
              value={newIngredient.ingredient}
              onChange={(e) => setNewIngredient({ ...newIngredient, ingredient: e.target.value })}
              sx={{ flexGrow: 1 }}
            />
            <TextField
              label="Reason"
              value={newIngredient.reason}
              onChange={(e) => setNewIngredient({ ...newIngredient, reason: e.target.value })}
              sx={{ width: 200 }}
            />
            <Button
              variant="contained"
              onClick={handleAddIngredient}
              disabled={!newIngredient.ingredient}
              startIcon={<AddIcon />}
            >
              Add
            </Button>
          </Box>

          <List>
            {avoidIngredients.map((item, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={item.ingredient}
                  secondary={item.reason}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleRemoveIngredient(index)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Requirements
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DietaryRequirementsDialog; 