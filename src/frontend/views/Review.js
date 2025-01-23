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
  CircularProgress,
  Container,
  styled
} from '@mui/material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: theme.shadows[4],
  maxWidth: 800,
  margin: 'auto',
  position: 'relative'
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1.5),
  minWidth: 200,
  fontSize: '1rem',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3]
  }
}));

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
        borderRadius: 3,
        textAlign: 'center',
        minWidth: 300
      }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          ¡Gracias por tu Evaluación!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Tu opinión es muy importante para nosotros.
        </Typography>
        <StyledButton
          onClick={() => {
            setShowModal(false);
            navigate('/Perfil');
          }}
          variant="contained"
          sx={{ 
            bgcolor: 'success.main',
            '&:hover': { bgcolor: 'success.dark' }
          }}
        >
          OK
        </StyledButton>
      </Box>
    </Modal>
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
          <StyledPaper elevation={0}>
            <Typography variant="h4" align="center" gutterBottom sx={{ 
              fontWeight: 700,
              mb: 3,
              background: 'linear-gradient(45deg, #2e7d32 30%, #388e3c 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ¿Cómo fue tu cita?
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
                sx={{ fontSize: '3rem', color: 'success.main' }}
              />

              <TextField
                label="Comentario"
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px'
                  }
                }}
              />

              <Box sx={{ 
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center',
                width: '100%',
                mt: 2
              }}>
                <StyledButton
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={loading}
                  sx={{ 
                    bgcolor: 'success.main',
                    '&:hover': { bgcolor: 'success.dark' }
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Enviar Evaluación'}
                </StyledButton>

                <StyledButton
                  onClick={() => navigate('/Perfil')}
                  variant="outlined"
                  sx={{ 
                    borderColor: 'success.main',
                    color: 'success.main',
                    '&:hover': { 
                      borderColor: 'success.dark',
                      color: 'success.dark'
                    }
                  }}
                >
                  No Quiero Evaluar
                </StyledButton>
              </Box>
            </Box>

            <SuccessModal />
          </StyledPaper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Review;