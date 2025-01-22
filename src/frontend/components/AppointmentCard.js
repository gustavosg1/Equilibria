import React, { useEffect, useState } from 'react';
import { Card, CardMedia, Box, Typography } from '@mui/material';
import { getUserInfo } from '../../backend/services/userService'; // Função corrigida

const AppointmentCard = ({ appointment, isPsychologist }) => {
  const [otherUserInfo, setOtherUserInfo] = useState(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const otherUserId = isPsychologist 
          ? appointment.clientId 
          : appointment.psychologistId;
        
        // A função getUserInfo agora é totalmente responsável pelo acesso ao Firestore
        const info = await getUserInfo(otherUserId, isPsychologist ? 'users' : 'psychologist');
        setOtherUserInfo(info);
      } catch (error) {
        console.error('Erro ao carregar informações:', error);
      }
    };
    loadUserInfo();
  }, [appointment, isPsychologist]);

  return (
    <Card sx={{ display: 'flex', mb: 2, boxShadow: 3 }}>
      <CardMedia
        component="img"
        sx={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', m: 2 }}
        image={otherUserInfo?.photoURL || 'images/default.png'}
        alt={otherUserInfo?.name || 'Usuário'}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, p: 2 }}>
        <Typography variant="h6">
          <strong>{isPsychologist ? 'Cliente:' : 'Psicólogo:'}</strong> {otherUserInfo?.name || 'N/A'}
        </Typography>
        <Typography variant="body1"><strong>Fecha:</strong> {appointment.day}</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}><strong>Hora:</strong> {appointment.time}</Typography>
      </Box>
    </Card>
  );
};

export default AppointmentCard;