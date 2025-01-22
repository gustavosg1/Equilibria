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
} from '@mui/material';
import { fetchLanguages } from '../../backend/services/languageService';
import { uploadProfilePhoto } from '../../backend/services/storageService';
import { updateUserProfile } from '../../backend/services/userService';
import { getAuth } from 'firebase/auth';

function EditarPerfilClient({ onPhotoUpdate }) {
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

      if (photo instanceof File) { // Verifica se é um arquivo novo
        downloadURL = await uploadProfilePhoto(photo, user.uid);
        userData.photoURL = downloadURL;
        setFoto(downloadURL); // Atualiza o estado local com a URL do Firebase
        if (onPhotoUpdate) onPhotoUpdate(downloadURL); // Passa a URL para o componente pai
      }

      if (name) userData.name = name;
      if (birthDate) userData.birthDate = birthDate;
      if (selectedLanguage) userData.preferredLanguage = selectedLanguage.code;

      await updateUserProfile(user.uid, userData);
      
      setShowModal(true);
      
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  return (
    <Grid item xs={12} md={10} lg={12}>
      <Box sx={{ p: 4, border: '1px solid #ccc', borderRadius: 2, boxShadow: 3, backgroundColor: 'white' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Editar Perfil
        </Typography>
  
          
          {/* Campo para nome */}
          <TextField
            label="Nome"
            fullWidth
            value={name}
            onChange={(e) => setNome(e.target.value)}
            margin="normal"
          />
  
          {/* Campo para data de nascimento */}
          <TextField
            label="Data de Nascimento"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={birthDate}
            onChange={(e) => setDataNascimento(e.target.value)}
            margin="normal"
          />
  
          {/* Campo para idioma preferido */}
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
                margin="normal"
              />
            )}
          />

          <br></br>

          <Box component="form" onSubmit={handleSubmit}>
          {/* Campo para upload de foto */}
            <Box textAlign="center" mb={2}>
              <Button variant="contained" component="label">
                Escolher Foto
                <input type="file" hidden onChange={handleFotoChange} />
              </Button>
              {photo && (
                <Avatar
                  src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                  sx={{ width: 100, height: 100, margin: 'auto', mt: 2 }}
                />
            )}
          </Box>
  
          {/* Botão de envio */}
          <Box mt={4} textAlign="center">
            <Button type="submit" variant="contained" color="primary">
              Salvar Alterações
            </Button>
          </Box>
        </Box>
      </Box>
  
      {/* Modal de confirmação */}
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
          <Typography variant="h6">Perfil atualizado com sucesso!</Typography>
          <Button onClick={() => setShowModal(false)} sx={{ mt: 2 }}>
            Fechar
          </Button>
        </Box>
      </Modal>
    </Grid>
  );
}

export default EditarPerfilClient;