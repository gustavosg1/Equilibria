import React, { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../backend/config/FirebaseConfig'; 
import {
  Box,
  TextField,
  Button,
  Typography,
  Modal,
  Avatar,
  Grid,
  Autocomplete,
  Paper,
  styled
} from '@mui/material';
import { fetchLanguages } from '../../backend/services/languageService';
import { uploadProfilePhoto } from '../../backend/services/storageService';
import { updateUserProfile } from '../../backend/services/userService';
import { getAuth } from 'firebase/auth';

function EditarPerfilClient({ onPhotoUpdate, onNameUpdate }) { // Adicionamos onNameUpdate
  const [name, setNome] = useState('');
  const [birthDate, setDataNascimento] = useState('');
  const [photo, setFoto] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const idiomas = await fetchLanguages();
        setLanguages(idiomas);
      } catch (error) {
        console.error(error.message);
      }
    };
    loadLanguages();
  }, []);

  useEffect(() => {
    if (auth.currentUser?.uid) {
      const loadCurrentPhoto = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            setFoto(userDoc.data().photoURL || null);
            setNome(userDoc.data().name || ''); // Carrega o nome do Firestore
          }
        } catch (error) {
          console.error('Erro ao carregar foto:', error.message);
        }
      };
      loadCurrentPhoto();
    }
  }, [auth.currentUser?.uid]);

  const handleFotoChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuário não autenticado');

      const userData = {};
      let downloadURL = null;

      if (photo instanceof File) {
        downloadURL = await uploadProfilePhoto(photo, user.uid);
        userData.photoURL = downloadURL;
        setFoto(downloadURL);
        if (onPhotoUpdate) onPhotoUpdate(downloadURL);
      }

      if (name) userData.name = name;
      if (birthDate) userData.birthDate = birthDate;
      if (selectedLanguage) userData.preferredLanguage = selectedLanguage.code;

      await updateUserProfile(user.uid, userData);
      setShowModal(true);
      if (onNameUpdate) onNameUpdate(); // Notifica o componente pai para atualizar o nome
      
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    padding: '16px 24px',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: theme.shadows[3]
    }
  }));

  return (
    <Grid container style={{ minHeight: '100vh' }}>
      <Grid item xs={12} style={{ margin: '0 auto' }}>
        <Paper elevation={3} sx={{ 
          p: 4,
          border: '1px solid #ccc',
          borderRadius: 2,
          boxShadow: 2,
          backgroundColor: 'white',
          width: '100%',
        }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2e7d32 30%, #388e3c 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            mb: 4
          }}>
            Editar Perfil
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre"
                variant="outlined"
                value={name}
                onChange={(e) => setNome(e.target.value)}
                margin="normal"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                value={birthDate}
                onChange={(e) => setDataNascimento(e.target.value)}
                margin="normal"
                sx={{ mb: 2 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={languages}
                getOptionLabel={(option) => option.nombre}
                value={selectedLanguage}
                onChange={(_, newValue) => setSelectedLanguage(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Idioma Preferido"
                    fullWidth
                    variant="outlined"
                    margin="normal"
                  />
                )}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>

          <Box textAlign="center" mb={4}>
            <Button 
              variant="outlined" 
              component="label" 
              sx={{ 
                borderColor: 'success.main',
                color: 'success.main',
                backgroundColor: 'white',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                },
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderRadius: '12px',
                textTransform: 'none'
              }}
            >
              SUBIR FOTO
              <input type="file" hidden onChange={handleFotoChange} />
            </Button>
            {photo && (
              <Avatar
                src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                sx={{ 
                  width: 150, 
                  height: 150, 
                  margin: 'auto', 
                  mt: 3,
                }}
              />
            )}
          </Box>

          <Box textAlign="center" mt={4}>
            <Button 
              variant="outlined" 
              component="label" 
              onClick={handleSubmit}
              sx={{ 
                borderColor: 'success.main',
                color: 'success.main',
                backgroundColor: 'white',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 3
                },
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                borderRadius: '12px',
                textTransform: 'none'
              }}
            >
              GUARDAR CAMBIOS
            </Button>
          </Box>
        </Paper>
      </Grid>

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
            borderRadius: 2,
            textAlign: 'center',
            minWidth: 300
          }}
        >
          <Typography variant="h6" gutterBottom>Éxito</Typography>
          <Typography>Datos guardados con éxito!</Typography>
          <Button 
            onClick={() => setShowModal(false)}
            variant="contained"
            sx={{
              mt: 2,
              bgcolor: 'green',
              '&:hover': { bgcolor: 'darkgreen' },
              px: 4
            }}
          >
            OK
          </Button>
        </Box>
      </Modal>
    </Grid>
  );
}

export default EditarPerfilClient;