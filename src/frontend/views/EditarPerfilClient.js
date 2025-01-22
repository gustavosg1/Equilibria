import React, { useState, useEffect } from 'react';
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

      if (photo) {
        downloadURL = await uploadProfilePhoto(photo, user.uid);
        userData.photoURL = downloadURL;
      }

      if (name) userData.name = name;
      if (birthDate) userData.birthDate = birthDate;
      if (selectedLanguage) userData.preferredLanguage = selectedLanguage.code;

      await updateUserProfile(user.uid, userData);
      
      setShowModal(true);
      if (onPhotoUpdate) onPhotoUpdate();
      
    } catch (error) {
      console.error('Erro:', error.message);
    }
  };

  return (
    <Grid item xs={12} md={10} lg={12}>
      {/* ... (mantenha o mesmo JSX) ... */}
    </Grid>
  );
}

export default EditarPerfilClient;