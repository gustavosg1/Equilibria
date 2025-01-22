import React, { useEffect, useState } from 'react';
import { Box, Grid, Avatar, Button, Typography, Paper, CircularProgress } from '@mui/material';
import Menu from '../components/Menu';
import Welcome from '../views/Welcome';
import EditarPerfil from '../views/EditarPerfilClient';
import { useAuth } from '../../firebase/Authentication';
import { getFirestore, doc, getDoc } from 'firebase/firestore';


function ProfilePage() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('welcome');
  const db = getFirestore();
  const [photo, setPhoto] = useState('');

  async function updatePhoto() {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const photoURL = docSnap.data().photoURL;
      setPhoto(`${photoURL}?t=${Date.now()}`);
    } else {
      console.error('Documento do usuário não encontrado!');
    }
  }

  let view;

  if (currentPage === 'welcome') {
    view = <Welcome />;
  } else if (currentPage === 'editarPerfil') {
    view = <EditarPerfil onPhotoUpdate={updatePhoto} />;
  } else {
    view = <Welcome />;
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setPhoto(userData.photoURL);
          } else {
            console.log('Documento do usuário não encontrado no Firestore.');
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
                onClick={() => setCurrentPage('editarPerfil')}
              >
                Editar Perfil
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Main Content Section */}
        <Grid item xs={12} md={8}>
          {view}
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfilePage;
