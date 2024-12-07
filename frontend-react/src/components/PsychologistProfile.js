import React, { useEffect, useState } from 'react';
import { Box, Grid2, Typography, Button, Paper } from '@mui/material'
import { useAuth } from "../firebase/Authentication";
import { getFirestore, doc, getDoc,  } from 'firebase/firestore';

function PsychologistProfile (){
    const { user } = useAuth();
    const db = getFirestore();
    const [description, setUserDescription ] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {

            if (user) {
                try {
                  // Referencia ao documento do usuário no Firestore
                  const userDocRef = doc(db, "psychologist", user.uid);
                  const userDoc = await getDoc(userDocRef);
    
              if (userDoc.exists()) {
                const userData = userDoc.data();
                setUserDescription(userData.description || "Todavia no tienes una descripción");

              } else {
                console.log("Documento do usuário não encontrado no Firestore.");
              }
            } catch (error) {
              console.error("Erro ao buscar documento do usuário no Firestore:", error);
            }
          }
        };
    
        fetchUserData();
      }, [user, db]); // Executa quando `user` ou `db` mudarem

    return(
        <Box>
            <Grid2>
                <Button> Editar Perfil </Button>
                <Paper elevation={3} sx={{ p: 3}}>
                    <Typography variant="h1"> Mi Perfil</Typography>
                    <Typography variant="h2"> Mi descripción</Typography>
                    <Box>
                        {description }
                    </Box>
                </Paper>
            </Grid2>
        </Box>
    )
}

export default PsychologistProfile;
