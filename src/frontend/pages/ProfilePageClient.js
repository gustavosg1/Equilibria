import React, { useEffect, useState } from 'react';
import { Box, Grid, Avatar, Button, Typography, Paper } from '@mui/material';
import Menu from '../components/Menu';
import Welcome from '../views/Welcome';
import EditarPerfilClient from '../views/EditarPerfilClient';
import { useAuth } from '../../backend/config/Authentication';
import { fetchUserPhoto, updateUserPhoto } from '../../backend/services/userService';

function ProfilePageClient() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('welcome');
  const [photo, setPhoto] = useState('');

  const handlePhotoUpdate = async (newPhotoURL) => {
    try {
      setPhoto(newPhotoURL);
    } catch (error) {
      console.error('Erro na atualização:', error.message);
    }
  };

  useEffect(() => {
    const loadPhoto = async () => {
      if (user?.uid) {
        try {
          const photoURL = await fetchUserPhoto(user.uid);
          setPhoto(photoURL);
        } catch (error) {
          console.error('Erro ao carregar foto:', error.message);
        }
      }
    };
    loadPhoto();
  }, [user]);

  return (
    <Box>
      <Menu />
      
      <Grid container spacing={3} mt={4}>
        <Grid item xs={12} md={3}>
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
                onClick={() => {
                  console.log('Estado antes:', currentPage); // Debug
                  setCurrentPage('editarPerfil');
                  console.log('Estado depois:', currentPage); // Debug
                }}
              >
                Editar Perfil
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {currentPage === 'welcome' && <Welcome />}
          {currentPage === 'editarPerfil' && (
            <EditarPerfilClient onPhotoUpdate={handlePhotoUpdate} />
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfilePageClient;