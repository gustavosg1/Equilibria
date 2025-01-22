import React, { useState, useEffect } from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  Chip,
  Button,
  Typography,
  Modal,
  Avatar,
  Grid,
  FormControl,
  FormLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import { getAuth } from 'firebase/auth';
import {
  fetchPsychologistProfile,
  updatePsychologistProfile,
  fetchAuxiliaryData,
} from '../../backend/services/psychologistService';

function EditarPerfilPsicolog({ onPhotoUpdate }) {
  const [name, setNome] = useState('');
  const [birthDate, setDataNascimento] = useState('');
  const [photo, setPhoto] = useState(null);
  const [description, setDescription] = useState('');
  const [studiesList, setStudiesList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [price, setPrice] = useState('');
  const [therapy, setTherapy] = useState([]);
  const [chosenLanguages, setChosenLanguages] = useState([]);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [hours, setHours] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nextId, setNextId] = useState(1);

  const auth = getAuth();
  const userId = auth.currentUser?.uid; // Obtém o userId do usuário autenticado

  const weekOrder = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado'];

  const handleFotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const addStudiesBox = () => {
    setStudiesList((prev) => [
      ...prev,
      { id: nextId, course: '', startDate: '', endDate: '', school: '' },
    ]);
    setNextId((prevId) => prevId + 1);
  };

  const handleStudyChange = (id, field, value) => {
    setStudiesList((prev) =>
      prev.map((study) => (study.id === id ? { ...study, [field]: value } : study))
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const userData = {
        name,
        birthDate,
        photoURL: photo instanceof File ? null : photo, // Se for um arquivo, o URL será gerado no service
        description,
        studies: studiesList,
        visible,
        price,
        therapy,
        chosenLanguages,
        availability,
      };

      await updatePsychologistProfile(userId, userData, photo); // Passa o userId aqui
      setShowModal(true);
      if (onPhotoUpdate) onPhotoUpdate();
    } catch (error) {
      console.error('Erro ao atualizar o perfil do usuário: ', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) return; // Se não houver userId, não faz nada
  
        const profileData = await fetchPsychologistProfile(userId); // Passa o userId aqui
        const auxiliaryData = await fetchAuxiliaryData();
  
        // Ordena os dias da semana de Domingo a Sábado
        const orderedDaysOfWeek = auxiliaryData.daysOfWeek.sort((a, b) => {
          return weekOrder.indexOf(a) - weekOrder.indexOf(b);
        });
  
        setNome(profileData.name || '');
        setDataNascimento(profileData.birthDate || '');
        setDescription(profileData.description || '');
        setPhoto(profileData.photoURL || null);
        setStudiesList(profileData.studies || []);
        setVisible(profileData.visible || false);
        setPrice(profileData.price || '');
        setTherapy(profileData.therapy || []);
        setChosenLanguages(profileData.chosenLanguages || []);
  
        const maxId = (profileData.studies || []).reduce((max, study) => Math.max(max, study.id), 0);
        setNextId(maxId + 1);
  
        setDaysOfWeek(orderedDaysOfWeek); // Usa os dias ordenados
        setHours(auxiliaryData.hours);
        setSpecialties(auxiliaryData.specialties);
        setLanguages(auxiliaryData.languages);
  
        const availabilityFromFirestore = profileData.availability || [];
        setAvailability(
          orderedDaysOfWeek.map((day) => {
            const dayData = availabilityFromFirestore.find((a) => a.day === day) || {};
            return {
              day,
              times: dayData.times || [],
            };
          })
        );
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };
  
    fetchData();
  }, [userId]); // Dependência do userId

  return (
    <Grid container style={{ minHeight: '100vh' }}>
      <Grid item xs={12} style={{ margin: '0 auto' }}>
        <Box
          sx={{
            p: 4,
            border: '1px solid #ccc',
            borderRadius: 2,
            boxShadow: 2,
            backgroundColor: 'white',
            width: '115%',
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            Editar Perfil
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <p style={{ paddingTop: '5px' }}> Perfil visible para clientes: {visible ? 'SÍ' : 'NO'}</p>
            <Switch
              checked={visible}
              onChange={(event) => setVisible(event.target.checked)}
              inputProps={{ 'aria-label': 'controlled' }}
              sx={{ textAlign: 'right' }}
            />
          </Box>

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

          <FormControl sx={{ mb: 2, width: '100%' }}>
            <Autocomplete
              multiple
              options={specialties || []}
              value={therapy || []}
              onChange={(event, value) => setTherapy(value)}
              getOptionLabel={(option) => (typeof option === 'string' ? option : option.name || '')}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={index}
                    label={typeof option === 'string' ? option : option.name || ''}
                    {...getTagProps({ index })}
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

          <FormControl sx={{ mb: 2, width: '100%' }}>
            <Autocomplete
              multiple
              options={languages || []}
              value={chosenLanguages || []}
              onChange={(event, value) => setChosenLanguages(value)}
              renderTags={(value = [], getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id || index}
                    label={option.name || option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Idiomas"
                  placeholder="Clique para escolher"
                />
              )}
            />
          </FormControl>

          <FormControl sx={{ mb: 2, display: 'flex', alignItems: 'flex-end' }}>
            <FormLabel>Precio por sesión</FormLabel>
            <TextField
              sx={{ width: '100px', textAlign: 'right' }}
              variant="outlined"
              margin="normal"
              value={price}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setPrice(value);
                }
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">,00Є</InputAdornment>,
                style: { textAlign: 'right' },
              }}
            />
          </FormControl>

          <FormLabel>Disponibilidad</FormLabel>
          <Box sx={{ border: '1px solid #C4C4C4', padding: '10px' }}>
            {daysOfWeek.map((day, index) => (
              <FormControl key={index} sx={{ mb: 2, width: '14.2%', padding: '10px' }}>
                <Autocomplete
                  multiple
                  options={hours || []}
                  value={availability[index]?.times || []}
                  onChange={(event, value) => {
                    setAvailability((prev) => {
                      const updated = [...(prev || [])];
                      if (!updated[index]) {
                        updated[index] = { day: daysOfWeek[index], times: [] };
                      }
                      updated[index].times = value;
                      return updated;
                    });
                  }}
                  renderTags={(value = [], getTagProps) =>
                    value.map((option, i) => (
                      <Chip
                        key={i}
                        label={option.name || option}
                        {...getTagProps({ index: i })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={day}
                      placeholder="Clique para escolher"
                    />
                  )}
                />
                <Button
                  variant="outlined"
                  sx={{ mt: 1 }}
                  onClick={() => {
                    setAvailability((prev) =>
                      prev.map((availabilityDay, idx) =>
                        idx === index
                          ? availabilityDay
                          : {
                              ...availabilityDay,
                              times: prev[index]?.times || [],
                            }
                      )
                    );
                  }}
                >
                  Copiar
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    mt: 1,
                    color: 'red',
                    borderColor: 'red',
                    '&:hover': {
                      backgroundColor: '#ffebeb',
                      borderColor: 'red',
                    },
                  }}
                  onClick={() => {
                    setAvailability((prev) => {
                      const updated = [...(prev || [])];
                      if (updated[index]) {
                        updated[index].times = [];
                      }
                      return updated;
                    });
                  }}
                >
                  Deletar
                </Button>
              </FormControl>
            ))}
          </Box>

          <br></br>
          <br></br>

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

          <br></br>

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

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="outlined" onClick={addStudiesBox} sx={{ mr: 2 }}>
              Adicionar Estudos{' '}
              <img src="/images/mas.png" style={{ width: '35px', height: '35px', marginLeft: '10px' }} />
            </Button>
          </Box>

          <br></br>
          <br></br>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Salvar
            </Button>
          </Box>
        </Box>
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