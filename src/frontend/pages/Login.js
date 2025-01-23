import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  TextField, Button, Container, Grid, Typography, Box,
  Divider, InputAdornment, IconButton, CircularProgress, Alert
} from "@mui/material";
import { Visibility, VisibilityOff, Google, Microsoft } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { loginWithEmail, loginWithGoogle, loginWithMicrosoft } from "../../backend/services/authService";
import { createUserDocument, checkUserRole } from "../../backend/services/userService";
import AccountTypePopup from "../components/AccountTypePopup";
import ClientRegisterPopup from "../components/ClientRegisterPopup";
import PsychologistRegisterPopup from "../components/PsychologistRegisterPopup";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '14px 28px',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-1px)'
  }
}));

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAccountTypePopup, setAccountTypePopup] = useState(false);
  const [showClientRegisterPopup, setClientRegisterPopup] = useState(false);
  const [showPsychologistRegisterPopup, setPsychologistRegisterPopup] = useState(false);
  const navigate = useNavigate();

  const handleSelection = (type) => {
    if (type === "client") {
      setClientRegisterPopup(true);
      setAccountTypePopup(false);
    } else if (type === "psychologist") {
      setPsychologistRegisterPopup(true);
      setAccountTypePopup(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const userCredential = await loginWithEmail(email, password);
      const role = await checkUserRole(userCredential.user.uid);
      navigate(role === "psychologist" ? "/Dashboard" : "/Perfil");
    } catch (error) {
      setError("Credenciales inválidas. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerFn) => {
    setLoading(true);
    setError("");
    try {
      const result = await providerFn();
      await createUserDocument(result.user);
      const role = await checkUserRole(result.user.uid);
      navigate(role === "psychologist" ? "/Dashboard" : "/Perfil");
    } catch (error) {
      setError("Error en el login social. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Grid container spacing={6} alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }}>
        {/* Sección de Login */}
        <Grid item xs={12} md={6} sx={{ maxWidth: 500 }}>
          <Box textAlign="center" mb={4}>
            <img
              src="/images/Logo.png"
              alt="Equilibria Logo"
              style={{ width: 180, marginBottom: 24 }}
            />
            <Typography variant="h4" component="h1" gutterBottom sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2e7d32 30%, #388e3c 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Bienvenido a Equilibria
            </Typography>
          </Box>

          <form onSubmit={handleEmailLogin}>
            <TextField
              fullWidth
              variant="filled"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              autoComplete="username"
              InputProps={{ disableUnderline: true, sx: { borderRadius: 2 } }}
            />
            
            <TextField
              fullWidth
              variant="filled"
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              autoComplete="current-password"
              InputProps={{
                disableUnderline: true,
                sx: { borderRadius: 2 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            <StyledButton
              fullWidth
              type="submit"
              variant="outlined" // Usar outlined para bordas
              color="success"
              size="large"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2, 
                bgcolor: 'white', // Fundo branco
                color: 'green',   // Texto verde
                borderColor: 'green', // Borda verde
                '&:hover': {
                  bgcolor: 'darkgreen', // Fundo verde ao passar o mouse
                  color: 'white',   // Texto branco ao passar o mouse
                  borderColor: 'green', // Mantém a borda verde
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar sesión'}
            </StyledButton>

            <Box textAlign="center" mb={3}>
              <Button 
                href="/forgot-password" 
                color="inherit"
                sx={{ fontWeight: 500, '&:hover': { color: 'success.main' } }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>o continúa con</Divider>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <StyledButton
                variant="outlined"
                startIcon={<Google />}
                onClick={() => handleSocialLogin(loginWithGoogle)}
                disabled={loading}
                sx={{ 
                  color: '#DB4437',
                  borderColor: '#DB4437',
                  '&:hover': { borderColor: '#C1351D', backgroundColor: '#FBEAE9' }
                }}
              >
                Google
              </StyledButton>
              
              <StyledButton
                variant="outlined"
                startIcon={<Microsoft />}
                onClick={() => handleSocialLogin(loginWithMicrosoft)}
                disabled={loading}
                sx={{ 
                  color: '#2F71C1',
                  borderColor: '#2F71C1',
                  '&:hover': { borderColor: '#255EA6', backgroundColor: '#E3F2FD' }
                }}
              >
                Microsoft
              </StyledButton>
            </Box>
          </form>
        </Grid>

        {/* Sección Informativa */}
        <Grid item xs={12} md={6} sx={{ maxWidth: 500 }}>
          <Box sx={{ 
            p: 4,
            borderRadius: 4,
            bgcolor: 'background.paper',
            boxShadow: 3
          }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ 
              fontWeight: 600,
              mb: 3,
              textAlign: 'center'
            }}>
              Tu Bienestar Mental, Nuestra Prioridad
            </Typography>

            {[
              "Consulta online con psicólogos certificados",
              "Sesiones seguras y confidenciales",
              "Agenda flexible 24/7",
              "Plataforma fácil de usar"
            ].map((text, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{
                  width: 24,
                  height: 24,
                  bgcolor: 'success.main',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}>
                  <Typography variant="body2" sx={{ color: 'white' }}>✓</Typography>
                </Box>
                <Typography variant="body1">{text}</Typography>
              </Box>
            ))}

            <StyledButton
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              onClick={() => setAccountTypePopup(true)}
              sx={{ mt: 4 }}
            >
              Crear cuenta gratuita
            </StyledButton>
          </Box>
        </Grid>

        {/* Popups */}
        {showAccountTypePopup && (
          <AccountTypePopup 
            onClose={() => setAccountTypePopup(false)}
            onSelect={handleSelection}
          />
        )}
        {showClientRegisterPopup && (
          <ClientRegisterPopup onClose={() => setClientRegisterPopup(false)} />
        )}
        {showPsychologistRegisterPopup && (
          <PsychologistRegisterPopup onClose={() => setPsychologistRegisterPopup(false)} />
        )}
      </Grid>
    </Container>
  );
};

export default Login;