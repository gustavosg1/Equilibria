import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase/FirebaseConfig';
import { doc, updateDoc, arrayUnion, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import {
  Box,
  Typography,
  TextField,
  Button,
  Rating,
  Modal,
} from '@mui/material';

const Review = ({ psychologistId }) => {
  const [rate, setRate] = useState(0);
  const [comment, setComment] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');
      if (!psychologistId) throw new Error('psychologistId no proporcionado');
  
      const clientId = user.uid;
  
      // Documento do psicólogo dentro da coleção "reviews"
      const psychologistDocRef = doc(db, 'reviews', psychologistId);
  
      // Verifica se o documento do psicólogo já existe
      const psychologistDoc = await getDoc(psychologistDocRef);
      if (!psychologistDoc.exists()) {
        // Se não existir, cria o documento inicial
        await setDoc(psychologistDocRef, {
          psychologistId,
          reviews: [], // Inicializa o campo de avaliações como uma lista vazia
        });
      }
  
      // Adiciona a nova avaliação no campo "reviews" usando arrayUnion
      await updateDoc(psychologistDocRef, {
        reviews: arrayUnion({
          client: clientId,
          date: Timestamp.now(),
          rate,
          comment,
        }),
      });
  
      // Exibe o modal de sucesso
      setShowModal(true);
    } catch (error) {
      console.error('Error al enviar la reseña:', error);
    }
  };

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
        Deja tu reseña
      </Typography>
      <Rating
        name="simple-controlled"
        value={rate}
        onChange={(event, newValue) => setRate(newValue)}
      />
      <TextField
        label="Comentario"
        multiline
        rows={4}
        variant="outlined"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Enviar
      </Button>

      {/* Modal de sucesso */}
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
          <Typography variant="h6">Éxito</Typography>
          <Typography>¡Reseña enviada con éxito!</Typography>
          <Button
            onClick={() => {
              setShowModal(false);
              navigate('/Perfil'); // Redireciona para a página "/home"
            }}
            variant="contained"
            sx={{ mt: 2 }}
          >
            OK
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default Review;