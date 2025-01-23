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
  CircularProgress, Container
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
    <Container 
      maxWidth="lg"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}
    >
      <Grid container justifyContent="center">
        <Grid item xs={12} md={8} lg={6}>
          <Paper elevation={3} sx={{ 
            p: 4,
            width: '100%',
            maxWidth: 800,
            mx: 'auto',
            position: 'relative'
          }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
              Como Fue tu Cita?
            </Typography>

            {error && (
              <Typography color="error" align="center" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Box sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3
            }}>
              <Rating
                name="review-rating"
                value={rate}
                onChange={(_, newValue) => setRate(newValue)}
                size="large"
                sx={{ fontSize: '2.5rem' }}
              />

              <TextField
                label="Comentario"
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                fullWidth
                variant="outlined"
              />

              <Box sx={{ 
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center',
                width: '100%',
                mt: 2
              }}>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: 'green',
                    minWidth: 200,
                    py: 1.5,
                    '&:hover': { bgcolor: 'darkgreen' }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Enviar Evaluación'}
                </Button>

                <Button
                  onClick={() => navigate('/Perfil')}
                  variant="outlined"
                  sx={{
                    borderColor: 'green',
                    color: 'green',
                    minWidth: 200,
                    py: 1.5
                  }}
                >
                  No Quiero Evaluar
                </Button>
              </Box>
            </Box>

            <SuccessModal />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Review;