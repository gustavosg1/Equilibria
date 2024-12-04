import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/FirebaseConfig';
import { AppBar, Toolbar, IconButton, Typography, Box, Button } from '@mui/material';
import { styled } from '@mui/system';

const StyledAppBar = styled(AppBar)({
  backgroundColor: '#103900',
  color: '#ffffff',
  boxShadow: 'none',
});

const StyledLink = styled(Link)({
  textDecoration: 'none',
  color: '#ffffff',
  marginRight: '20px',
  '&:hover': {
    color: '#1e90ff',
  },
});

function Menu() {
  const navigate = useNavigate();

  async function HandleLogout() {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al hacer logout', error);
    }
  }

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <img src='/images/Logo.png' alt="Logo" style={{ height: '50px', width: '50px' }} />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, justifyContent: "right" }}>
          <StyledLink to="/Perfil">Home</StyledLink>
          <StyledLink to="/Especialistas">Especialistas</StyledLink>
          <StyledLink to="/MisCitas">Mis Citas</StyledLink>
          <StyledLink to="#">Chat</StyledLink>
          <Button color="inherit" onClick={HandleLogout} sx={{ marginLeft: '20px' }}>
            Salir
          </Button>
        </Typography>
      </Toolbar>
    </StyledAppBar>
  );
}

export default Menu;
