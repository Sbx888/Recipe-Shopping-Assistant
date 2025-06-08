import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';

interface Supermarket {
  id: string;
  name: string;
  country: string;
  apiEndpoint?: string;
  features: {
    delivery: boolean;
    pickup: boolean;
    realTimeInventory: boolean;
  };
}

interface SupermarketSelectorProps {
  location: {
    lat: number;
    lng: number;
    postcode: string;
  };
  onSupermarketSelect: (supermarket: Supermarket) => void;
}

const SupermarketSelector: React.FC<SupermarketSelectorProps> = ({
  location,
  onSupermarketSelect
}) => {
  const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
  const [selectedSupermarket, setSelectedSupermarket] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customApiForm, setCustomApiForm] = useState({
    name: '',
    apiEndpoint: '',
    apiKey: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favoriteSupermarkets');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    // Fetch available supermarkets from backend
    fetchSupermarkets();
  }, [location]);

  const fetchSupermarkets = async () => {
    try {
      const response = await fetch(`/api/supermarkets?lat=${location.lat}&lng=${location.lng}`);
      const data = await response.json();
      setSupermarkets(data);
    } catch (err) {
      setError('Failed to fetch supermarkets');
    }
  };

  const handleSupermarketChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string;
    setSelectedSupermarket(value);
    
    const selected = supermarkets.find(s => s.id === value);
    if (selected) {
      onSupermarketSelect(selected);
    }
  };

  const toggleFavorite = (supermarketId: string) => {
    const newFavorites = favorites.includes(supermarketId)
      ? favorites.filter(id => id !== supermarketId)
      : [...favorites, supermarketId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favoriteSupermarkets', JSON.stringify(newFavorites));
  };

  const handleCustomApiSubmit = async () => {
    try {
      const response = await fetch('/api/supermarkets/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customApiForm)
      });

      if (!response.ok) {
        throw new Error('Failed to add custom supermarket');
      }

      const newSupermarket = await response.json();
      setSupermarkets([...supermarkets, newSupermarket]);
      setCustomDialogOpen(false);
      setCustomApiForm({ name: '', apiEndpoint: '', apiKey: '' });
    } catch (err) {
      setError('Failed to add custom supermarket');
    }
  };

  const handleRemoveCustom = async (supermarketId: string) => {
    try {
      await fetch(`/api/supermarkets/custom/${supermarketId}`, {
        method: 'DELETE'
      });
      setSupermarkets(supermarkets.filter(s => s.id !== supermarketId));
    } catch (err) {
      setError('Failed to remove custom supermarket');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" gutterBottom>
          Select Supermarket
        </Typography>

        {favorites.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {favorites.map(id => {
              const supermarket = supermarkets.find(s => s.id === id);
              if (!supermarket) return null;
              return (
                <Chip
                  key={id}
                  label={supermarket.name}
                  onClick={() => {
                    setSelectedSupermarket(id);
                    onSupermarketSelect(supermarket);
                  }}
                  onDelete={() => toggleFavorite(id)}
                  color="primary"
                  variant="outlined"
                />
              );
            })}
          </Box>
        )}

        <FormControl fullWidth>
          <InputLabel>Choose a supermarket</InputLabel>
          <Select
            value={selectedSupermarket}
            onChange={handleSupermarketChange}
            label="Choose a supermarket"
          >
            {supermarkets.map(supermarket => (
              <MenuItem key={supermarket.id} value={supermarket.id}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  {supermarket.name}
                  <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(supermarket.id);
                      }}
                    >
                      <StarIcon
                        color={favorites.includes(supermarket.id) ? 'primary' : 'disabled'}
                      />
                    </IconButton>
                    {supermarket.apiEndpoint && (
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCustom(supermarket.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          startIcon={<AddIcon />}
          onClick={() => setCustomDialogOpen(true)}
          variant="outlined"
        >
          Add Custom Supermarket
        </Button>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Box>

      <Dialog open={customDialogOpen} onClose={() => setCustomDialogOpen(false)}>
        <DialogTitle>Add Custom Supermarket</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Supermarket Name"
              value={customApiForm.name}
              onChange={(e) => setCustomApiForm({ ...customApiForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="API Endpoint"
              value={customApiForm.apiEndpoint}
              onChange={(e) => setCustomApiForm({ ...customApiForm, apiEndpoint: e.target.value })}
              fullWidth
              helperText="Enter the base URL for the supermarket's API"
            />
            <TextField
              label="API Key"
              value={customApiForm.apiKey}
              onChange={(e) => setCustomApiForm({ ...customApiForm, apiKey: e.target.value })}
              fullWidth
              type="password"
              helperText="If required, enter the API key for authentication"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCustomApiSubmit} variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SupermarketSelector; 