import React from 'react'
import './styles/Menu.css'
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/FirebaseConfig'

function Menu(){

    const navigate = useNavigate();

    async function HandleLogout(){

        try{
            await signOut(auth);
            navigate("/");
        }
        catch (error)   {
            console.error("Error al hacer logout", error);
        }
    }
    

    return(
        <div>
            <header className="header">
            <div className="logo">
                {/* Replace with actual logo path */}
                <img src="logo.png" alt="Logo" />
            </div>
            <nav className="nav">
                <ul>
                <li><Link to="/Perfil">Home</Link></li>
                <li><Link to="/Especialistas">Especialistas</Link></li>
                <li><Link to="/MisCitas">Mis Citas</Link></li>
                <li><a href="#">Chat</a></li>
                <li style={{ cursor: 'pointer' }} onClick={HandleLogout}>Salir</li>
                </ul>
            </nav>
            </header>
        </div>
    )
}

export default Menu;



