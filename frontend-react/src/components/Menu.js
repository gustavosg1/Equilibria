import React, {useState, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/FirebaseConfig';
import { AppBar, Toolbar, IconButton, Button, Box } from '@mui/material';
import { styled } from '@mui/system';
import {doc, getDoc} from 'firebase/firestore'

// Estilização do AppBar
const StyledAppBar = styled(AppBar)({
  backgroundColor: '#103900',
  color: '#ffffff',
  boxShadow: 'none',
});

// Estilização dos Links
const StyledLink = styled(Link)({
  textDecoration: 'none',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  marginRight: '20px',
  '&:hover': {
    color: '#1e90ff',
  },
});

function Menu() {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() =>{
    const checkUserRole = async () => {
      try{
        const user = auth.currentUser;
        if (user){
          const psicolegDoc = doc(db,'psychologist', user.uid);
          const userSnapshot = await getDoc(psicolegDoc);
          setUserRole(userSnapshot.exists() ? 'psychologist' : 'client');
        }
      } catch (error){
        console.log('Error al accedir la base de dades per trobar perfil')
      }
    }

    checkUserRole()
  }, []);
  

  // Função de logout
  async function HandleLogout() {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  const pagina = userRole === 'psychologist' ? '/Dashboard' : '/Perfil';

   

  return (
    <StyledAppBar position="static">
      <Toolbar>
        {/* Logo à esquerda */}
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <img src="/images/Logo.png" alt="Logo" style={{ height: '50px', width: '50px' }} />
        </IconButton>

        {/* Itens do menu alinhados à direita */}
        <Box sx={{ display: "flex", marginLeft: "auto", alignItems: "center", gap: 2 }}>
          <StyledLink to={pagina}>
            <img src="/images/icono-home.png" alt="Home" style={{ width: '55px', height: '40px', marginRight: '5px' }} />
            Home
          </StyledLink>
          <StyledLink to="/Especialistas">
            <img src="/images/icono-especialistas.png" alt="Especialistas" style={{ width: '60px', height: '45px', marginRight: '5px' }} />
            Especialistas
          </StyledLink>
          <StyledLink to="/MisCitas">
            <img src="/images/icono-mis-citas.png" alt="Mis Citas" style={{ width: '35px', height: '35  px', marginRight: '5px' }} />
            Mis Citas
          </StyledLink>
          <StyledLink to="#">
            <img src="/images/icono-chat.png" alt="Chat" style={{ width: '45px', height: '40px', marginRight: '5px' }} />
            Chat
          </StyledLink>
          <Button color="inherit" onClick={HandleLogout}>
            Salir
          </Button>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
}

export default Menu;