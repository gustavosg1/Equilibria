import React, { useEffect, useState } from 'react';
import { Box, Avatar, Button, Paper, Grid, Grid2 } from '@mui/material';

import { useAuth } from '../firebase/Authentication';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

import Menu from '../components/Menu';
import Welcome from '../components/Welcome';
import PsychologistProfile from '../components/PsychologistProfile';
import EditarPerfilPsicolog from '../components/EditarPerfilPsicolog';
import FeedbackPsychologist from '../components/FeedbackPsychologist';

function ProfilePagePsychologist() {
  // Hook to retrieve the authenticated user
  const { user } = useAuth();

  // State to manage the currently displayed page/component
  const [currentPage, setCurrentPage] = useState('welcome');

  // Firestore database instance
  const db = getFirestore();

  // State to store the user's profile photo URL
  const [photo, setPhoto] = useState('');

  // Function to update the profile photo from Firestore
  async function updatePhoto() {
    const docRef = doc(db, 'psychologist', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Add timestamp to avoid caching issues
      const photoURL = docSnap.data().photoURL;
      setPhoto(`${photoURL}?t=${Date.now()}`);
    } else {
      console.error('Picture not found!');
    }
  }

  // Determines which component to render based on the current page state
  let view;

  if (currentPage === 'welcome') {
    view = <Welcome />; // Render the Welcome component
  } else if (currentPage === 'perfil') {
    view = <PsychologistProfile onSelect={setCurrentPage}/>; // Render the Profile component with a callback to change pages
  } else if (currentPage === 'editarPerfil') {
    view = <EditarPerfilPsicolog onPhotoUpdate={updatePhoto}/>; // Render Edit Profile with photo update functionality
  } else if (currentPage === 'misResenas') {
    view = <FeedbackPsychologist />; // Render the Feedback page
  } else {
    view = <Welcome />; // Default to Welcome if the page is undefined
  }

  // Fetch user details and photo from Firestore on component mount or when dependencies change
  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        try {
          // Attempt to fetch user data from the 'users' collection
          let userDocRef = doc(db, 'users', user.uid);
          let userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setPhoto(userData.photoURL);
          } else {
            console.log('Documento do usuário não encontrado no Firestore.');

            // Fallback to fetching from the 'psychologist' collection
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
  }, [user, db, photo]); // Dependencies include user, db instance, and photo

  return (
    <Box>
      {/* Render the top menu */}
      <Menu />

      <Grid container spacing={3} mt={4}>
        {/* Sidebar with user information and navigation buttons */}
        <Grid item xs={12} md={2.8}>
          <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={photo}
              alt="Gustavo"
              sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
            />
            <Box>
              {/* Button to navigate to the Welcome page */}
              <Button
                variant="contained"
                fullWidth
                color="success"
                sx={{ mb: 2 }}
                onClick={() => setCurrentPage('welcome')}
              >
                Home
              </Button>
              {/* Button to navigate to the Profile page */}
              <Button
                variant="contained"
                fullWidth
                color="success"
                sx={{ mb: 2 }}
                onClick={() => setCurrentPage('perfil')}
              >
                Perfil
              </Button>
              {/* Button to navigate to the Feedback page */}
              <Button 
                variant="contained" 
                fullWidth 
                color="success"
                sx={{ mb: 2 }}
                onClick={() => setCurrentPage('misResenas')}
              >
                Mis Reseñas
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Main content area to display the selected component */}
        <Grid item xs={12} md={8} sx={{ pl: 3 }}>
          {view}
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProfilePagePsychologist;
