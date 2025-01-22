import React, { useState } from "react";
import { GoogleAuthProvider, OAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { auth } from "../../firebase/FirebaseConfig.js";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Container, Grid, Typography, Box } from "@mui/material";
import AccountTypePopup from "../components/AccountTypePopup.js";
import ClientRegisterPopup from "../components/ClientRegisterPopup.js";
import PsychologistRegisterPopup from "../components/PsychologistRegisterPopup.js";
import { getDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAccountTypePopup, setAccountTypePopup] = useState(false);
  const [showClientRegisterPopup, setClientRegisterPopup] = useState(false);
  const [showPsychologistRegisterPopup, setPsychologistRegisterPopup] = useState(false);
  const navigate = useNavigate();
  const db = getFirestore();

  // Criação do documento do usuário no Firestore
  const createUserDocument = async (user) => {
    try {
      // Cria ou atualiza o documento do usuário na coleção "users"
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
      }, { merge: true });
      console.log("Documento do usuário criado/atualizado no Firestore.");
    } catch (error) {
      console.error("Erro ao criar documento no Firestore: ", error);
    }
  };

  //Send user to the correct form according to their choice
  const handleSelection = (type) => {
    if (type == "client"){
      setClientRegisterPopup(true)
      setAccountTypePopup(false)
    }
    if (type == "psychologist"){
      setPsychologistRegisterPopup(true)
      setAccountTypePopup(false)      
    }
  }

  // Login com Email e Senha
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Usuário logado com email:", userCredential.user);
      const user = userCredential.user;

      const psychologistDoc = await getDoc(doc(db, "psychologist", user.uid));
      if (psychologistDoc.exists()) { // O usuário é um psicólogo
        console.log("Usuário logado como psicolgo:", userCredential.user);
        navigate("/Dashboard");

      } else {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) { // O usuário é um cliente
          navigate("/Perfil");
        }
      }
      
    } catch (error) {
      console.error("Erro ao fazer login com email:", error);
    }
  };

  // Login com Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Usuário logado com Google:", result.user);

      // Criar documento no Firestore para o usuário logado
      await createUserDocument(result.user);

      navigate("/Perfil");
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
    }
  };

  // Login com Microsoft
  const handleMicrosoftLogin = async () => {
    const provider = new OAuthProvider("microsoft.com");
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Usuário logado com Microsoft:", result.user);

      // Criar documento no Firestore para o usuário logado
      await createUserDocument(result.user);

      navigate("/Perfil");
    } catch (error) {
      console.error("Erro ao fazer login com Microsoft:", error);
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
            <Typography variant="h5" component="h2" gutterBottom>
              Tu Apoyo Psicológico, Paso a Paso
            </Typography>
            <Typography variant="body1" paragraph>
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
            onClick={handleGoogleLogin}
          >
            Login con Google
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleMicrosoftLogin}
          >
            Login con Microsoft
          </Button>
        </Grid>
      </Grid>

      {showAccountTypePopup && (
        <AccountTypePopup onClose={() => setAccountTypePopup(false)} onSelect={handleSelection}/>
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