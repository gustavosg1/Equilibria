import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Grid, Tabs, Tab, Modal, CircularProgress, Button } from '@mui/material';
import Menu from '../components/Menu';
import Videoconference from '../views/Videoconference';
import PsychologistCard from '../components/PsychologistCard';
import { fetchAppointments, cancelAppointment } from '../../backend/services/appointmentService';
import { summarizeTranscription } from '../../backend/services/transcriptionService';
import { checkUserRole, getUserInfo } from '../../backend/services/userService';
import { auth } from '../../backend/config/FirebaseConfig';

const MisCitas = () => {
  const [tabValue, setTabValue] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVideoconference, setShowVideoconference] = useState(false);
  const [currentChannel, setCurrentChannel] = useState('');
  const [selectedPsychologistId, setSelectedPsychologistId] = useState('');
  const [selectedAppointmentID, setSelectedAppointmentID] = useState('');
  const [isPsychologist, setIsPsychologist] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Verificar tipo de usuário
  useEffect(() => {
    const verifyUserType = async () => {
      try {
        if (auth.currentUser?.uid) {
          const role = await checkUserRole(auth.currentUser.uid);
          setIsPsychologist(role === 'psychologist');
        }
      } catch (error) {
        console.error('Erro ao verificar tipo de usuário:', error.message);
      }
    };
    verifyUserType();
  }, []);

  // Carregar agendamentos
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        if (auth.currentUser?.uid) {
          const data = await fetchAppointments(auth.currentUser.uid);
          setAppointments(data);
        }
      } catch (error) {
        console.error('Erro ao carregar consultas:', error.message);
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, []);

  // Manipular resumo da transcrição
  const handleTranscription = async (appointmentId) => {
    try {
      setIsSummarizing(true);
      const appointmentData = await getUserInfo(appointmentId, 'appointments');
      
      if (appointmentData?.transcription) {
        const summary = await summarizeTranscription(appointmentData.transcription);
        setTranscription(summary);
      } else {
        setTranscription('Nenhuma transcrição disponível');
      }
    } catch (error) {
      console.error('Erro ao gerar resumo:', error.message);
      setTranscription('Erro ao carregar resumo');
    } finally {
      setIsSummarizing(false);
      setOpenModal(true);
    }
  };

  // Filtrar consultas ativas/inativas
  const filteredAppointments = appointments.filter(appointment => 
    tabValue === 0 ? appointment.active : !appointment.active
  );

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
          <Tabs 
            value={tabValue} 
            onChange={(_, newValue) => setTabValue(newValue)}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label="Citas Futuras" />
            <Tab label="Citas Pasadas" />
          </Tabs>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredAppointments.map(appointment => (
                <Grid item xs={12} key={appointment.id}>
                  <PsychologistCard
                    appointment={appointment}
                    isPsychologist={isPsychologist}
                    onStartCall={() => {
                      setSelectedPsychologistId(appointment.psychologistId);
                      setSelectedAppointmentID(appointment.id);
                      setCurrentChannel(`consulta-${appointment.psychologistId}-${Date.now()}`);
                      setShowVideoconference(true);
                    }}
                    onCancel={async () => {
                      try {
                        await cancelAppointment(appointment.id);
                        setAppointments(prev => prev.map(a => 
                          a.id === appointment.id ? { ...a, active: false } : a
                        ));
                      } catch (error) {
                        console.error('Erro ao cancelar:', error.message);
                      }
                    }}
                    onViewSummary={() => handleTranscription(appointment.id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          minWidth: 300,
          maxWidth: 600,
          borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom>
            Resumo da Sessão
          </Typography>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {isSummarizing ? (
              <Box display="flex" alignItems="center" gap={2}>
                <CircularProgress size={20} />
                <Typography>Gerando resumo...</Typography>
              </Box>
            ) : (
              <Typography whiteSpace="pre-wrap">
                {transcription}
              </Typography>
            )}
          </Box>
          <Box mt={2} textAlign="right">
            <Button 
              variant="contained" 
              onClick={() => setOpenModal(false)}
              sx={{ mt: 2 }}
            >
              Fechar
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default MisCitas;