import React from "react";
import "./styles/Login.css";
import Logo from "./images/Logo.png"

const Login = () => {
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-section">
          <img
            src= {Logo}
            alt="Equilibria Logo"
            className="logo"
          />
          <h2>Bienvenido a Equilibria</h2>
          <form>
            <input type="text" placeholder="Please login to your account" className="input-field" />
            <input type="password" placeholder="Contraseña" className="input-field" />
            <button type="submit" className="login-button">
                Iniciar sesión
            </button>
          </form>
          <a href="/forgot-password" className="forgot-password">¿Has olvidado la contraseña?</a>
        </div>
        <div className="info-section">
          <h2>Tu Apoyo Psicológico, Paso a Paso</h2>
          <p>
            Equilibria es una plataforma online que conecta a personas con psicólogos cualificados de
            manera fácil y segura. Ofrecemos consultas virtuales adaptadas a tus necesidades, permitiendo
            elegir al profesional que mejor se ajuste a tu situación. Para empezar, simplemente crea una
            cuenta, explora los perfiles de nuestros psicólogos y agenda tu consulta en el horario que prefieras.
            Todas las sesiones se realizan de manera segura, garantizando confidencialidad, comodidad desde
            cualquier lugar. Nuestro objetivo es facilitar el acceso a un apoyo psicológico de calidad.
          </p>
          <button className="signup-button">Crear nueva cuenta</button>
        </div>
      </div>
    </div>
  );
};

export default Login;