import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Chip, CircularProgress, Avatar, Divider, styled } from '@mui/material';
import { useAuth } from "../../backend/config/Authentication";
import { getPsychologistProfile } from '../../backend/services/psychologistService';
import { FaEdit } from 'react-icons/fa';

const ProfileSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[3]
  }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontSize: '14px',
  padding: '4px 8px',
  backgroundColor: theme.palette.grey[300], // Chip cinza
  color: theme.palette.text.primary, // Cor do texto
  '&:hover': {
    backgroundColor: theme.palette.grey[400], // Cinza mais escuro no hover
  }
}));

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
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ 
        p: 4,
        borderRadius: 4,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0px 8px 24px rgba(149, 157, 165, 0.1)'
      }}>
        {/* Header Section */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ 
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2e7d32 30%, #388e3c 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Mi Perfil
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => onSelect("editarPerfil")}
            startIcon={<FaEdit />}
            sx={{ 
              bgcolor: '#029E52',
              '&:hover': { bgcolor: '#029E52' },
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: '1rem',
              px: 3,
              py: 1
            }}
          >
            Editar Perfil
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Description Section */}
        <ProfileSection>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
            Mi Descripción
          </Typography>
          {profileData.description.length > 0 ? (
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              {profileData.description.join(' ')}
            </Typography>
          ) : (
            <Typography variant="body2" color="textSecondary">
              Todavía no tienes una descripción
            </Typography>
          )}
        </ProfileSection>

        {/* Studies Section */}
        <ProfileSection>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
            Mis Estudios
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {profileData.studies.length > 0 ? (
              profileData.studies.map((study, index) => (
                <StyledChip
                  key={index}
                  label={`${study.course}: ${study.school}`}
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                Todavía no tienes informaciones de estudios
              </Typography>
            )}
          </Box>
        </ProfileSection>

        {/* Languages Section */}
        <ProfileSection>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
            Mis Idiomas
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {profileData.languages.length > 0 ? (
              profileData.languages.map((language, index) => (
                <StyledChip
                  key={index}
                  label={language}
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                Todavía no tienes informaciones de idiomas que hablas
              </Typography>
            )}
          </Box>
        </ProfileSection>

        {/* Specialties Section */}
        <ProfileSection>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
            Especialidades
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {profileData.specialties.length > 0 ? (
              profileData.specialties.map((specialty, index) => (
                <StyledChip
                  key={index}
                  label={specialty}
                />
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                Todavía no tienes informaciones de sus especialidades
              </Typography>
            )}
          </Box>
        </ProfileSection>
      </Paper>
    </Box>
  );
}

export default PsychologistProfile;