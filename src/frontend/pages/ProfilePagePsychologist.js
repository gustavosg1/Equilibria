import React, { useEffect, useState } from 'react';
import { Box, Avatar, Button, Paper, Grid } from '@mui/material';
import { useAuth } from '../../backend/config/Authentication';
import { fetchPsychologistData, updatePsychologistPhoto } from '../../backend/services/psychologistService';
import Menu from '../components/Menu';
import Welcome from '../views/Welcome';
import PsychologistProfile from '../views/PsychologistProfile';
import EditarPerfilPsicolog from '../views/EditarPerfilPsicolog';
import FeedbackPsychologist from '../views/FeedbackPsychologist';

function ProfilePagePsychologist() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('welcome');
  const [photo, setPhoto] = useState('');

  // Função para atualizar a foto usando o serviço
  const handlePhotoUpdate = async () => {
    try {
      if (user?.uid) {
        const updatedPhoto = await updatePsychologistPhoto(user.uid);
        setPhoto(updatedPhoto);
      }
    } catch (error) {
      console.error('Erro ao atualizar foto:', error);
    }
  };

  // Carrega os dados iniciais
  useEffect(() => {
    const loadData = async () => {
      if (user?.uid) {
        try {
          const data = await fetchPsychologistData(user.uid);
          setPhoto(data.photoURL || '');
        } catch (error) {
          console.error('Erro ao carregar dados:', error.message);
        }
      }
    };
    loadData();
  }, [user]);

  // Determina qual componente mostrar
  let view;
  switch(currentPage) {
    case 'welcome':
      view = <Welcome />;
      break;
    case 'perfil':
      view = <PsychologistProfile onSelect={setCurrentPage} />;
      break;
    case 'editarPerfil':
      view = <EditarPerfilPsicolog onPhotoUpdate={handlePhotoUpdate} />;
      break;
    case 'misResenas':
      view = <FeedbackPsychologist />;
      break;
    default:
      view = <Welcome />;
  }

  return (
    <Box>
      <Menu />
      <Grid container spacing={3} mt={4}>
        <Grid item xs={12} md={2.8}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={photo}
              alt="Foto do perfil"
              sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
            />
            <Box>
              <Button
                variant="contained"
                fullWidth
                color="success"
                sx={{ mb: 2 }}
                onClick={() => setCurrentPage('welcome')}
              >
                Home
              </Button>
              <Button
                variant="contained"
                fullWidth
                color="success"
                sx={{ mb: 2 }}
                onClick={() => setCurrentPage('perfil')}
              >
                Perfil
              </Button>
              <Button 
                variant="contained" 
                fullWidth 
                color="success"
                sx={{ mb: 2 }}
                onClick={() => setCurrentPage('misResenas')}
              >
                Mis Reseñas
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8} sx={{ pl: 3 }}>
          {view}
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfilePagePsychologist;