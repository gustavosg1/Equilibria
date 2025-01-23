import React, { useState, useEffect } from 'react';
import { Slider, TextField, MenuItem, Box, Card, CardContent, CardMedia, Typography, Grid, Container, Select, Chip } from '@mui/material';
import Menu from '../components/Menu';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import Agenda from '../components/Agenda';
import { fetchPsychologistReviews } from '../../backend/services/psychologistService';

function Especialistas() {
  const [psychologists, setPsychologists] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [specialties, setSpecialties] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [searchName, setSearchName] = useState('');
  const [reviews, setReviews] = useState({}); // Armazena as avaliações dos psicólogos

  const [open, setOpen] = useState(false);
  const [psychologistId, setPsychologistId] = useState(null);

  const db = getFirestore();

  // Busca psicólogos, especialidades e idiomas
  useEffect(() => {
    const fetchPsychologists = async () => {
      const psychologistCollection = collection(db, 'psychologist');
      try {
        const snapshot = await getDocs(psychologistCollection);
        const filteredPsychologists = [];
        snapshot.forEach((doc) => {
          if (doc.data().hasOwnProperty('visible') && doc.data().visible === true) {
            filteredPsychologists.push({ id: doc.id, ...doc.data() });
          }
        });
        setPsychologists(filteredPsychologists);
      } catch (error) {
        console.error('Erro ao buscar psicólogos:', error);
      }
    };

    const fetchSpecialties = async () => {
      const therapiesCollection = collection(db, 'therapies');
      try {
        const snapshot = await getDocs(therapiesCollection);
        const specialtiesList = snapshot.docs.map((doc) => doc.data().name).filter(Boolean);
        setSpecialties(specialtiesList);
      } catch (error) {
        console.error('Erro ao buscar especialidades:', error);
      }
    };

    const fetchLanguages = async () => {
      const languageCollection = collection(db, 'idiomas');
      try {
        const snapshot = await getDocs(languageCollection);
        const languagesList = snapshot.docs.map((doc) => doc.data().nombre).filter(Boolean).sort((a, b) => a.localeCompare(b));
        setLanguages(languagesList);
      } catch (error) {
        console.error('Erro ao buscar idiomas:', error);
      }
    };

    fetchPsychologists();
    fetchSpecialties();
    fetchLanguages();
  }, [db]);

  // Busca as avaliações dos psicólogos
  useEffect(() => {
    const fetchReviews = async () => {
      const reviewsData = {};
      for (const psychologist of psychologists) {
        try {
          const reviews = await fetchPsychologistReviews(psychologist.id);
          const totalRate = reviews.reduce((sum, review) => sum + review.rate, 0);
          const averageRate = reviews.length > 0 ? totalRate / reviews.length : 0;
          reviewsData[psychologist.id] = { averageRate, reviewCount: reviews.length };
        } catch (error) {
          console.error('Erro ao buscar avaliações:', error);
        }
      }
      setReviews(reviewsData);
    };

    if (psychologists.length > 0) {
      fetchReviews();
    }
  }, [psychologists]);

  // Atualiza intervalo de preços
  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  // Filtra psicólogos por preço, especialidade e idioma
  const filteredPsychologists = psychologists.filter((psychologist) => {
    const isWithinPrice = psychologist.price >= priceRange[0] && psychologist.price <= priceRange[1];
    const matchesSpecialty = selectedSpecialty ? psychologist.therapy?.includes(selectedSpecialty) : true;
    const matchesLanguage = selectedLanguage ? psychologist.chosenLanguages?.includes(selectedLanguage) : true;
    const matchesNameSearch = psychologist.name?.toLowerCase().includes(searchName) || false;
    return isWithinPrice && matchesSpecialty && matchesLanguage && matchesNameSearch;
  });

  // Componente PsychologistCard
  const PsychologistCard = ({ psychologist, averageRate, reviewCount, onClick }) => {
    return (
      <Card
        onClick={onClick}
        sx={{ display: 'flex', mb: 2, p: 2, boxShadow: 3, width: '100%', position: 'relative' }}
      >
        <CardMedia
          component="img"
          sx={{ width: 150, height: 150, borderRadius: '50%' }}
          image={psychologist.photoURL}
          alt={psychologist.name}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, ml: 2 }}>
          <CardContent>
            <Typography variant="h6" component="div">
              {psychologist.name}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              COP:{psychologist.licenceNumber}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {psychologist.description}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {psychologist.therapy?.map((specialty, index) => (
                <Chip key={index} label={specialty} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {psychologist.chosenLanguages?.map((language, index) => (
                <Chip key={index} label={language} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {psychologist.studies?.map((studies, index) => (
                <Chip key={index} label={`${studies.course}: ${studies.school}`} />
              ))}
            </Box>
            <Typography variant="body1" fontWeight="bold" sx={{ mt: 2 }}>
              €{psychologist.price}.00/h
            </Typography>
          </CardContent>
        </Box>

        {/* Seção inferior direita para nota, estrelas e reviews */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            textAlign: 'right',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 0.5,
          }}
        >
          {/* Nota */}
          <Typography variant="caption" color="textSecondary">
            Nota: {averageRate.toFixed(1)}
          </Typography>

          {/* Estrelas */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {[...Array(5)].map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 20,
                  height: 20,
                  backgroundColor: index < Math.round(averageRate) ? '#ffc107' : '#e0e0e0',
                  clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                }}
              />
            ))}
          </Box>

          {/* Número de reviews */}
          <Typography variant="caption" color="textSecondary">
            Reviews: {reviewCount}
          </Typography>
        </Box>
      </Card>
    );
  };

  return (
    <Box>
      <Menu />
      <Container sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
          <TextField
            placeholder="Buscar..."
            variant="outlined"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value.toLowerCase())}
            fullWidth
            sx={{ backgroundColor: 'white' }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            {/* Filtro por Preço */}
            <Box sx={{ width: 300 }}>
              <Typography gutterBottom>Precio</Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceRangeChange}
                valueLabelDisplay="auto"
                min={0}
                max={200}
                step={10}
                marks={[
                  { value: 0, label: '€0' },
                  { value: 100, label: '€100' },
                  { value: 200, label: '€200' },
                ]}
                sx={{color: 'green'}}
              />
              <Typography>
                Intervalo selecionado: €{priceRange[0]} - €{priceRange[1]}
              </Typography>
            </Box>

            {/* Filtro por Especialidade */}
            <Box sx={{ width: 200 }}>
              <Typography gutterBottom>Especialidade(s)</Typography>
              <Select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                displayEmpty
                fullWidth
              >
                <MenuItem value="">Todas</MenuItem>
                {specialties.map((specialty, index) => (
                  <MenuItem key={index} value={specialty}>
                    {specialty}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {/* Filtro por Idioma */}
            <Box sx={{ width: 200 }}>
              <Typography gutterBottom>Idioma(s)</Typography>
              <Select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                displayEmpty
                fullWidth
              >
                <MenuItem value="">Todos</MenuItem>
                {languages.map((language, index) => (
                  <MenuItem key={index} value={language}>
                    {language}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {filteredPsychologists.map((psychologist) => (
            <Grid item xs={12} md={12} key={psychologist.id}>
              <PsychologistCard
                psychologist={psychologist}
                averageRate={reviews[psychologist.id]?.averageRate || 0}
                reviewCount={reviews[psychologist.id]?.reviewCount || 0}
                onClick={() => {
                  setPsychologistId(psychologist.id);
                  setTimeout(() => setOpen(true), 0);
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
      {psychologistId && open && (
        <Agenda
          psychologistId={psychologistId}
          psychologistName={psychologists.find((p) => p.id === psychologistId)?.name || ''}
          psychologistPhotoURL={psychologists.find((p) => p.id === psychologistId)?.photoURL || ''}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </Box>
  );
}

export default Especialistas;
