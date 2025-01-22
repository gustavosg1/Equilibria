import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../backend/config/FirebaseConfig';
import { submitReview } from '../../backend/services/reviewService';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Modal,
  Grid,
  Paper,
  CircularProgress
} from '@mui/material';

const Review = ({ psychologistId }) => {
  const [rate, setRate] = useState(0);
  const [comment, setComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!auth.currentUser) throw new Error('Usuário não autenticado');
      if (!psychologistId) throw new Error('Psicólogo não identificado');

      const success = await submitReview(psychologistId, {
        client: auth.currentUser.uid,
        rate,
        comment
      });

      if (success) setShowModal(true);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const SuccessModal = () => (
    <Modal open={showModal} onClose={() => setShowModal(false)}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        textAlign: 'center',
        minWidth: 300
      }}>
        <Typography variant="h6" gutterBottom>Sucesso!</Typography>
        <Typography>Avaliação enviada com sucesso!</Typography>
        <Button
          onClick={() => {
            setShowModal(false);
            navigate('/Perfil');
          }}
          variant="contained"
          sx={{ mt: 2, bgcolor: 'green', '&:hover': { bgcolor: 'darkgreen' } }}
        >
          OK
        </Button>
      </Box>
    </Modal>
  );

  const ActionButton = ({ onClick, text }) => (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={loading}
      sx={{
        bgcolor: 'green',
        '&:hover': { bgcolor: 'darkgreen' },
        minWidth: 200
      }}
    >
      {loading ? <CircularProgress size={24} color="inherit" /> : text}
    </Button>
  );

  return (
    <Grid container spacing={3} sx={{ mt: 4, pl: 3 }}>
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
          <Typography variant="h5" align="center" gutterBottom>
            Deixe sua avaliação
          </Typography>

          {error && (
            <Typography color="error" textAlign="center" mb={2}>
              {error}
            </Typography>
          )}

          <Box display="flex" justifyContent="center" mb={2}>
            <Rating
              name="review-rating"
              value={rate}
              onChange={(_, newValue) => setRate(newValue)}
              size="large"
            />
          </Box>

          <TextField
            label="Comentário"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ mb: 3 }}
          />

          <Box display="flex" justifyContent="center" gap={2}>
            <ActionButton 
              onClick={handleSubmit} 
              text="Enviar Avaliação" 
            />
            <ActionButton 
              onClick={() => navigate('/Perfil')} 
              text="Não Quero Avaliar" 
            />
          </Box>

          <SuccessModal />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Review;