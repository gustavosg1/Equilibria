import React, { useState, useEffect } from 'react';
import { Box, Autocomplete, TextField, Chip, Button, Typography, Modal, Avatar, Grid, FormControl, FormLabel, Switch, InputAdornment, } from '@mui/material';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function EditarPerfilPsicolog({ onPhotoUpdate }) {
  const [name, setNome] = useState('');
  const [birthDate, setDataNascimento] = useState('');
  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState('');
  const [studiesList, setStudiesList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [price, setPrice] = useState('');
  const [therapy, setTherapy] = useState([]);
 
  const [nextId, setNextId] = useState(1); 
  const [showModal, setShowModal] = useState(false);

  const [specialties, setSpecialties] = useState([])  

  const db = getFirestore();
  const auth = getAuth();
  const storage = getStorage();

  // Atualizar foto
  const handleFotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  // Adicionar novo box de estudo
  const addStudiesBox = () => {
    setStudiesList((prev) => [
      ...prev,
      { id: nextId, course: '', startDate: '', endDate: '', school: '' },
    ]);
    setNextId((prevId) => prevId + 1);
  };

  // Atualizar um campo específico do estudo
  const handleStudyChange = (id, field, value) => {
    setStudiesList((prev) =>
      prev.map((study) => (study.id === id ? { ...study, [field]: value } : study))
    );
  };

  // Salvar no Firestore
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

        const userData = {
          name,
          birthDate,
          photoURL: downloadURL || null,
          description,
          studies: studiesList,
          visible,
          price,
          therapy
        };

        await setDoc(doc(db, 'psychologist', uid), userData, { merge: true });
        setShowModal(true);
        if (onPhotoUpdate) onPhotoUpdate();
      } else {
        console.error('Usuário não autenticado');
      }
    } catch (error) {
      console.error('Erro ao atualizar o perfil do usuário: ', error);
    }
  };

  

  async function accessTherapies () {

    const therapiesCollection = collection(db, 'therapies');
    try {
      const snapshot = await getDocs(therapiesCollection);
      const therapies = snapshot.docs.map((doc) =>
        doc.data().name || "");
      
      setSpecialties(therapies);      
      
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    }
  }

  

  const getData = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        let userInfo ={}

        const docSnap = await getDoc(doc(db, 'psychologist', uid));
          if (docSnap.exists()){
            userInfo = docSnap.data()
            
            setNome(userInfo.name);
            setDataNascimento(userInfo.birthDate);
            setDescription(userInfo.description);
            setPhoto(userInfo.photoURL);
            setStudiesList(userInfo.studies);
            setVisible(userInfo.visible);
            setPrice(userInfo.price);
            setTherapy(userInfo.therapy);
            

          } else {
            console.error('Usuário no encontrado');
          }        
      }

      } catch (error) {
      console.error('Usuário no autenticado: ', error);
    }
  };

  useEffect(() => {
    getData();
    accessTherapies();
  }, []);

  
  return (
    <Grid container style={{ minHeight: '100vh' }}>
      <Grid item xs={12} style={{ width: '75vw' }}>
        <Box
          sx={{
            p: 4,
            border: '1px solid #ccc',
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: 'white',
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            Editar Perfil
          </Typography>

          <Box sx={{display: "flex", justifyContent: "flex-end",}}>
            <p  style={{ paddingTop: "5px"}}> Perfil visible para clientes: {visible ? 'SÍ' : 'NO'}</p>

            <Switch
              checked={visible}
              onChange={(event) => setVisible(event.target.checked) }
              inputProps={{ 'aria-label': 'controlled' }}
              sx={{ textAlign: "right"}}/>

          </Box>

          {/* Nome e Data de Nascimento */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              label="Nome"
              variant="outlined"
              value={name}
              onChange={(e) => setNome(e.target.value)}
              margin="normal"
            />
            <TextField
              label="Data de Nascimento"
              type="date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              value={birthDate}
              onChange={(e) => setDataNascimento(e.target.value)}
              margin="normal"
            />
          </FormControl>

          {/* Descrição */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              label="Descripción"
              multiline
              rows={3}
              variant="outlined"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
            />
          </FormControl>

          {/* Especilidades */}
          <FormControl sx={{ mb: 2,width: '100%' }}>
          <FormLabel></FormLabel>
          <Autocomplete
            multiple
            
            options={specialties || []} // Garante que specialties seja um array
            value={therapy || []} // Garante que therapy seja um array
            onChange={(event, value) => setTherapy(value)} // Atualiza as seleções
            getOptionLabel={(option) => option.name || option} // Suporta array de strings ou objetos
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option.id || option}
                  label={option.name || option}
                  {...getTagProps({ index })}
                  onDelete={() => {
                    const newOptions = therapy.filter((item) => item !== option);
                    setTherapy(newOptions);
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Especialidades"
                placeholder="Clique para escolher"
              />
            )}
          />
        </FormControl>

          {/* Precio */}
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>Precio por sesión</FormLabel>
            <TextField
              sx={{width:"100px", textAlign:"right"}}
              variant="outlined"
              margin="normal"
              value={price}
              onChange={(e) =>{
                const value = e.target.value
                if (/^\d*$/.test(value)) {
                setPrice(value)}
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">,00Є</InputAdornment>, // Adiciona ",00" fixo
                style: { textAlign: "right" }, // Alinha o texto à direita
              }}
            />
          </FormControl>



          {/* Foto */}
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

          {/* Estudos */}
          {studiesList.map((study) => (
            <Box key={study.id} sx={{ border: '1px solid gray', borderRadius: 2, p: 2, mb: 2 }}>
              <Typography variant="h6">Estudo #{study.id}</Typography>
              <TextField
                fullWidth
                label="Curso"
                value={study.course}
                onChange={(e) => handleStudyChange(study.id, 'course', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Data de Início"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={study.startDate}
                onChange={(e) => handleStudyChange(study.id, 'startDate', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Data de Conclusão"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={study.endDate}
                onChange={(e) => handleStudyChange(study.id, 'endDate', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Escola"
                value={study.school}
                onChange={(e) => handleStudyChange(study.id, 'school', e.target.value)}
                margin="normal"
              />
            </Box>
          ))}

            <br></br>

          <Box sx={{display: "flex", justifyContent: "center" }}>
            <Button variant="outlined" onClick={addStudiesBox} sx={{ mr: 2 }}>
              Adicionar Estudos <img src="/images/mas.png" style={{width: "35px", height: "35px", marginLeft: "10px"}}/>
            </Button>
          </Box>

            <br></br>
            <br></br>
          
          <Box sx={{display: "flex", justifyContent: "center" }}>

            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Salvar
            </Button>
          </Box>
        </Box>
      </Grid>

      {/* Modal */}
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
          <Typography variant="h6">Éxito</Typography>
          <Typography>Dados guardados com sucesso!</Typography>
          <Button onClick={() => setShowModal(false)} variant="contained" sx={{ mt: 2 }}>
            OK
          </Button>
        </Box>
      </Modal>
    </Grid>
  );
}

export default EditarPerfilPsicolog;