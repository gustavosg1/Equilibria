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
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function EditarPerfil({ onPhotoUpdate }) {
  const [name, setNome] = useState('');
  const [birthDate, setDataNascimento] = useState('');
  const [photo, setFoto] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const db = getFirestore();
  const auth = getAuth();
  const storage = getStorage();
  const userData = {};

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'idiomas'));
        const idiomas = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          code: doc.data().code,
          nombre: doc.data().nombre,
        }));
        setLanguages(idiomas);
      } catch (error) {
        console.error('Erro ao buscar idiomas:', error);
      }
    };

    fetchLanguages();
  }, [db]);

  const handleFotoChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;

        let downloadURL = null;
        if (photo) {
          const storageRef = ref(storage, `profile-pictures/${uid}/${photo.name}`);
          await uploadBytes(storageRef, photo);
          downloadURL = await getDownloadURL(storageRef);
        }

        if (name) userData.name = name;
        if (birthDate) userData.birthDate = birthDate;
        if (photo) userData.photoURL = downloadURL || null;
        if (selectedLanguage) userData.preferredLanguage = selectedLanguage.code;

        await setDoc(
          doc(db, 'users', uid),
          userData,
          { merge: true }
        );

        setShowModal(true);

        if (onPhotoUpdate) {
          onPhotoUpdate();
        }
      } else {
        console.error('Usuário não autenticado');
      }
    } catch (error) {
      console.error('Erro ao atualizar o perfil do usuário: ', error);
    }
  };

  return (
      <Grid item xs={12} md={10} lg={12}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 4,
            border: '1px solid #ccc',
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: 'white',
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            Editar Perfil
          </Typography>
          <TextField
            fullWidth
            label="Nome"
            variant="outlined"
            margin="normal"
            value={name}
            onChange={(e) => setNome(e.target.value)}
          />
          <TextField
            fullWidth
            label="Data de Nascimento"
            type="date"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            margin="normal"
            value={birthDate}
            onChange={(e) => setDataNascimento(e.target.value)}
          />
          <Autocomplete
            options={languages}
            getOptionLabel={(option) => option.nombre || ''}
            onChange={(e, value) => setSelectedLanguage(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Idioma Preferido"
                variant="outlined"
                margin="normal"
              />
            )}
            sx={{ mt: 2, mb: 3 }}
          />
          <Box mt={2} mb={3} textAlign="center">
            <Button variant="contained" component="label">
              Escolher Foto
              <input type="file" hidden onChange={handleFotoChange} />
            </Button>
            {photo && (
              <Box mt={2} textAlign="center">
                <Avatar
                  alt="Foto do Perfil"
                  src={URL.createObjectURL(photo)}
                  sx={{ width: 100, height: 100, margin: 'auto' }}
                />
              </Box>
            )}
          </Box>
          <Box textAlign="center">
            <Button type="submit" variant="contained" color="primary" sx={{ px: 5 }}>
              Salvar
            </Button>
          </Box>
        </Box>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="modal-sucesso-titulo"
        aria-describedby="modal-sucesso-descricao"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Typography id="modal-sucesso-titulo" variant="h6" component="h2">
            Éxito
          </Typography>
          <Typography id="modal-sucesso-descricao" sx={{ mt: 2 }}>
            Dados guardados com êxito!
          </Typography>
          <Box mt={3} textAlign="center">
            <Button
              variant="contained"
              onClick={() => {
                setShowModal(false);
                if (onPhotoUpdate) {
                  onPhotoUpdate();
                }
              }}
            >
              OK
            </Button>
          </Box>
        </Box>
      </Modal>
    </Grid>
  );
}

export default EditarPerfil;