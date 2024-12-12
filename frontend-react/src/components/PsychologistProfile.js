import React, { useEffect, useState } from 'react';
import { Box, Grid2, Typography, Button, Paper } from '@mui/material';

import EditarPerfilPsicolog from './EditarPerfilPsicolog';

import { useAuth } from "../firebase/Authentication";
import { getFirestore, doc, getDoc,  } from 'firebase/firestore';

function PsychologistProfile ({onSelect}){
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
                <Paper elevation={3} sx={{ p: 3, width: "75vw", height: "75vh"}}>

                  <div style={{ textAlign: "right" }}>
                    <Button variant="contained" onClick= { () => onSelect("editarPerfil")}> Editar Perfil </Button>
                  </div>

                  <Typography variant="h5" sx={{ textAlign: "center", fontWeight: "bold" }}> Mi Perfil</Typography>

                  <br/>

                  <Typography variant="h6" sx={{marginLeft: "10px", fontWeight: "bold"}}> Mi Descripción</Typography>
                  <Box sx={{
                    padding: "16px",
                    border: "1px solid #ccc", // Borda ao redor do texto
                    borderRadius: "8px",      // Bordas arredondadas
                    backgroundColor: "#FAFFF9", // Fundo leve
                    width: "100%",           // Ajustável (ou largura fixa como '300px')>
                  }}>
                      {description }
                  </Box>

                  <br/>
                  <br/>

                  <Typography variant="h6" sx={{marginLeft: "10px", fontWeight: "bold"}}> Mis Estudios</Typography>
                  <Box sx={{
                    padding: "16px",
                    border: "1px solid #ccc", // Borda ao redor do texto
                    borderRadius: "8px",      // Bordas arredondadas
                    backgroundColor: "#FAFFF9", // Fundo leve
                    width: "100%",           // Ajustável (ou largura fixa como '300px')>
                  }}>
                      {description }
                  </Box>

                </Paper>
            </Grid2>
        </Box>
    )
}

export default PsychologistProfile;
