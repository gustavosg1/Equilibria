import React from 'react';
import { Box, Typography } from '@mui/material';

const Summary = ({ roomId }) => {
  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: 'auto',
        padding: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h5" align="center">
        Resumen de la Sesión
      </Typography>
      <Typography>
        Aquí se mostrarán los detalles de la sesión con ID: {roomId}
      </Typography>
    </Box>
  );
};

export default Summary;