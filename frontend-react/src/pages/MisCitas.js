import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Card, CardMedia, Grid, Tabs, Tab } from '@mui/material';
import Menu from '../components/Menu';
import Videoconference from '../components/Videoconference';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/FirebaseConfig';

const MisCitas = () => {
  const [tabValue, setTabValue] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideoconference, setShowVideoconference] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null); // Armazena o canal dinamicamente
  const [selectedPsychologistId, setSelectedPsychologistId] = useState(null); // Armazena o psychologistID do card clicado
  const [selectedAppointmentID, setSelectedAppointmentID] = useState(null); // Armazena o ID do appointment clicado

  const AppointmentCard = ({ appointment, onCancel }) => {
    return (
      <Card sx={{ display: 'flex', mb: 2, boxShadow: 3 }}>
        <CardMedia
          component="img"
          sx={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', m: 2 }}
          image={appointment.psychologistPhotoURL || 'images/psicolog.png'}
          alt={appointment.psychologistName || 'Psicólogo'}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, p: 2 }}>
          <Typography variant="h6">
            <strong>Psicólogo:</strong> {appointment.psychologistName || 'N/A'}
          </Typography>
          <Typography variant="body1"><strong>Fecha:</strong> {appointment.day}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}><strong>Hora:</strong> {appointment.time}</Typography>
          {appointment.active && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  if (appointment.psychologistId) {
                    setSelectedPsychologistId(appointment.psychologistId); // Define o psychologistID do card clicado
                    setSelectedAppointmentID(appointment.id); // Define o ID do appointment clicado
                    setCurrentChannel(`consulta-${appointment.psychologistId}-${Date.now()}`); // Define o canal dinamicamente
                    setShowVideoconference(true); // Exibe o componente Videoconference
                  } else {
                    console.error('O ID do psicólogo está ausente no agendamento.');
                    
                  }
                }}
              >
                Empezar Videoconferencia
              </Button>
              <Button variant="outlined" color="error" onClick={() => onCancel(appointment.id)}>
                Anular
              </Button>
            </Box>
          )}
        </Box>
      </Card>
    );
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) return;
        const userId = user.uid;
        const clientQuery = query(collection(db, 'appointments'), where('clientId', '==', userId));
        const psychologistQuery = query(collection(db, 'appointments'), where('psychologistId', '==', userId));
        const [clientSnapshot, psychologistSnapshot] = await Promise.all([
          getDocs(clientQuery),
          getDocs(psychologistQuery),
        ]);

        const fetchedAppointments = [
          ...clientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          ...psychologistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ];

        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <Box>
      <Menu />
      {showVideoconference ? (
        <Videoconference
          channelName={currentChannel} // Passa o canal dinâmico para Videoconference
          psychologistId={selectedPsychologistId} // Passa o psychologistID para Videoconference
          appointmentId={selectedAppointmentID} // Passa o appointmentID para Videoconference
          onEnd={() => setShowVideoconference(false)} // Fecha o componente após terminar
        />
      ) : (
        <Container sx={{ mt: 4 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} centered textColor="primary" indicatorColor="primary" sx={{ mb: 3 }}>
            <Tab label="Citas Futuras" />
            <Tab label="Citas Pasadas" />
          </Tabs>
          {loading ? (
            <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>Carregando consultas...</Typography>
          ) : (
            <Grid container spacing={2}>
              {(tabValue === 0 ? appointments.filter(a => a.active) : appointments.filter(a => !a.active)).map(appointment => (
                <Grid item xs={12} key={appointment.id}>
                  <AppointmentCard appointment={appointment} onCancel={id => updateDoc(doc(db, 'appointments', id), { active: false })} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      )}
    </Box>
  );
};

export default MisCitas;