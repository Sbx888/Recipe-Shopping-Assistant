import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Chip,
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, isAfter, isBefore, addDays } from 'date-fns';

const PantryManager = () => {
  const [pantryItems, setPantryItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({
    ingredient: '',
    quantity: '',
    unit: '',
    expiryDate: null,
    notes: ''
  });
  const [commonIngredients, setCommonIngredients] = useState([]);
  const [commonUnits, setCommonUnits] = useState(['g', 'kg', 'ml', 'l', 'piece', 'cup', 'tbsp', 'tsp']);

  // Fetch pantry items and common ingredients on component mount
  useEffect(() => {
    fetchPantryItems();
    fetchCommonIngredients();
  }, []);

  const fetchPantryItems = async () => {
    try {
      const response = await fetch('/api/pantry', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setPantryItems(data.items);
      } else {
        showSnackbar(data.error, 'error');
      }
    } catch (error) {
      showSnackbar('Error fetching pantry items', 'error');
    }
  };

  const fetchCommonIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients/common', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setCommonIngredients(data);
      }
    } catch (error) {
      console.error('Error fetching common ingredients:', error);
    }
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setFormData({
      ingredient: '',
      quantity: '',
      unit: '',
      expiryDate: null,
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setFormData({
      ingredient: item.ingredient,
      quantity: item.quantity,
      unit: item.unit,
      expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
      notes: item.notes || ''
    });
    setOpenDialog(true);
  };

  const handleDeleteItem = async (ingredient) => {
    try {
      const response = await fetch(`/api/pantry/ingredients/${encodeURIComponent(ingredient)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        await fetchPantryItems();
        showSnackbar('Item deleted successfully', 'success');
      } else {
        const data = await response.json();
        showSnackbar(data.error, 'error');
      }
    } catch (error) {
      showSnackbar('Error deleting item', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/pantry/ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        setOpenDialog(false);
        await fetchPantryItems();
        showSnackbar(selectedItem ? 'Item updated successfully' : 'Item added successfully', 'success');
      } else {
        showSnackbar(data.error, 'error');
      }
    } catch (error) {
      showSnackbar('Error saving item', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null;
    
    const date = new Date(expiryDate);
    const today = new Date();
    const warningDate = addDays(today, 7);
    
    if (isBefore(date, today)) {
      return { label: 'Expired', color: 'error' };
    } else if (isBefore(date, warningDate)) {
      return { label: 'Expiring Soon', color: 'warning' };
    }
    return { label: 'Fresh', color: 'success' };
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Pantry
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
        >
          Add Item
        </Button>
      </Box>

      <Grid container spacing={3}>
        {pantryItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.ingredient}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" component="h2">
                    {item.ingredient}
                  </Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleEditItem(item)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteItem(item.ingredient)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                
                <Typography variant="body1" color="text.secondary">
                  {item.quantity} {item.unit}
                </Typography>
                
                {item.expiryDate && (
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={`Expires: ${format(new Date(item.expiryDate), 'MMM d, yyyy')}`}
                      size="small"
                      {...getExpiryStatus(item.expiryDate)}
                    />
                  </Box>
                )}
                
                {item.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {item.notes}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedItem ? 'Edit Pantry Item' : 'Add Pantry Item'}
          </DialogTitle>
          
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Autocomplete
                options={commonIngredients.map(i => i.name)}
                freeSolo
                value={formData.ingredient}
                onChange={(_, newValue) => setFormData({ ...formData, ingredient: newValue })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ingredient"
                    required
                    fullWidth
                    margin="normal"
                  />
                )}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Quantity"
                    type="number"
                    required
                    fullWidth
                    margin="normal"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Autocomplete
                    options={commonUnits}
                    freeSolo
                    value={formData.unit}
                    onChange={(_, newValue) => setFormData({ ...formData, unit: newValue })}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Unit"
                        required
                        fullWidth
                        margin="normal"
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Expiry Date"
                  value={formData.expiryDate}
                  onChange={(newValue) => setFormData({ ...formData, expiryDate: newValue })}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth margin="normal" />
                  )}
                  minDate={new Date()}
                />
              </LocalizationProvider>

              <TextField
                label="Notes"
                multiline
                rows={3}
                fullWidth
                margin="normal"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedItem ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PantryManager; 