import React, { useState } from 'react';
import { TextField, Button, Box, Paper } from '@mui/material';

interface RecipeInputProps {
  onSubmit: (url: string) => void;
}

const RecipeInput: React.FC<RecipeInputProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
      setUrl('');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            label="Recipe URL"
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste recipe URL here..."
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!url.trim()}
          >
            Add Recipe
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default RecipeInput; 