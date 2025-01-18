import React, { useEffect, useState } from 'react';
import { Box, Avatar, Button, Paper, Grid2, Grid } from '@mui/material';

import { useAuth } from '../firebase/Authentication';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

import Menu from '../components/Menu';
import Welcome from '../components/ClientWelcome';
import PsychologistProfile from '../components/PsychologistProfile';
import EditarPerfilPsicolog from '../components/EditarPerfilPsicolog';

function ProfilePagePsychologist() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('welcome');
  const db = getFirestore();
  const [photo, setPhoto] = useState('');

  async function updatePhoto() {
    const docRef = doc(db, 'psychologist', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const photoURL = docSnap.data().photoURL;
      setPhoto(`${photoURL}?t=${Date.now()}`);
    } else {
      console.error('Picture not found!');
    }
  }

 
  let view;

  if (currentPage === 'welcome') {
    view = <Welcome />;
  } else if (currentPage === 'perfil') {
    view = <PsychologistProfile onSelect={setCurrentPage}/>;
  } else if (currentPage === 'editarPerfil') {
    view = <EditarPerfilPsicolog onPhotoUpdate={updatePhoto}/>;
  } else {
    view = <Welcome />;
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        try {
          let userDocRef = doc(db, 'users', user.uid);
          let userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setPhoto(userData.photoURL);
          } else {
            console.log('Documento do usuário não encontrado no Firestore.');

            userDocRef = doc(db, 'psychologist', user.uid);
            userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const userData = userDoc.data();
              setPhoto(userData.photoURL);
            }
          }

        } catch (error) {
          console.error('Erro ao buscar documento do usuário no Firestore:', error);
        }
      }
    };
    fetchUser();
  }, [user, db, photo]);

  return (
    <Box>
      {/* Menu */}
      <Menu />

      <Grid container spacing={3} mt={4}>
        {/* User Information Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={photo}
              alt="Gustavo"
              sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
            />
            <Box>
              <Button
                variant="contained"
                fullWidth
                color="success"
                sx={{ mb: 2 }}
                onClick={() => setCurrentPage('welcome')}
              >
                Home
              </Button>
              <Button
                variant="contained"
                fullWidth
                color="success"
                sx={{ mb: 2 }}
                onClick={() => setCurrentPage('perfil')}
              >
                Perfil
              </Button>
              <Button variant="contained" fullWidth color="success">
                Mis Reseñas
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Main Content Section */}
        <Grid2 item xs={12} md={8}>
          {view}
        </Grid2>
      </Grid>
    </Box>
  );
}

export default ProfilePagePsychologist;
