import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./styles/RegisterPopup.css";
import { GoogleAuthProvider, OAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/FirebaseConfig";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import {
  TextField,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  IconButton,
  Modal
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const ClientRegisterPopup = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const db = getFirestore();
  const [showConfirmation, setShowConfirmation] = useState(false)

  // Função para criar o documento do usuário no Firestore
  const createUserDocument = async (user) => {
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
        },
        { merge: true }
      );
      console.log("Documento do usuário criado/atualizado no Firestore.");
    } catch (error) {
      console.error("Erro ao criar documento no Firestore: ", error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    if (!/(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{6,}/.test(password)) {
      setError("A senha deve ter ao menos 6 caracteres, um caractere especial, uma letra maiúscula e um número");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Usuário registrado:", userCredential.user);

      // Criar documento no Firestore para o usuário registrado
      await createUserDocument(userCredential.user);
      
      setShowConfirmation(true);
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      setError("Erro ao registrar. Tente novamente.");
    }
  };

  // Login com Google
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Usuário registrado com Google:", result.user);
      // Criar documento no Firestore para o usuário registrado
      await createUserDocument(result.user);
      onClose();
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      setError("Erro ao registrar com Google. Tente novamente.");
    }
  };

  // Login com Microsoft
  const handleMicrosoftLogin = async () => {
    const provider = new OAuthProvider("microsoft.com");
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Usuário registrado com Microsoft:", result.user);

      // Criar documento no Firestore para o usuário registrado
      await createUserDocument(result.user);

      onClose();
    } catch (error) {
      console.error("Erro ao fazer login com Microsoft:", error);
      setError("Erro ao registrar com Microsoft. Tente novamente.");
    }
  };

  return ReactDOM.createPortal(
    <Dialog open={true} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Crear Nueva Cuenta</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box textAlign="center" mb={2}>
          <img src="/images/bien-venido.png" alt="Bien Venido" style={{ maxWidth: "40%" }} />
        </Box>
        {error && (
          <Typography color="error" variant="body2" gutterBottom>
            {error}
          </Typography>
        )}
        <form onSubmit={handleRegister}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirmar Contraseña"
            type="password"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, mb: 2 }}
          >
            Registrar
          </Button>
        </form>
        <Box textAlign="center" mt={2}>
          <Button
            variant="outlined"
            color="error"
            fullWidth
            onClick={handleGoogleLogin}
            startIcon={<img src="/images/google-logo.png" alt="Google Icon" style={{ width: 20 }} />}
            sx={{ mb: 1 }}
          >
            Registrar con Google
          </Button>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handleMicrosoftLogin}
            startIcon={<img src="/images/microsoft-logo.png" alt="Microsoft Icon" style={{ width: 20 }} />}
          >
            Registrar con Microsoft
          </Button>
        </Box>
      </DialogContent>

      <Modal
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        aria-labelledby="modal-sucesso-titulo"
        aria-describedby="modal-sucesso-descricao"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography id="modal-sucesso-titulo" variant="h6" component="h2">
            Éxito
          </Typography>
          <Typography id="modal-sucesso-descricao" sx={{ mt: 2 }}>
            Cuenta creada con êxito.
            Ya puedes hacer login.
          </Typography>
          <Box mt={3} textAlign="center">
            <Button
              variant="contained"
              onClick={() => {
                setShowConfirmation(false);
                onClose();
              }}>
              OK
            </Button>
          </Box>
        </Box>
      </Modal>
    </Dialog>,
    document.getElementById("register-popup-root")

    
  );
};

export default ClientRegisterPopup; 