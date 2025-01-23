import React, { useEffect, useState } from 'react';
import { Box, Avatar, Button, Paper, Grid, Typography, styled } from '@mui/material';
import { useAuth } from '../../backend/config/Authentication';
import { fetchPsychologistData, fetchPsychologistProfile } from '../../backend/services/psychologistService'; // Adicionamos fetchPsychologistProfile
import Menu from '../components/Menu';
import Welcome from '../views/Welcome';
import PsychologistProfile from '../views/PsychologistProfile';
import EditarPerfilPsicolog from '../views/EditarPerfilPsicolog';
import FeedbackPsychologist from '../views/FeedbackPsychologist';
import { FaUserEdit, FaHome } from "react-icons/fa";
import { MdFeedback } from "react-icons/md";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '16px 24px',
  justifyContent: 'flex-start',
  transition: 'all 0.3s ease',
  marginBottom: '16px',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3]
  }
}));

function ProfilePagePsychologist() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('welcome');
  const [photo, setPhoto] = useState('');
  const [name, setName] = useState(''); // Adicionamos o estado para o nome

  const handlePhotoUpdate = (newPhotoURL) => {
    setPhoto(newPhotoURL);
  };

  // Função para carregar o nome do psicólogo
  const loadName = async () => {
    if (user?.uid) {
      try {
        const profileData = await fetchPsychologistProfile(user.uid); // Busca o nome do Firestore
        setName(profileData.name || '');
      } catch (error) {
        console.error('Erro ao carregar nome:', error.message);
      }
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (user?.uid) {
        try {
          const data = await fetchPsychologistData(user.uid);
          setPhoto(data.photoURL || '');
          setName(data.name || ''); // Carrega o nome ao montar o componente
        } catch (error) {
          console.error('Erro ao carregar dados:', error.message);
        }
      }
    };
    loadData();
  }, [user]);

  let view;
  switch(currentPage) {
    case 'welcome': view = <Welcome />; break;
    case 'perfil': view = <PsychologistProfile onSelect={setCurrentPage} />; break;
    case 'editarPerfil': view = <EditarPerfilPsicolog onPhotoUpdate={handlePhotoUpdate} onNameUpdate={loadName} />; break; // Passamos loadName como onNameUpdate
    case 'misResenas': view = <FeedbackPsychologist />; break;
    default: view = <Welcome />;
  }

  return (
    <Box sx={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Menu />
      <Grid container spacing={4} sx={{ p: 4 }}>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ 
            p: 3, 
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0px 8px 24px rgba(149, 157, 165, 0.2)'
          }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Avatar
                src={photo}
                alt="Foto do perfil"
                sx={{ 
                  width: 160, 
                  height: 160, 
                  mx: 'auto',
                  mb: 2,
                  border: '4px solid #2e7d32',
                  boxShadow: 3
                }}
              />
              <Typography variant="h6" sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 1
              }}>
                {name || 'Bienvenido'} {/* Usamos o nome do estado */}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Psicólogo Certificado
              </Typography>
            </Box>

            <Box>
              <StyledButton
                fullWidth
                variant={currentPage === 'welcome' ? 'contained' : 'outlined'}
                color="success"
                startIcon={<FaHome size={24} />}
                onClick={() => setCurrentPage('welcome')}
                sx={{
                  '& .MuiButton-startIcon': { mr: 2 },
                  bgcolor: currentPage === 'welcome' ? 'success.main' : 'transparent',
                  color: currentPage === 'welcome' ? 'white' : 'text.primary'
                }}
              >
                Inicio
              </StyledButton>

              <StyledButton
                fullWidth
                variant={currentPage === 'perfil' ? 'contained' : 'outlined'}
                color="success"
                startIcon={<FaUserEdit size={24} />}
                onClick={() => setCurrentPage('perfil')}
                sx={{
                  '& .MuiButton-startIcon': { mr: 2 },
                  bgcolor: currentPage === 'perfil' ? 'success.main' : 'transparent',
                  color: currentPage === 'perfil' ? 'white' : 'text.primary'
                }}
              >
                Mi Perfil
              </StyledButton>

              <StyledButton
                fullWidth
                variant={currentPage === 'misResenas' ? 'contained' : 'outlined'}
                color="success"
                startIcon={<MdFeedback size={24} />}
                onClick={() => setCurrentPage('misResenas')}
                sx={{
                  '& .MuiButton-startIcon': { mr: 2 },
                  bgcolor: currentPage === 'misResenas' ? 'success.main' : 'transparent',
                  color: currentPage === 'misResenas' ? 'white' : 'text.primary'
                }}
              >
                Reseñas
              </StyledButton>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper elevation={0} sx={{ 
            p: 4, 
            borderRadius: 4,
            minHeight: '80vh',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '0px 8px 24px rgba(149, 157, 165, 0.1)'
          }}>
            {view}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfilePagePsychologist;