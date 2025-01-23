import React, { useState, useEffect } from 'react';
import { Card, CardMedia, Box, Typography, Chip, CardContent } from '@mui/material';
import { fetchPsychologistReviews } from '../../backend/services/psychologistService';

const PsychologistCard = ({ psychologist, averageRate, reviewCount, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{ display: 'flex', mb: 2, p: 2, boxShadow: 3, width: '100%', position: 'relative' }}
    >
      <CardMedia
        component="img"
        sx={{ width: 150, height: 150, borderRadius: '50%' }}
        image={psychologist.photoURL}
        alt={psychologist.name}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, ml: 2 }}>
        <CardContent>
          <Typography variant="h6" component="div">
            {psychologist.name}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            COP:{psychologist.licenceNumber}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {psychologist.description}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {psychologist.therapy?.map((specialty, index) => (
              <Chip key={index} label={specialty} />
            ))}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {psychologist.chosenLanguages?.map((language, index) => (
              <Chip key={index} label={language} />
            ))}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {psychologist.studies?.map((studies, index) => (
              <Chip key={index} label={`${studies.course}: ${studies.school}`} />
            ))}
          </Box>
          <Typography variant="body1" fontWeight="bold" sx={{ mt: 2 }}>
            €{psychologist.price}.00/h
          </Typography>
        </CardContent>
      </Box>

      {/* Seção inferior direita para nota, estrelas e reviews */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          textAlign: 'right',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 0.5,
        }}
      >
        {/* Nota */}
        <Typography variant="caption" color="textSecondary">
          Nota: {averageRate.toFixed(1)}
        </Typography>

        {/* Estrelas */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {[...Array(5)].map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 20,
                height: 20,
                backgroundColor: index < Math.round(averageRate) ? '#ffc107' : '#e0e0e0',
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              }}
            />
          ))}
        </Box>

        {/* Número de reviews */}
        <Typography variant="caption" color="textSecondary">
          Reviews: {reviewCount}
        </Typography>
      </Box>
    </Card>
  );
};

export default PsychologistCard;