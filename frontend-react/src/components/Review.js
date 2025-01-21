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
  Grid,
  Paper,
} from '@mui/material';

const Review = ({ psychologistId }) => { // Componente principal que recebe psychologistId como prop
  const [rate, setRate] = useState(0); // Estado para armazenar a nota dada pelo usuário
  const [comment, setComment] = useState(''); // Estado para armazenar o comentário do usuário
  const [showModal, setShowModal] = useState(false); // Estado para controlar a visibilidade do modal
  const navigate = useNavigate(); // Hook para redirecionar o usuário para outra página

  const handleSubmit = async () => { // Função para enviar a avaliação
    try {
      const user = auth.currentUser; // Obtém o usuário autenticado atual
      if (!user) throw new Error('Usuário não autenticado'); // Verifica se o usuário está autenticado
      if (!psychologistId) throw new Error('psychologistId não fornecido'); // Verifica se o psychologistId está presente

      const clientId = user.uid; // Obtém o ID do usuário autenticado

      // Referência ao documento do psicólogo na coleção "reviews"
      const psychologistDocRef = doc(db, 'reviews', psychologistId);

      // Verifica se o documento do psicólogo já existe no Firestore
      const psychologistDoc = await getDoc(psychologistDocRef);
      if (!psychologistDoc.exists()) { // Se não existe, cria com campos iniciais
        await setDoc(psychologistDocRef, {
          psychologistId, // ID do psicólogo
          reviews: [], // Inicializa o campo de avaliações como uma lista vazia
        });
      }

      // Atualiza o documento do psicólogo adicionando uma nova avaliação
      await updateDoc(psychologistDocRef, {
        reviews: arrayUnion({ // Usa arrayUnion para adicionar a avaliação sem sobrescrever as existentes
          client: clientId, // ID do cliente que deixa a avaliação
          date: Timestamp.now(), // Data atual
          rate, // Nota fornecida pelo usuário
          comment, // Comentário fornecido pelo usuário
        }),
      });

      // Exibe o modal de sucesso para o usuário
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao enviar a avaliação:', error); // Loga qualquer erro no console
    }
  };

  return (
    <Grid container spacing={3} sx={{ mt: 4, pl: 3 }}> {/* Adicionado layout de Grid para alinhamento */}
      <Grid item xs={12} md={8}> {/* Mantendo a largura semelhante ao PsychologistProfile */}
        <Paper elevation={3} sx={{ p: 3, width: '100%', height: '100%' }}> {/* Adicionando Paper para uniformidade */}
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
          <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
            Enviar
          </Button>

          {/* Modal para mostrar mensagem de sucesso */}
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
                sx={{ mt: 2 }}
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
