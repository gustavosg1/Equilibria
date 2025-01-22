import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebase/FirebaseConfig';
import { doc, updateDoc, arrayUnion, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Modal,
  Grid,
  Paper,
} from '@mui/material';

const Review = ({ psychologistId }) => {
  const [rate, setRate] = useState(0);
  const [comment, setComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');
      if (!psychologistId) throw new Error('psychologistId não fornecido');

      const clientId = user.uid;
      const psychologistDocRef = doc(db, 'reviews', psychologistId);
      const psychologistDoc = await getDoc(psychologistDocRef);

      if (!psychologistDoc.exists()) {
        await setDoc(psychologistDocRef, {
          psychologistId,
          reviews: [],
        });
      }

      await updateDoc(psychologistDocRef, {
        reviews: arrayUnion({
          client: clientId,
          date: Timestamp.now(),
          rate,
          comment,
        }),
      });

      setShowModal(true);
    } catch (error) {
      console.error('Erro ao enviar a avaliação:', error);
    }
  };

  const handleNoReview = () => {
    navigate('/Perfil');
  };

  return (
    <Grid container spacing={3} sx={{ mt: 4, pl: 3 }}>
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 3, width: '100%', height: '100%' }}>
          <Typography variant="h5" align="center">
            Deixe sua avaliação
          </Typography>
          <Rating
            name="simple-controlled"
            value={rate}
            onChange={(event, newValue) => setRate(newValue)}
          />
          <TextField
            label="Comentário"
            multiline
            rows={4}
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 2, // Espaçamento entre os botões
              mt: 2,
            }}
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                backgroundColor: 'green',
                '&:hover': { backgroundColor: 'darkgreen' },
              }}
            >
              Enviar
            </Button>
            <Button
              variant="contained"
              onClick={handleNoReview}
              sx={{
                backgroundColor: 'green',
                '&:hover': { backgroundColor: 'darkgreen' },
              }}
            >
              NO QUIERO EVALUAR
            </Button>
          </Box>

          <Modal open={showModal} onClose={() => setShowModal(false)}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6">Sucesso</Typography>
              <Typography>Avaliação enviada com sucesso!</Typography>
              <Button
                onClick={() => {
                  setShowModal(false);
                  navigate('/Perfil');
                }}
                variant="contained"
                sx={{
                  mt: 2,
                  backgroundColor: 'green',
                  '&:hover': { backgroundColor: 'darkgreen' },
                }}
              >
                OK
              </Button>
            </Box>
          </Modal>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Review;