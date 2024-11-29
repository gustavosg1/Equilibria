import React, { useState } from "react";
import "./styles/Login.css";
import { useNavigate } from "react-router-dom";
import {  GoogleAuthProvider,  OAuthProvider,  signInWithPopup,  signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/FirebaseConfig";
import RegisterPopup from "../components/RegisterPopup";
import { Button, Form, Container, Row, Col } from "react-bootstrap";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
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


  // Login com Email e Senha
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Usuário logado com email:", userCredential.user);


      // Criar documento no Firestore para o usuário logado
      await createUserDocument(userCredential.user);

      navigate("/Perfil");
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
    <Container fluid className="login-page">
      <Row className="justify-content-center align-items-center vh-100">
        <Col md={6} lg={4}>
          <div className="text-center mb-4">
            <img
              src="/images/Logo.png"
              alt="Equilibria Logo"
              className="mb-3"
              style={{ maxWidth: "150px" }}
            />
            <h2>Bienvenido a Equilibria</h2>
          </div>
          <Form onSubmit={handleEmailLogin}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Control
                type="email"
                placeholder="Please login to your account"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Control
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mb-3">
              Iniciar sesión
            </Button>
          </Form>
          <div className="text-center">
            <a href="/forgot-password" className="text-decoration-none">
              ¿Has olvidado la contraseña?
            </a>
          </div>
        </Col>

        <Col md={6} lg={4} className="info-section mt-5 mt-md-0">
          <h2>Tu Apoyo Psicológico, Paso a Paso</h2>
          <p>
            Equilibria es una plataforma online que conecta a personas con
            psicólogos cualificados de manera fácil y segura. Ofrecemos
            consultas virtuales adaptadas a tus necesidades, permitiendo elegir
            al profesional que mejor se ajuste a tu situación. Para empezar,
            simplemente crea una cuenta, explora los perfiles de nuestros
            psicólogos y agenda tu consulta en el horario que prefieras. Todas
            las sesiones se realizan de manera segura, garantizando
            confidencialidad, comodidad desde cualquier lugar. Nuestro objetivo
            es facilitar el acceso a un apoyo psicológico de calidad.
          </p>
          <Button
            variant="success"
            className="w-100 mt-3"
            onClick={() => setShowRegisterPopup(true)}
          >
            Crear nueva cuenta
          </Button>
        </Col>

        <Col xs={12} className="social-login-section mt-4 text-center">
          <Button
            variant="outline-danger"
            className="me-2"
            onClick={handleGoogleLogin}
          >
            Login con Google
          </Button>
          <Button variant="outline-primary" onClick={handleMicrosoftLogin}>
            Login con Microsoft
          </Button>
        </Col>
      </Row>

      {showRegisterPopup && (
        <RegisterPopup onClose={() => setShowRegisterPopup(false)} />
      )}
    </Container>
  );
};

export default Login;
