import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { LoadScript, Autocomplete } from '@react-google-maps/api';

interface LocationSelectorProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
    postcode: string;
  }) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({ onLocationSelect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [manualPostcode, setManualPostcode] = useState('');

  // Try to get location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      const location = JSON.parse(savedLocation);
      onLocationSelect(location);
    }
  }, []);

  const handleAutoDetect = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`
          );
          const data = await response.json();
          
          if (data.results[0]) {
            const address = data.results[0].formatted_address;
            const postcode = data.results[0].address_components.find(
              (component: any) => component.types.includes('postal_code')
            )?.long_name || '';

            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address,
              postcode
            };

            localStorage.setItem('userLocation', JSON.stringify(location));
            onLocationSelect(location);
          }
        } catch (err) {
          setError('Failed to get address from coordinates');
        }
        setLoading(false);
      },
      (err) => {
        setError('Failed to get your location: ' + err.message);
        setLoading(false);
      }
    );
  };

  const handlePlaceSelect = () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    if (!place.geometry) return;

    const postcode = place.address_components?.find(
      (component) => component.types.includes('postal_code')
    )?.long_name || '';

    const location = {
      lat: place.geometry.location?.lat() || 0,
      lng: place.geometry.location?.lng() || 0,
      address: place.formatted_address || '',
      postcode
    };

    localStorage.setItem('userLocation', JSON.stringify(location));
    onLocationSelect(location);
  };

  const handleManualPostcodeSubmit = async () => {
    if (!manualPostcode) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${manualPostcode}&key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}`
      );
      const data = await response.json();

      if (data.results[0]) {
        const location = {
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng,
          address: data.results[0].formatted_address,
          postcode: manualPostcode
        };

        localStorage.setItem('userLocation', JSON.stringify(location));
        onLocationSelect(location);
      } else {
        setError('Invalid postcode');
      }
    } catch (err) {
      setError('Failed to get location from postcode');
    }

    setLoading(false);
  };

  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_KEY || ''}
      libraries={['places']}
    >
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Select Your Location
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleAutoDetect}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            Auto-detect my location
          </Button>

          <Typography variant="subtitle2" sx={{ mt: 2 }}>
            Or enter location manually:
          </Typography>

          <Autocomplete
            onLoad={setAutocomplete}
            onPlaceChanged={handlePlaceSelect}
          >
            <TextField
              fullWidth
              placeholder="Search for your address"
              variant="outlined"
            />
          </Autocomplete>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Postcode"
              variant="outlined"
              value={manualPostcode}
              onChange={(e) => setManualPostcode(e.target.value)}
              placeholder="Enter postcode..."
            />
            <Button
              variant="contained"
              onClick={handleManualPostcodeSubmit}
              disabled={!manualPostcode || loading}
            >
              Submit
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </Paper>
    </LoadScript>
  );
};

export default LocationSelector; 