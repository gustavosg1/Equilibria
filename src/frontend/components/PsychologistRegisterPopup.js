import React, { useState } from "react";
import ReactDOM from "react-dom";
import { GoogleAuthProvider, OAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../backend/config/FirebaseConfig";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import {
  TextField,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  IconButton,
  Select,
  MenuItem,
  Avatar,
  FormControl,
  InputLabel,
  Modal
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const PsychologistRegisterPopup = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [userName, setUserName] = useState("");
  const [cop, setCOP] = useState("");
  const [registry, setRegistry] = useState("");
  const [licencePhoto, setLicencePhoto] = useState(null)

  const [error, setError] = useState("");

  const db = getFirestore();
  const storage = getStorage();

  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleRegistryPhoto = (e) => {
    setLicencePhoto(e.target.files[0]);
  };

  
  // Função para criar o documento do usuário no Firestore
  const createUserDocument = async (user) => {
    
    let downloadURL = null;
    if (licencePhoto) {
      const storageRef = ref(storage, `licence-pictures/${user.uid}/${licencePhoto.name}`);
      await uploadBytes(storageRef, licencePhoto);
      downloadURL = await getDownloadURL(storageRef);
    }

    try {
      await setDoc(
        doc(db, "psychologist", user.uid),
        {          
          name: userName,
          email: email,
          COP: cop,
          licenceNumber: registry,
          licencePhotoURL: downloadURL || null,
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
                label="Nombre"
                type="name"
                variant="outlined"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                margin="normal"
            />
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
            <FormControl fullWidth>
              <InputLabel id="select-label">Selecciona tu COP</InputLabel>
              <Select
                  fullWidth
                  label="Select COP"
                  type="COP"
                  variant="outlined"
                  value={cop}
                  onChange={(e) => setCOP(e.target.value)}
                  margin="normal"
              >
                  <MenuItem value="Álava">Álava</MenuItem>
                  <MenuItem value="Andalucía Occidental">Andalucía Occidental</MenuItem>
                  <MenuItem value="Andalucía Oriental">Andalucía Oriental</MenuItem>
                  <MenuItem value="Aragón">Aragón</MenuItem>
                  <MenuItem value="Bizkaia">Bizkaia</MenuItem>
                  <MenuItem value="Cantabria">Cantabria</MenuItem>
                  <MenuItem value="Castilla-La Mancha">Castilla-La Mancha</MenuItem>
                  <MenuItem value="Castilla y León">Castilla y León</MenuItem>
                  <MenuItem value="Catalunya">Catalunya</MenuItem>
                  <MenuItem value="Ceuta">Ceuta</MenuItem>
                  <MenuItem value="Comunitat Valenciana">Comunitat Valenciana</MenuItem>
                  <MenuItem value="Extremadura">Extremadura</MenuItem>
                  <MenuItem value="Galicia">Galicia</MenuItem>
                  <MenuItem value="Gipuzkoa">Gipuzkoa</MenuItem>
                  <MenuItem value="Illes Balears">Illes Balears</MenuItem>
                  <MenuItem value="Madrid">Madrid</MenuItem>
                  <MenuItem value="Melilla">Melilla</MenuItem>
                  <MenuItem value="Navarra">Navarra</MenuItem>
                  <MenuItem value="Las Palmas">Las Palmas</MenuItem>
                  <MenuItem value="Principado de Asturias">Principado de Asturias</MenuItem>
                  <MenuItem value="Región de Murcia">Región de Murcia</MenuItem>
                  <MenuItem value="La Rioja">La Rioja</MenuItem>
                  <MenuItem value="Santa Cruz de Tenerife">Santa Cruz de Tenerife</MenuItem>
              </Select>
            </FormControl>
            <TextField
                fullWidth
                label="Número Registro COP"
                type="registro"
                variant="outlined"
                value={registry}
                onChange={(e) => setRegistry(e.target.value)}
                margin="normal"
            />
            <Box mt={2} mb={3} textAlign="center">
              <Button variant="contained" component="label">
                Subir ID
                <input type="file" hidden onChange={handleRegistryPhoto} />
              </Button>
              {licencePhoto && (
              <Box mt={2} textAlign="center">
                <Avatar
                  alt="Foto do Perfil"
                  src={URL.createObjectURL(licencePhoto)}
                  sx={{ width: 300, height: 100, borderRadius: 0, margin: 'auto' }}  
                />
                <p> Por favor, verifique si los datos de la targeta están legibles</p>
              </Box>
              )}
            </Box>

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

export default PsychologistRegisterPopup;