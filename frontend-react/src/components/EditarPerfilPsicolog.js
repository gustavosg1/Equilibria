import React, { useState, memo, useCallback } from 'react';
import { Box, TextField, Button, Typography, Modal, Avatar, Grid, FormControl, FormLabel } from '@mui/material';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function EditarPerfilPsicolog({ onPhotoUpdate }) {
  const [name, setNome] = useState('');
  const [birthDate, setDataNascimento] = useState('');
  const [photo, setFoto] = useState(null);
  const [description, setDescription] = useState('');
  const [studiesList, setStudiesList] = useState([{ id: 1, course: '', startDate: '', endDate: '', school: '' }]);
  const [showModal, setShowModal] = useState(false);

  const db = getFirestore();
  const auth = getAuth();
  const storage = getStorage();
  const userData = {};

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
        if (description) userData.description = description;
        if (studiesList) userData.studies = studiesList;

        await setDoc(
          doc(db, 'psychologist', uid),
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

  const handleStudyChange = useCallback((id, field, value) => {
    setStudiesList((prevStudies) =>
      prevStudies.map((study) =>
        study.id === id ? { ...study, [field]: value } : study
      )
    );
  }, []);

  const addStudiesBox = () => {
    setStudiesList((prevStudies) => [
      ...prevStudies,
      { id: Date.now(), course: '', startDate: '', endDate: '', school: '' }
    ]);
  };

  const StudiesBox = memo(({ id, study, handleStudyChange }) => (
    <Box key={id} sx={{ marginTop: 2, border: '1px solid #ccc', padding: 2, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Estudo #{id}</Typography>
      <TextField
        fullWidth
        label="Curso"
        variant="outlined"
        margin="normal"
        value={study.course}
        onChange={(e) => handleStudyChange(id, 'course', e.target.value)}
      />
      <TextField
        fullWidth
        label="Data de Início"
        type="date"
        InputLabelProps={{ shrink: true }}
        variant="outlined"
        margin="normal"
        value={study.startDate}
        onChange={(e) => handleStudyChange(id, 'startDate', e.target.value)}
      />
      <TextField
        fullWidth
        label="Data de Conclusão"
        type="date"
        InputLabelProps={{ shrink: true }}
        variant="outlined"
        margin="normal"
        value={study.endDate}
        onChange={(e) => handleStudyChange(id, 'endDate', e.target.value)}
      />
      <TextField
        fullWidth
        label="Escola"
        variant="outlined"
        margin="normal"
        value={study.school}
        onChange={(e) => handleStudyChange(id, 'school', e.target.value)}
      />
    </Box>
  ));

  return (
    <Grid container style={{ minHeight: '100vh' }}>
      <Grid item xs={12} md={12} lg={12} style={{ width: '75vw' }}>
        <Box
          sx={{
            p: 4,
            border: '1px solid #ccc',
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: 'white',
          }}
        >
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Editar Perfil
          </Typography>

          <FormControl sx={{ width: '250px' }}>
            <TextField
              fullWidth
              label="Nombre"
              variant="outlined"
              margin="normal"
              value={name}
              onChange={(e) => setNome(e.target.value)}
            />
            <TextField
              fullWidth
              label="Fecha de Nacimiento"
              type="date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              margin="normal"
              value={birthDate}
              onChange={(e) => setDataNascimento(e.target.value)}
            />
          </FormControl>

          <br />
          <br />

          <FormControl fullWidth>
            <FormLabel> Escribe una descripción para que los clientes de conozcan!</FormLabel>
            <TextField
              fullWidth
              label="Descripción"
              variant="outlined"
              margin="normal"
              multiline
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormControl>

          <Box sx={{ padding: 4 }}>
            {studiesList.map((study) => (
              <StudiesBox key={study.id} id={study.id} study={study} handleStudyChange={handleStudyChange} />
            ))}

            <br />

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Button variant="outlined" onClick={addStudiesBox} style={{ display: 'flex', gap: '8px' }}>
                Adicionar Estudios <img src="/images/mas.png" alt="Icone-mas" style={{ width: '35px', height: '35px' }} />
              </Button>
            </div>
          </Box>

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
            <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
              Salvar
            </Button>
          </Box>
        </Box>
      </Grid>

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
          }}
        >
          <Typography id="modal-sucesso-titulo" variant="h6" component="h2">
            Éxito
          </Typography>
          <Typography id="modal-sucesso-descricao" sx={{ mt: 2 }}>
            Dados guardados com êxito
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

export default EditarPerfilPsicolog;