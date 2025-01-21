import React, { useEffect, useState } from 'react';
import { Box, Grid2, Typography, Button, Paper, Chip } from '@mui/material';
import { useAuth } from "../firebase/Authentication";
import { getFirestore, doc, getDoc } from 'firebase/firestore';

function PsychologistProfile({ onSelect }) {
  const { user } = useAuth();
  const db = getFirestore();
  const [description, setUserDescription] = useState([]); // Estado para armazenar a descrição como array
  const [studies, setStudies] = useState([]); // Estado para armazenar os estudos
  const [languages, setLanguages] = useState([]); // Estado para armazenar idiomas
  const [specialties, setSpecialties] = useState([]); // Estado para armazenar especialidades

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          // Referência ao documento do usuário no Firestore
          const userDocRef = doc(db, "psychologist", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserDescription(userData.description ? [userData.description] : []); // Define a descrição como array
            setStudies(userData.studies || []); // Define os estudos
            setLanguages(userData.chosenLanguages || []); // Define os idiomas
            setSpecialties(userData.therapy || []); // Define as especialidades
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

  return (
    <Box>
      <Grid2>
        <Paper elevation={3} sx={{ p: 3, width: "100%", height: "100%" }}>
          <div style={{ textAlign: "right" }}>
            <Button variant="contained" onClick={() => onSelect("editarPerfil")} sx={{backgroundColor: 'green',
            '&:hover': { backgroundColor: 'darkgreen',},}}> Editar Perfil </Button>
          </div>

          <Typography variant="h5" sx={{ textAlign: "center", fontWeight: "bold" }}> Mi Perfil</Typography>

          <br />

          <Typography variant="h6" sx={{ marginLeft: "10px", fontWeight: "bold" }}> Mi Descripción</Typography>
          <Box
            sx={{
              padding: "16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: "#FAFFF9",
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {description.length > 0 ? (
              description.map((desc, index) => (
                <Chip
                  key={index}
                  label={desc}
                  sx={{ fontSize: "14px", padding: "4px 8px" }}
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                Todavia no tienes una descripción.
              </Typography>
            )}
          </Box>

          <br />
          <br />

          <Typography variant="h6" sx={{ marginLeft: "10px", fontWeight: "bold" }}> Mis Estudios</Typography>
          <Box
            sx={{
              padding: "16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: "#FAFFF9",
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {studies.length > 0 ? (
              studies.map((study, index) => (
                <Chip
                  key={index}
                  label={`${study.course}: ${study.school}`}
                  sx={{ fontSize: "14px", padding: "4px 8px" }}
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                Todavia no tienes informaciones de estudios.
              </Typography>
            )}
          </Box>

          <br />
          <br />

          <Typography variant="h6" sx={{ marginLeft: "10px", fontWeight: "bold" }}> Mis Idiomas</Typography>
          <Box
            sx={{
              padding: "16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: "#FAFFF9",
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {languages.length > 0 ? (
              languages.map((language, index) => (
                <Chip
                  key={index}
                  label={language}
                  sx={{ fontSize: "14px", padding: "4px 8px" }}
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                Todavia no tienes informaciones de idiomas que hablas.
              </Typography>
            )}
          </Box>

          <br />
          <br />

          <Typography variant="h6" sx={{ marginLeft: "10px", fontWeight: "bold" }}> Especialidades</Typography>
          <Box
            sx={{
              padding: "16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              backgroundColor: "#FAFFF9",
              width: "100%",
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {specialties.length > 0 ? (
              specialties.map((specialty, index) => (
                <Chip
                  key={index}
                  label={specialty}
                  sx={{ fontSize: "14px", padding: "4px 8px" }}
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                Todavia no tienes informaciones de sus especialidades.
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid2>
    </Box>
  );
}

export default PsychologistProfile;
