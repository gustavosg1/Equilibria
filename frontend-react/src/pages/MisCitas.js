import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Container, Card, CardMedia, Grid, Tabs, Tab, Modal } from '@mui/material';
import Menu from '../components/Menu';
import Videoconference from '../components/Videoconference';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/FirebaseConfig';

const MisCitas = () => {
  const [tabValue, setTabValue] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideoconference, setShowVideoconference] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [selectedPsychologistId, setSelectedPsychologistId] = useState(null);
  const [selectedAppointmentID, setSelectedAppointmentID] = useState(null);
  const [isPsychologist, setIsPsychologist] = useState(false); // Determina o tipo de usuário logado
  const [openModal, setOpenModal] = useState(false); // Controla a exibição do modal
  const [transcription, setTranscription] = useState(''); // Armazena a transcrição

  // Verifica em qual coleção o usuário está
  useEffect(() => {
    const checkUserCollection = async () => {
      const user = auth.currentUser;
      if (user) {
        const userId = user.uid;

        // Verifica na coleção 'psychologists'
        const psychologistDoc = await getDoc(doc(db, 'psychologist', userId));
        if (psychologistDoc.exists()) {
          setIsPsychologist(true); // Define que o usuário é um psicólogo
          return;
        }

        // Verifica na coleção 'users'
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setIsPsychologist(false); // Define que o usuário é um cliente
          return;
        }

        console.error('Usuário não encontrado em nenhuma coleção.');
      }
    };

    checkUserCollection();
  }, []);

  const AppointmentCard = ({ appointment, onCancel }) => {
    const [otherUserInfo, setOtherUserInfo] = useState(null); // Armazena informações do outro usuário

    // Busca informações do outro usuário (cliente ou psicólogo)
    useEffect(() => {
      const fetchOtherUserInfo = async () => {
        const otherUserId = isPsychologist ? appointment.clientId : appointment.psychologistId;
        if (otherUserId) {
          const collectionName = isPsychologist ? 'users' : 'psychologist';
          const otherUserDoc = await getDoc(doc(db, collectionName, otherUserId));
          if (otherUserDoc.exists()) {
            setOtherUserInfo(otherUserDoc.data());
          }
        }
      };

      fetchOtherUserInfo();
    }, [appointment, isPsychologist]);

    const handleTranscription = async () => {
      setOpenModal(true); // Abre o modal
      try {
        const appointmentDoc = await getDoc(doc(db, 'appointments', appointment.id));
        if (appointmentDoc.exists() && appointmentDoc.data().transcription) {
          setTranscription(appointmentDoc.data().transcription);
        } else {
          setTranscription('No hay resumen para esta cita');
        }
      } catch (error) {
        console.error('Erro ao buscar transcrição:', error);
        setTranscription('Erro ao buscar transcrição');
      }
    };

    return (
      <Card sx={{ display: 'flex', mb: 2, boxShadow: 3 }}>
        <CardMedia
          component="img"
          sx={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', m: 2 }}
          image={otherUserInfo?.photoURL || 'images/default.png'}
          alt={otherUserInfo?.name || 'Usuário'}
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, p: 2 }}>
          <Typography variant="h6">
            <strong>{isPsychologist ? 'Cliente:' : 'Psicólogo:'}</strong> {otherUserInfo?.name || 'N/A'}
          </Typography>
          <Typography variant="body1"><strong>Fecha:</strong> {appointment.day}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}><strong>Hora:</strong> {appointment.time}</Typography>

          {/* Renderizar os botões apenas se active === true */}
          {appointment.active && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  if (appointment.psychologistId) {
                    setSelectedPsychologistId(appointment.psychologistId);
                    setSelectedAppointmentID(appointment.id);
                    setCurrentChannel(`consulta-${appointment.psychologistId}-${Date.now()}`);
                    setShowVideoconference(true);
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
          {/* Ícone para transcrição */}
          {!appointment.active && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                height: '100%',
                paddingRight: '50px',
              }}
            >
              <img
                src="images/papiro.png"
                alt="Transcription Icon"
                style={{
                  width: '80px',
                  height: '80px',
                  cursor: 'pointer',
                  transform: 'translateY(-60%)',
                }}
                onClick={handleTranscription}
              />
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
          channelName={currentChannel}
          psychologistId={selectedPsychologistId}
          appointmentId={selectedAppointmentID}
          onEnd={() => setShowVideoconference(false)}
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
                  <AppointmentCard appointment={appointment} onCancel={async (id) => {
                    try {
                      await updateDoc(doc(db, 'appointments', id), { active: false }); // Atualiza no Firestore
                      setAppointments(prev =>
                        prev.map(a => (a.id === id ? { ...a, active: false } : a))
                      );
                    } catch (error) {
                      console.error('Erro ao cancelar consulta:', error);
                    }
                  }} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      )}
      {/* Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
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
          <Typography variant="h6">Transcripción</Typography>
          <Typography>{transcription}</Typography>
          <Button onClick={() => setOpenModal(false)} variant="contained" sx={{ mt: 2 }}>
            Cerrar
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default MisCitas;