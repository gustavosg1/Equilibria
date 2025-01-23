import React, { useEffect, useState } from 'react';
import { Box, Grid, Avatar, Button, Typography, Paper, styled } from '@mui/material';
import Menu from '../components/Menu';
import Welcome from '../views/Welcome';
import EditarPerfilClient from '../views/EditarPerfilClient';
import { useAuth } from '../../backend/config/Authentication';
import { fetchUserPhoto, getUserName } from '../../backend/services/userService'; // Adicionamos getUserName
import { FaUserEdit, FaHome } from "react-icons/fa";

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

function TestSpeech() {
  useEffect(() => {
    if ('SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;

      recognition.onstart = () => console.log('Teste: Reconhecimento iniciado');
      recognition.onresult = (e) => console.log('Teste:', e.results[0][0].transcript);
      recognition.start();

      return () => recognition.stop();
    }
  }, []);

  return <div>Teste de reconhecimento de fala (verifique o console)</div>;
}

function ProfilePageClient() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('welcome');
  const [photo, setPhoto] = useState('');
  const [name, setName] = useState(''); // Adicionamos o estado para o nome

  const handlePhotoUpdate = (newPhotoURL) => {
    setPhoto(newPhotoURL);
  };

  // Função para carregar o nome do usuário
  const loadUserName = async () => {
    if (user?.uid) {
      try {
        const userName = await getUserName(user.uid); // Busca o nome do Firestore
        setName(userName);
      } catch (error) {
        console.error('Erro ao carregar nome:', error.message);
      }
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
    loadUserName(); // Carrega o nome ao montar o componente
  }, [user]);

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
                Usuario Registrado
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
                variant={currentPage === 'editarPerfil' ? 'contained' : 'outlined'}
                color="success"
                startIcon={<FaUserEdit size={24} />}
                onClick={() => setCurrentPage('editarPerfil')}
                sx={{
                  '& .MuiButton-startIcon': { mr: 2 },
                  bgcolor: currentPage === 'editarPerfil' ? 'success.main' : 'transparent',
                  color: currentPage === 'editarPerfil' ? 'white' : 'text.primary'
                }}
              >
                Editar Perfil
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
            {currentPage === 'welcome' && <Welcome />}
            {currentPage === 'editarPerfil' && (
              <EditarPerfilClient 
                onPhotoUpdate={handlePhotoUpdate} 
                onNameUpdate={loadUserName} // Passamos a função para atualizar o nome
              />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfilePageClient;