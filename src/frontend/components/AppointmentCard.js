import React, { useEffect, useState } from 'react';
import { Card, CardMedia, Box, Typography, Button, Chip, CardContent } from '@mui/material';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../backend/config/FirebaseConfig';
import { CiTextAlignCenter } from "react-icons/ci";
import { Padding } from '@mui/icons-material';

const AppointmentCard = ({ 
  appointment,
  isPsychologist, 
  onStartCall, 
  onCancel, 
  onViewSummary
}) => {
  const [otherUserInfo, setOtherUserInfo] = useState(null);

  // Buscar informações do outro usuário
  useEffect(() => {
    const fetchOtherUser = async () => {
      const otherUserId = isPsychologist ? appointment.clientId : appointment.psychologistId;
      const collectionName = isPsychologist ? 'users' : 'psychologist';
      
      try {
        const docSnap = await getDoc(doc(db, collectionName, otherUserId));
        setOtherUserInfo(docSnap.exists() ? docSnap.data() : null);
      } catch (error) {
        console.error('Erro ao buscar informações:', error);
      }
    };
    
    if (appointment) fetchOtherUser();
  }, [appointment, isPsychologist]);

  return (
    <Card sx={{ display: 'flex', mb: 2, boxShadow: 3 }}>
      <CardMedia
        component="img"
        sx={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', m: 2 }}
        image={otherUserInfo?.photoURL || '/images/default.png'}
        alt={otherUserInfo?.name || 'Usuário'}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, p: 2 }}>
        <Typography variant="h6">
          <strong>{isPsychologist ? 'Cliente: ' : 'Psicólogo: '}</strong> 
          {otherUserInfo?.name || 'N/A'}
        </Typography>
        <Typography variant="body1"><strong>Fecha:</strong> {appointment.day}</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}><strong>Hora:</strong> {appointment.time}</Typography>

        {appointment.active ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" color="success" onClick={onStartCall}>
              Empezar Videoconferencia
            </Button>
            <Button variant="outlined" color="error" onClick={onCancel}>
              Anular
            </Button>
          </Box>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', // Alinha o ícone à direita
              alignItems: 'center',      // Centraliza verticalmente
              height: '100%',            // Garante que o Box ocupe toda a altura
              cursor: 'pointer',         // Adiciona cursor pointer para indicar que é clicável
              paddingRight: '40px',
              marginTop: '-10%',
            }}
            onClick={onViewSummary}
          >
            <CiTextAlignCenter size={60} />
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default AppointmentCard;