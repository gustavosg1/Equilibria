import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./styles/RegisterPopup.css";
import { GoogleAuthProvider, OAuthProvider, signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/FirebaseConfig";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const RegisterPopup = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const db = getFirestore();

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

      onClose();
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
    <div className="register-popup">
      <div className="register-popup-content">
        <button className="close-button" onClick={onClose}>X</button>
        <div className="heading-container">
          <h2 className="crear-cuenta-heading">Crear Nueva Cuenta</h2>
          <img src="/images/bien-venido.png" alt="Bien Venido" className="crear-cuenta" />
        </div>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleRegister}>
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirmar Contraseña"
            className="input-field"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" className="register-button">Registrar</button>
        </form>
        <div className="social-login-section">
          <button onClick={handleGoogleLogin} className="google-login-button">
            Registrar con
            <img src="/images/google-logo.png" alt="Google Icon" className="google-icon" />
          </button>
          <button onClick={handleMicrosoftLogin} className="microsoft-login-button">
            Registrar con <img src="/images/microsoft-logo.png" alt="Microsoft Icon" className="microsoft-icon" />
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("register-popup-root")
  );
};

export default RegisterPopup;