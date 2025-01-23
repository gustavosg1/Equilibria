import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../backend/config/FirebaseConfig';
import { AppBar, Toolbar, IconButton, Button, Box, Typography, styled } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import { FaHome, FaUserMd, FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';

// Estilización del AppBar
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.success.dark,
  color: theme.palette.common.white,
  boxShadow: theme.shadows[3],
  padding: theme.spacing(1, 0),
}));

// Estilización de los Links
const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.common.white,
  display: 'flex',
  alignItems: 'center',
  marginRight: theme.spacing(3),
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.success.light,
    transform: 'translateY(-2px)',
  },
}));

// Estilización del Botón de Salir
const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.common.white,
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.common.white,
    transform: 'translateY(-2px)',
  },
}));

function Menu() {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const psicolegDoc = doc(db, 'psychologist', user.uid);
          const userSnapshot = await getDoc(psicolegDoc);
          setUserRole(userSnapshot.exists() ? 'psychologist' : 'client');
        }
      } catch (error) {
        console.error('Error al acceder a la base de datos:', error);
      }
    };

    checkUserRole();
  }, []);

  // Función de logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al hacer logout:', error);
    }
  };

  const pagina = userRole === 'psychologist' ? '/Dashboard' : '/Perfil';

  return (
    <StyledAppBar position="static">
      <Toolbar>
        {/* Logo a la izquierda */}
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <img 
            src="/images/Logo.png" 
            alt="Logo" 
            style={{ height: '50px', width: '50px', borderRadius: '50%' }} 
          />
        </IconButton>

        {/* Título de la aplicación */}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
          Equilibria
        </Typography>

        {/* Itens del menu alineados a la derecha */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <StyledLink to={pagina}>
            <FaHome size={24} style={{ marginRight: '8px' }} />
            <Typography variant="body1">Home</Typography>
          </StyledLink>

          <StyledLink to="/Especialistas">
            <FaUserMd size={24} style={{ marginRight: '8px' }} />
            <Typography variant="body1">Especialistas</Typography>
          </StyledLink>

          <StyledLink to="/MisCitas">
            <FaCalendarAlt size={24} style={{ marginRight: '8px' }} />
            <Typography variant="body1">Mis Citas</Typography>
          </StyledLink>

          <StyledButton 
            onClick={handleLogout} 
            startIcon={<FaSignOutAlt size={18} />}
          >
            Salir
          </StyledButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
}

export default Menu;