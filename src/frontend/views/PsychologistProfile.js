import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Chip, CircularProgress } from '@mui/material';
import { useAuth } from "../../backend/config/Authentication";
import { getPsychologistProfile } from '../../backend/services/psychologistService';

function PsychologistProfile({ onSelect }) {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    description: [],
    studies: [],
    languages: [],
    specialties: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Busca os dados do perfil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        if (user?.uid) {
          const data = await getPsychologistProfile(user.uid);
          setProfileData(data);
        }
      } catch (error) {
        setError(`Erro ao carregar perfil: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  // Componente auxiliar para renderizar seções
  const ProfileSection = ({ title, items, emptyMessage }) => (
    <Box mb={4}>
      <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold' }}>{title}</Typography>
      <Box
        sx={{
          p: 2,
          border: '1px solid #ccc',
          borderRadius: 2,
          bgcolor: '#FAFFF9',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mt: 1
        }}
      >
        {items.length > 0 ? (
          items.map((item, index) => (
            <Chip
              key={index}
              label={item}
              sx={{ fontSize: '14px', p: '4px 8px' }}
            />
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            {emptyMessage}
          </Typography>
        )}
      </Box>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" textAlign="center" mt={4}>
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, width: "100%" }}>
        {/* Botão de edição */}
        <Box textAlign="right">
          <Button 
            variant="contained" 
            onClick={() => onSelect("editarPerfil")}
            sx={{ 
              bgcolor: 'green', 
              '&:hover': { bgcolor: 'darkgreen' } 
            }}
          >
            Editar Perfil
          </Button>
        </Box>

        {/* Título da página */}
        <Typography variant="h5" textAlign="center" fontWeight="bold" mb={4}>
          Mi Perfil
        </Typography>

        {/* Seção de Descrição */}
        <ProfileSection 
          title="Mi Descripción" 
          items={profileData.description} 
          emptyMessage="Todavía no tienes una descripción" 
        />

        {/* Seção de Estudos */}
        <ProfileSection 
          title="Mis Estudios" 
          items={profileData.studies.map(s => `${s.course}: ${s.school}`)} 
          emptyMessage="Todavía no tienes informaciones de estudios" 
        />

        {/* Seção de Idiomas */}
        <ProfileSection 
          title="Mis Idiomas" 
          items={profileData.languages} 
          emptyMessage="Todavía no tienes informaciones de idiomas que hablas" 
        />

        {/* Seção de Especialidades */}
        <ProfileSection 
          title="Especialidades" 
          items={profileData.specialties} 
          emptyMessage="Todavía no tienes informaciones de sus especialidades" 
        />
      </Paper>
    </Box>
  );
}

export default PsychologistProfile;