import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  Kitchen as KitchenIcon,
  AttachMoney as MoneyIcon,
  Balance as BalanceIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import DietaryRequirementsDialog from './DietaryRequirementsDialog';

const SELECTION_MODES = {
  AUTOMATIC_CHEAPEST: 'cheapest',
  AUTOMATIC_AVERAGE: 'average',
  MANUAL: 'manual'
};

const ShoppingListOptimizer = ({ recipe, pantryItems, postcode, supermarket }) => {
  const [optimizedList, setOptimizedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState(supermarket || 'woolworths');
  const [selectionMode, setSelectionMode] = useState(SELECTION_MODES.AUTOMATIC_AVERAGE);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState({});
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [dietaryRequirements, setDietaryRequirements] = useState(null);
  const [openDietaryDialog, setOpenDietaryDialog] = useState(false);

  useEffect(() => {
    if (recipe && recipe.ingredients) {
      optimizeShoppingList();
    }
  }, [recipe, pantryItems, postcode, supermarket, selectionMode]);

  const optimizeShoppingList = async () => {
    setLoading(true);
    setError(null);

    try {
      // First, check what we have in the pantry
      const pantryCheck = await fetch('/api/pantry/check-ingredients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ingredients: recipe.ingredients
        })
      });

      const pantryData = await pantryCheck.json();
      
      // Get product matches for missing ingredients
      const missingIngredients = pantryData.ingredients.filter(i => !i.available);
      
      const productMatches = await fetch('/api/recipe/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ingredients: missingIngredients,
          postcode,
          supermarket: selectedStore,
          selectionMode,
          dietaryRequirements
        })
      });

      const productData = await productMatches.json();

      // Store all products for each ingredient
      const productsMap = {};
      productData.products?.forEach(p => {
        productsMap[p.ingredient.toLowerCase()] = {
          all: p.alternatives?.filter(prod => !dietaryRequirements || prod.isSafe) || [],
          cheapest: p.alternatives?.filter(prod => !dietaryRequirements || prod.isSafe)
            .reduce((min, prod) => (!min || prod.price < min.price) ? prod : min, null),
          average: p.alternatives?.filter(prod => !dietaryRequirements || prod.isSafe)
            .reduce((acc, prod) => ({
              ...prod,
              price: (acc.price || 0) + prod.price / p.alternatives.length
            }), {})
        };
      });
      setAllProducts(productsMap);

      // Combine pantry and product data
      const optimized = recipe.ingredients.map(ingredient => {
        const pantryItem = pantryData.ingredients.find(
          i => i.ingredient.toLowerCase() === ingredient.toLowerCase()
        );
        
        const products = productsMap[ingredient.toLowerCase()];
        let selectedProduct = null;

        if (products) {
          switch (selectionMode) {
            case SELECTION_MODES.AUTOMATIC_CHEAPEST:
              selectedProduct = products.cheapest;
              break;
            case SELECTION_MODES.AUTOMATIC_AVERAGE:
              selectedProduct = products.average;
              break;
            case SELECTION_MODES.MANUAL:
              selectedProduct = products.all[0]; // Default to first safe product
              break;
          }
        }

        return {
          ingredient,
          inPantry: pantryItem?.available || false,
          required: pantryItem?.required || {},
          product: selectedProduct,
          alternatives: products?.all || [],
          dietaryWarnings: selectedProduct?.warnings || []
        };
      });

      setOptimizedList(optimized);
    } catch (error) {
      setError('Failed to optimize shopping list: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (item) => {
    setEditItem(item);
    setSearchQuery('');
    setFilteredProducts(item.alternatives);
    setOpenDialog(true);
  };

  const handleUpdateItem = async (updatedItem) => {
    try {
      const response = await fetch('/api/recipe/update-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ingredient: updatedItem.ingredient,
          productId: updatedItem.product.id,
          postcode,
          supermarket: selectedStore
        })
      });

      if (response.ok) {
        const newList = optimizedList.map(item =>
          item.ingredient === updatedItem.ingredient ? updatedItem : item
        );
        setOptimizedList(newList);
      }
    } catch (error) {
      setError('Failed to update item: ' + error.message);
    }
    setOpenDialog(false);
  };

  const handleSearchProducts = (query) => {
    setSearchQuery(query);
    if (!editItem) return;

    const filtered = editItem.alternatives.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const calculateTotalCost = () => {
    return optimizedList
      .filter(item => !item.inPantry && item.product)
      .reduce((total, item) => total + item.product.price, 0)
      .toFixed(2);
  };

  const handleDietaryRequirementsUpdate = (requirements) => {
    setDietaryRequirements(requirements);
    optimizeShoppingList();
  };

  const renderProductCard = (product, isSelected = false) => (
    <Card 
      variant="outlined" 
      sx={{ 
        mb: 1,
        border: isSelected ? '2px solid #1976d2' : undefined,
        '&:hover': {
          boxShadow: 2
        }
      }}
    >
      <CardContent>
        <Typography variant="subtitle1">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {product.brand}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" color="primary">
            ${product.price.toFixed(2)}
          </Typography>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {product.size}
            </Typography>
            {product.unitPrice && (
              <Typography variant="caption" color="text.secondary">
                (${product.unitPrice.toFixed(2)}/{product.unitType})
              </Typography>
            )}
          </Box>
        </Box>
        {product.dietaryWarnings && product.dietaryWarnings.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {product.dietaryWarnings.map((warning, index) => (
              <Chip
                key={index}
                label={warning}
                color="warning"
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}
        {product.incompatibleReasons && product.incompatibleReasons.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {product.incompatibleReasons.map((reason, index) => (
              <Chip
                key={index}
                label={reason}
                color="error"
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Shopping List Optimizer
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenDietaryDialog(true)}
              startIcon={<KitchenIcon />}
            >
              {dietaryRequirements ? 'Edit Dietary Requirements' : 'Set Dietary Requirements'}
            </Button>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Store</InputLabel>
              <Select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                label="Store"
              >
                <MenuItem value="woolworths">Woolworths</MenuItem>
                <MenuItem value="coles">Coles</MenuItem>
              </Select>
            </FormControl>

            <ToggleButtonGroup
              value={selectionMode}
              exclusive
              onChange={(e, value) => value && setSelectionMode(value)}
              size="small"
            >
              <ToggleButton value={SELECTION_MODES.AUTOMATIC_CHEAPEST}>
                <Tooltip title="Select cheapest products">
                  <MoneyIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value={SELECTION_MODES.AUTOMATIC_AVERAGE}>
                <Tooltip title="Select average-priced products">
                  <BalanceIcon />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value={SELECTION_MODES.MANUAL}>
                <Tooltip title="Select products manually">
                  <SearchIcon />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="contained"
              onClick={optimizeShoppingList}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <ShoppingCartIcon />}
            >
              Optimize List
            </Button>
          </Box>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              <KitchenIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Available in Pantry
            </Typography>
            <List>
              {optimizedList
                .filter(item => item.inPantry)
                .map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={item.ingredient}
                      secondary={`${item.required.quantity} ${item.required.unit}`}
                    />
                    <Chip label="In Pantry" color="success" size="small" />
                  </ListItem>
                ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              <StoreIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Need to Buy (Total: ${calculateTotalCost()})
            </Typography>
            <List>
              {optimizedList
                .filter(item => !item.inPantry)
                .map((item, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={item.ingredient}
                      secondary={`${item.required.quantity} ${item.required.unit}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleEditItem(item)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                    {item.product && renderProductCard(item.product)}
                  </ListItem>
                ))}
            </List>
          </Grid>
        </Grid>
      </Paper>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Choose Product for {editItem?.ingredient}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Search products"
            value={searchQuery}
            onChange={(e) => handleSearchProducts(e.target.value)}
            margin="normal"
            variant="outlined"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          <Box sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
            {filteredProducts.map((product, index) => (
              <Box
                key={index}
                onClick={() => handleUpdateItem({ ...editItem, product })}
                sx={{ cursor: 'pointer' }}
              >
                {renderProductCard(product, editItem?.product?.id === product.id)}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <DietaryRequirementsDialog
        open={openDietaryDialog}
        onClose={() => setOpenDietaryDialog(false)}
        onSave={handleDietaryRequirementsUpdate}
        currentRequirements={dietaryRequirements}
      />
    </Box>
  );
};

export default ShoppingListOptimizer; 