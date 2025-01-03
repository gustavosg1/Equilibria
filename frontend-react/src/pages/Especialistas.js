import React, {useState, useEffect} from 'react';
import { AppBar, Toolbar, TextField, MenuItem, Select, Box, Card, CardContent, CardMedia, Typography, Grid, Container } from '@mui/material';
import Menu from '../components/Menu';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

function Especialistas(){

  const [psychologists, setPsychologists] = useState([]);
  const db = getFirestore();

  const psychologistCollection = collection(db, 'psychologist');

  useEffect(() => {

    async function goThroughData(){
      try {
        const snapshot = await getDocs(psychologistCollection);
        const filteredPsychologists = [];
      
        snapshot.forEach((doc) => {
          if (doc.data().hasOwnProperty('visible') && doc.data().visible === true) {
            filteredPsychologists.push({ id: doc.id, ...doc.data() });
          }
        });

        console.log(filteredPsychologists);
      
        setPsychologists(filteredPsychologists);
        
      } catch (error) {
        console.error('Erro ao buscar documentos:', error);
      }
    }
  
  goThroughData();
  },[]);

  

  // Card do psicólogo
  const PsychologistCard = ({ psychologist }) => (
    <Card sx={{ display: 'flex', mb: 2, p: 2, boxShadow: 3, width: '100%'  }}>
      <CardMedia
        component="img"
        sx={{ width: 150, height: 150, borderRadius: '50%' }}
        image={psychologist.photoURL}
        alt={psychologist.name}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>
        <CardContent>
          <Typography variant="h6" component="div">
            {psychologist.name}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            {psychologist.licenceNumber}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {psychologist.description}
          </Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ mt: 2 }}>
            ${psychologist.price}.00/h
          </Typography>
        </CardContent>
      </Box>
    </Card>
  );

  return (
    <Box>
      {/* Menu */}
      <Menu />

      {/* Container Principal */}
      <Container sx={{ mt: 4 }}>
        {/* Campo de busca e filtros */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          <TextField
            placeholder="Buscar..."
            variant="outlined"
            fullWidth
            sx={{ backgroundColor: 'white' }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Select defaultValue="Precio" variant="outlined" size="small">
              <MenuItem value="Precio">Precio</MenuItem>
              {/* Adicione mais opções */}
            </Select>
            <Select defaultValue="Especialidad" variant="outlined" size="small">
              <MenuItem value="Especialidad">Especialidad</MenuItem>
              {/* Adicione mais opções */}
            </Select>
            <Select defaultValue="Idioma" variant="outlined" size="small">
              <MenuItem value="Idioma">Idioma</MenuItem>
              {/* Adicione mais opções */}
            </Select>
          </Box>
        </Box>

        {/* Lista de psicólogos */}
        <Grid container spacing={3}>
          {psychologists.map((psychologist) => (
            <Grid item xs={12} md={12} key={psychologist.id}>
              <PsychologistCard psychologist={psychologist} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Especialistas;

