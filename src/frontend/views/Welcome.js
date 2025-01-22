import React, { useEffect, useState } from 'react';
import { Col } from 'react-bootstrap';
import { useAuth } from "../../backend/config/Authentication";
import { Card, Box, Typography, Button } from '@mui/material';
import AppointmentCard from '../components/AppointmentCard';
import { getUserType, getUserName } from '../../backend/services/userService';
import { fetchActiveAppointments } from '../../backend/services/appointmentService';

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
    <Col>
      <div className="d-flex align-items-center">
        <h1 className="mb-4 me-3">Bienvenido(a), {name ? name.split(" ")[0] : ""}.</h1>
        <img
          src="images/bien-venido.png"
          alt="Mascot"
          className="mascot-image img-fluid"
          style={{ maxWidth: '200px' }}
        />
      </div>

      <div className="next-appointments">
        <h3 className="mb-3">Mis Próximas Citas:</h3>
        {appointments.length > 0 ? (
          appointments.map(appointment => (
            <AppointmentCard 
              key={appointment.id} 
              appointment={appointment}
              isPsychologist={isPsychologist}
            />
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No hay citas programadas.
          </Typography>
        )}
      </div>
    </Col>
  );
}

export default Welcome;