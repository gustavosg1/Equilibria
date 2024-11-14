import React from 'react';
import Login from './pages/Login'
import ProfilePage from './pages/ProfilePage'
import Especialistas from './pages/Especialistas'
import Especialista from './pages/Especialista'
import MisCitas from './pages/MisCitas'
import EvaluationPage from './pages/EvaluationPage'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/Perfil" element={<ProfilePage />} />
                <Route path="/Especialistas" element={<Especialistas />} />
                <Route path="/Especialista" element={<Especialista />} />
                <Route path="/MisCitas" element={<MisCitas />} />
                <Route path="/Evaluacion" element={<EvaluationPage />} />
            </Routes> 
        </Router>
    );
}

export default App;