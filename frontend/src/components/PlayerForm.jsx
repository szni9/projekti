import React, { useState } from 'react';
import { TextField, Button, Box } from '@mui/material';

function PlayerForm({ addPlayer }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      addPlayer(name.trim());
      setName('');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}
    >
      <TextField
        label="Nimi"
        variant="outlined"
        size="small"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
      />
      <Button type="submit" variant="contained" color="primary">
        Lisää Pelaaja
      </Button>
    </Box>
  );
}

export default PlayerForm;