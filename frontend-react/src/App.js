import React from 'react';
import Login from './pages/Login'
import ProfilePageClient from './pages/ProfilePageClient'
import Especialistas from './pages/Especialistas'
import Especialista from './pages/Especialista'
import MisCitas from './pages/MisCitas'
import RotaProtegida from './components/RotaProtegida';
import ProfilePagePsychologist from './pages/ProfilePagePsychologist';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/Perfil" element={<RotaProtegida><ProfilePageClient /></RotaProtegida>}/>
                <Route path="/Especialistas" element={<RotaProtegida><Especialistas /></RotaProtegida>}/>
                <Route path="/Especialista" element={<RotaProtegida><Especialista /></RotaProtegida>}/>
                <Route path="/MisCitas" element={<RotaProtegida><MisCitas /></RotaProtegida>}/>
                <Route path="/Dashboard" element={<RotaProtegida> <ProfilePagePsychologist/></RotaProtegida>}/>
            </Routes> 
        </Router>
    );
}

export default App;