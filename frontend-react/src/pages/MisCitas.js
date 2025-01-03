import React from 'react';
import { AppBar, Toolbar, Box, Typography, Button, Container, Card, CardMedia, CardContent, Grid, Tabs, Tab } from '@mui/material';
import Menu from '../components/Menu';

// Dados de exemplo das consultas
const appointments = [
  {
    psychologist: {
      name: "Marco Fernandez",
      imgSrc: "images/psicolog.png", // Substitua com o caminho real
    },
    date: "16/10/2024",
    time: "15:00",
  },
  // Adicione mais consultas aqui
];

// Componente de Card para cada consulta
const AppointmentCard = ({ appointment }) => (
  <Card sx={{ display: 'flex', mb: 2, boxShadow: 3 }}>
    <CardMedia
      component="img"
      sx={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', m: 2 }}
      image={appointment.psychologist.imgSrc}
      alt={appointment.psychologist.name}
    />
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, p: 2 }}>
      <Typography variant="h6"><strong>Psicólogo:</strong> {appointment.psychologist.name}</Typography>
      <Typography variant="body1"><strong>Fecha:</strong> {appointment.date}</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}><strong>Hora:</strong> {appointment.time}</Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" color="success">
          Empezar Videoconferencia
        </Button>
        <Button variant="outlined" color="error">
          Anular
        </Button>
      </Box>
    </Box>
  </Card>
);

const MisCitas = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      {/* Menu */}
      <Menu />

      {/* Container Principal */}
      <Container sx={{ mt: 4 }}>
        {/* Tabs para Citas Futuras e Citas Pasadas */}
        <Tabs
          value={tabValue}
          onChange={handleChange}
          centered
          textColor="primary"
          indicatorColor="primary"
          sx={{ mb: 3 }}
        >
          <Tab label="Citas Futuras" />
          <Tab label="Citas Pasadas" />
        </Tabs>

        {/* Lista de Consultas */}
        <Grid container spacing={2}>
          {appointments.map((appointment, index) => (
            <Grid item xs={12} key={index}>
              <AppointmentCard appointment={appointment} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default MisCitas;