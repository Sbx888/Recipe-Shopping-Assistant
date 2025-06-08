import React, { useState } from 'react';
import { TextField, Select, MenuItem, FormControl, InputLabel, Paper, Box } from '@mui/material';

interface PostcodeInputProps {
  onPostcodeSubmit: (postcode: string) => void;
  onSupermarketSelect: (supermarket: string) => void;
}

const PostcodeInput: React.FC<PostcodeInputProps> = ({ onPostcodeSubmit, onSupermarketSelect }) => {
  const [postcode, setPostcode] = useState('');
  const [supermarket, setSupermarket] = useState('');

  const supermarkets = [
    'Tesco',
    'Sainsbury\'s',
    'ASDA',
    'Morrisons',
    'Waitrose'
  ];

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPostcode = e.target.value;
    setPostcode(newPostcode);
    if (newPostcode.length >= 5) {
      onPostcodeSubmit(newPostcode);
    }
  };

  const handleSupermarketChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const selected = e.target.value as string;
    setSupermarket(selected);
    onSupermarketSelect(selected);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          label="Postcode"
          variant="outlined"
          value={postcode}
          onChange={handlePostcodeChange}
          placeholder="Enter postcode..."
        />
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Select Supermarket</InputLabel>
          <Select
            value={supermarket}
            onChange={handleSupermarketChange}
            label="Select Supermarket"
          >
            {supermarkets.map((store) => (
              <MenuItem key={store} value={store}>
                {store}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default PostcodeInput; 