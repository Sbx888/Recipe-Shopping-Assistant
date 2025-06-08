import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';

const RecipeInput = ({ onSubmit }) => {
  const [recipeUrl, setRecipeUrl] = useState('');
  const [postcode, setPostcode] = useState('');
  const [supermarket, setSupermarket] = useState('');
  const [servings, setServings] = useState(4);
  const [useMetric, setUseMetric] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      recipeUrl,
      postcode,
      supermarket,
      servings,
      useMetric,
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Recipe Details
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Recipe URL"
              variant="outlined"
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
              placeholder="Paste your recipe URL here"
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Postcode"
              variant="outlined"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Supermarket</InputLabel>
              <Select
                value={supermarket}
                onChange={(e) => setSupermarket(e.target.value)}
                label="Supermarket"
                required
              >
                <MenuItem value="woolworths">Woolworths</MenuItem>
                <MenuItem value="coles">Coles</MenuItem>
                <MenuItem value="aldi">Aldi</MenuItem>
                <MenuItem value="iga">IGA</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Servings"
              variant="outlined"
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              inputProps={{ min: 1 }}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={useMetric}
                  onChange={(e) => setUseMetric(e.target.checked)}
                  color="primary"
                />
              }
              label={`Measurements: ${useMetric ? 'Metric' : 'Imperial'}`}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              Find Ingredients
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default RecipeInput; 