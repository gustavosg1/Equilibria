import React, { useEffect, useState } from 'react';
import { Col } from 'react-bootstrap';
import { useAuth } from "../../backend/config/Authentication";
import { getFirestore, doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { Card, CardMedia, Box, Typography, Button } from '@mui/material';

function Welcome() {
  const { user } = useAuth();
  const [name, setUserName] = useState(null); // Estado para armazenar o nome do usuário
  const db = getFirestore();
  const [isPsychologist, setIsPsychologist] = useState(false); // Determina o tipo de usuário logado
  const [appointments, setAppointments] = useState([]); // Adiciona estado para compromissos

  // Verifica se o usuário está na coleção de psicólogos ou clientes
  useEffect(() => {
    const checkUserType = async () => {
      if (user) {
        const userId = user.uid;

        const psychologistDoc = await getDoc(doc(db, 'psychologist', userId));
        if (psychologistDoc.exists()) {
          setIsPsychologist(true); // Define que o usuário é um psicólogo
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          setIsPsychologist(false); // Define que o usuário é um cliente
          return;
        }

        console.error('Usuário não encontrado em nenhuma coleção.');
      }
    };

    checkUserType();
  }, [user, db]);

  // Carrega compromissos com base no tipo de usuário e no campo 'active'
  useEffect(() => {
    const fetchAppointments = async () => {
      if (user) {
        const userId = user.uid;
        const clientQuery = query(
          collection(db, 'appointments'),
          where('clientId', '==', userId),
          where('active', '==', true) // Filtra apenas compromissos ativos
        );
        const psychologistQuery = query(
          collection(db, 'appointments'),
          where('psychologistId', '==', userId),
          where('active', '==', true) // Filtra apenas compromissos ativos
        );
        const [clientSnapshot, psychologistSnapshot] = await Promise.all([
          getDocs(clientQuery),
          getDocs(psychologistQuery),
        ]);

        const fetchedAppointments = [
          ...clientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          ...psychologistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ];

        setAppointments(fetchedAppointments);
      }
    };

    fetchAppointments();
  }, [user, db, isPsychologist]);

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        try {
          let userDocRef = doc(db, "users", user.uid);
          let userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.name || null); // Define o nome do usuário no estado
          } else {
            userDocRef = doc(db, "psychologist", user.uid);
            userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserName(userData.name || null); // Define o nome do usuário no estado                
            }
          }
        } catch (error) {
          console.error("Erro ao buscar nome do usuário:", error);
        }
      }
    };

    fetchUserName();
  }, [user, db]);

  const AppointmentCard = ({ appointment }) => {
    const [otherUserInfo, setOtherUserInfo] = useState(null);

    // Busca informações do outro usuário relacionado ao compromisso
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
        </Box>
      </Card>
    );
  };

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
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">No hay citas programadas.</Typography>
        )}
      </div>
    </Col>
  );
}

export default Welcome;
