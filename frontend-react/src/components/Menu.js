import React from 'react'
import './styles/Menu.css'
import { Link } from 'react-router-dom';

function Menu(){
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
                </ul>
            </nav>
            </header>
        </div>
    )
}

export default Menu;



