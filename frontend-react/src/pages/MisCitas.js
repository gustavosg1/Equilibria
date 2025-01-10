import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Box, Typography, Button, Container, Card, CardMedia, CardContent, Grid, Tabs, Tab } from '@mui/material';
import Menu from '../components/Menu';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/FirebaseConfig';

// Componente de Card para cada consulta
const AppointmentCard = ({ appointment }) => (
  <Card sx={{ display: 'flex', mb: 2, boxShadow: 3 }}>
    {/* Foto do psicólogo */}
    <CardMedia
      component="img"
      sx={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', m: 2 }}
      image={appointment.psychologistPhotoURL || 'images/psicolog.png'} // Fallback se não houver URL
      alt={appointment.psychologistName || 'Psicólogo'}
    />
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, p: 2 }}>
      {/* Nome do psicólogo */}
      <Typography variant="h6">
        <strong>Psicólogo:</strong> {appointment.psychologistName || 'N/A'}
      </Typography>
      <Typography variant="body1"><strong>Fecha:</strong> {appointment.day}</Typography>
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
  const [tabValue, setTabValue] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error('Usuário não autenticado');
                setLoading(false);
                return;
            }

            const userId = user.uid;

            // Consulta para buscar como cliente
            const clientQuery = query(
                collection(db, 'appointments'),
                where('clientId', '==', userId)
            );

            // Consulta para buscar como psicólogo
            const psychologistQuery = query(
                collection(db, 'appointments'),
                where('psychologistID', '==', userId)
            );

            const [clientSnapshot, psychologistSnapshot] = await Promise.all([
                getDocs(clientQuery),
                getDocs(psychologistQuery),
            ]);

            // Combinar os resultados das duas consultas
            const fetchedAppointments = [
                ...clientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                ...psychologistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            ];

            setAppointments(fetchedAppointments);
        } catch (error) {
            console.error('Erro ao buscar as consultas:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchAppointments();
  }, []);

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
        {loading ? (
          <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
            Carregando consultas...
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {appointments.map((appointment) => (
              <Grid item xs={12} key={appointment.id}>
                <AppointmentCard appointment={appointment} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default MisCitas;