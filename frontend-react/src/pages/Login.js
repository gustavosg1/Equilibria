import React, { useState } from "react";
import "./styles/Login.css";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, OAuthProvider, signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/FirebaseConfig";
import RegisterPopup from "../components/RegisterPopup"; // Novo componente de registro

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const navigate = useNavigate();

  // Login com Email e Senha
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Usuário logado com email:", userCredential.user);
      navigate("/ProfilePage");
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
      navigate("/ProfilePage");
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
      navigate("/ProfilePage");
    } catch (error) {
      console.error("Erro ao fazer login com Microsoft:", error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-section">
          <img src="/images/Logo.png" alt="Equilibria Logo" className="logo" />
          <h2>Bienvenido a Equilibria</h2>
          <form onSubmit={handleEmailLogin}>
            <input
              type="email"
              placeholder="Please login to your account"
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
            <button type="submit" className="login-button">
              Iniciar sesión
            </button>
          </form>
          <a href="/forgot-password" className="forgot-password">
            ¿Has olvidado la contraseña?
          </a>
        </div>
        <div className="info-section">
          <h2>Tu Apoyo Psicológico, Paso a Paso</h2>
          <p>
            Equilibria es una plataforma online que conecta a personas con psicólogos cualificados de manera fácil y segura. Ofrecemos consultas virtuales adaptadas a tus necesidades, permitiendo elegir al profesional que mejor se ajuste a tu situación. Para empezar, simplemente crea una cuenta, explora los perfiles de nuestros psicólogos y agenda tu consulta en el horario que prefieras. Todas las sesiones se realizan de manera segura, garantizando confidencialidad, comodidad desde cualquier lugar. Nuestro objetivo es facilitar el acceso a un apoyo psicológico de calidad.
          </p>
          <button className="signup-button" onClick={() => setShowRegisterPopup(true)}>Crear nueva cuenta</button>
        </div>
        <div className="social-login-section">
          <button onClick={handleGoogleLogin} className="google-login-button">
            Login con Google
          </button>
          <button onClick={handleMicrosoftLogin} className="microsoft-login-button">
            Login con Microsoft
          </button>
        </div>
      </div>
      {showRegisterPopup && <RegisterPopup onClose={() => setShowRegisterPopup(false)} />}
    </div>
  );
};

export default Login;
