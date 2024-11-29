import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../firebase/Authentication';

function RotaProtegida({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" />; // Redireciona para a página de login se não estiver autenticado
  }

  return children;
}

export default RotaProtegida;