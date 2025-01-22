import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Grid, Typography, Box } from "@mui/material";

import { loginWithEmail, loginWithGoogle, loginWithMicrosoft } from "../../backend/services/authService";
import { createUserDocument, checkUserRole } from "../../backend/services/userService";

import AccountTypePopup from "../components/AccountTypePopup";
import ClientRegisterPopup from "../components/ClientRegisterPopup";
import PsychologistRegisterPopup from "../components/PsychologistRegisterPopup";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      console.error("Error de login:", error);
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
      const role = await checkUserRole(result.user.uid); // Verificar el rol aquí
      navigate(role === "psychologist" ? "/Dashboard" : "/Perfil");
    } catch (error) {
      setError("Error en el login social. Intente nuevamente.");
      console.error("Error de login social:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" className="login-page">
      <Grid container spacing={3} alignItems="center" justifyContent="center" style={{ minHeight: "100vh" }}>
        <Grid item xs={12} md={6} lg={4}>
          <Box textAlign="center" mb={4}>
            <img
              src="/images/Logo.png"
              alt="Equilibria Logo"
              style={{ maxWidth: "150px" }}
              className="mb-3"
            />
            <Typography variant="h4" component="h2">
              Bienvenido a Equilibria
            </Typography>
          </Box>
          <form onSubmit={handleEmailLogin}>
            <TextField
              fullWidth
              variant="outlined"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              sx={{ mt: 2, mb: 2 }}
            >
              Iniciar sesión
            </Button>
          </form>
          <Box textAlign="center">
            <a href="/forgot-password" className="text-decoration-none">
              ¿Has olvidado la contraseña?
            </a>
          </Box>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <Box className="info-section">
            <Typography variant="h5" component="h2" gutterBottom sx={{textAlign: 'center'}}>
              Tu Apoyo Psicológico, Paso a Paso
            </Typography>
            <Typography variant="body1" paragraph style={{textAlign: 'justify'}}>
              Equilibria es una plataforma online que conecta a personas con
              psicólogos cualificados de manera fácil y segura. Ofrecemos
              consultas virtuales adaptadas a tus necesidades, permitiendo elegir
              al profesional que mejor se ajuste a tu situación. Para empezar,
              simplemente crea una cuenta, explora los perfiles de nuestros
              psicólogos y agenda tu consulta en el horario que prefieras. Todas
              las sesiones se realizan de manera segura, garantizando
              confidencialidad, comodidad desde cualquier lugar. Nuestro objetivo
              es facilitar el acceso a un apoyo psicológico de calidad.
            </Typography>
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => setAccountTypePopup(true)}
            >
              Crear nueva cuenta
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} className="social-login-section" textAlign="center">
          <Button
            variant="outlined"
            color="error"
            sx={{ mr: 2 }}
            onClick={() => handleSocialLogin(loginWithGoogle)}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Login con Google"}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleSocialLogin(loginWithMicrosoft)}
            disabled={loading}
          >
            {loading ? "Cargando..." : "Login con Microsoft"}
          </Button>
        </Grid>
      </Grid>

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
    </Container>
  );
};

export default Login;