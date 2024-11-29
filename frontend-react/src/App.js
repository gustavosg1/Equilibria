import React from 'react';
import Login from './pages/Login'
import ProfilePage from './pages/ProfilePage'
import Especialistas from './pages/Especialistas'
import Especialista from './pages/Especialista'
import MisCitas from './pages/MisCitas'
import EvaluationPage from './pages/EvaluationPage'
import RotaProtegida from './components/RotaProtegida';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/Perfil" element={<RotaProtegida><ProfilePage /></RotaProtegida>}/>
                <Route path="/Especialistas" element={<RotaProtegida><Especialistas /></RotaProtegida>}/>
                <Route path="/Especialista" element={<RotaProtegida><Especialista /></RotaProtegida>}/>
                <Route path="/MisCitas" element={<RotaProtegida><MisCitas /></RotaProtegida>}/>
                <Route path="/Evaluacion" element={<RotaProtegida><EvaluationPage /></RotaProtegida>}/>
            </Routes> 
        </Router>
    );
}

export default App;