import React, { useEffect, useState } from 'react';
import { useAuth } from "../../backend/config/Authentication";
import { Box, Typography, Paper, Grid, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import AppointmentCard2 from '../components/AppointmentCard2';
import { getUserType, getUserName } from '../../backend/services/userService';
import { fetchActiveAppointments } from '../../backend/services/appointmentService';

const WelcomeHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
  boxShadow: theme.shadows[3]
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 160,
  height: 160,
  marginLeft: theme.spacing(3),
}));

function Welcome() {
  const { user } = useAuth();
  const [name, setUserName] = useState('');
  const [isPsychologist, setIsPsychologist] = useState(false);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const loadUserData = async () => {
      if (user?.uid) {
        try {
          const [userType, userName] = await Promise.all([
            getUserType(user.uid),
            getUserName(user.uid)
          ]);
          
          setIsPsychologist(userType === 'psychologist');
          setUserName(userName);
        } catch (error) {
          console.error('Erro ao carregar dados:', error.message);
        }
      }
    };
    loadUserData();
  }, [user]);

  useEffect(() => {
    const loadAppointments = async () => {
      if (user?.uid && isPsychologist !== null) {
        try {
          const data = await fetchActiveAppointments(user.uid, isPsychologist);
          setAppointments(data);
        } catch (error) {
          console.error('Erro ao carregar compromissos:', error.message);
        }
      }
    };
    loadAppointments();
  }, [user, isPsychologist]);

  return (
    <Box sx={{ p: 3 }}>
      <WelcomeHeader>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h3" component="h1" sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2e7d32 30%, #388e3c 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            Bienvenido(a), {name ? name.split(" ")[0] : ""}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {isPsychologist ? 'Panel de Psicólogo' : 'Panel de Cliente'}
          </Typography>
        </Box>
        <StyledAvatar 
          src="images/bien-venido.png" 
          alt="Mascot" 
          variant="rounded"
        />
      </WelcomeHeader>

      <Paper elevation={0} sx={{ 
        p: 3,
        borderRadius: 3,
        bgcolor: 'background.paper',
        boxShadow: 2
      }}>
        <Typography variant="h5" component="h2" sx={{ 
          fontWeight: 600,
          mb: 3,
          color: 'success.main'
        }}>
          Próximas Citas
        </Typography>

        {appointments.length > 0 ? (
          <Grid container spacing={3}>
            {appointments.map(appointment => (
              <Grid item xs={12} md={6} lg={4} key={appointment.id}>
                <AppointmentCard2 
                  appointment={appointment}
                  isPsychologist={isPsychologist}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ 
            p: 4,
            textAlign: 'center',
            bgcolor: 'background.default',
            borderRadius: 2
          }}>
            <Typography variant="body1" color="text.secondary">
              No hay citas programadas
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default Welcome;