import React from 'react';
import './styles/ProfilePage.css';
import Menu from '../components/Menu';

function ProfilePage() {
  return (
    <div className="profile-page">
      
      <Menu/>

      {/* Main Profile Section */}
      <div className="main-section">
        {/* User Information Sidebar */}
        <aside className="sidebar">
          <div className="profile-info">
            <img
              src="images/editar-perfil.png"
              alt="Gustavo"
              className="profile-picture"
            />
            <ul className="profile-options">
              <li><button>Editar Perfil</button></li>
              <li><button>Formas de Pago</button></li>
              <li><button>Mis Reseñas</button></li>
            </ul>
          </div>
        </aside>

        {/* Main Content Section */}
        <div className="content">
          <h1>Bienvenido, Gustavo.</h1>
          <div className="next-appointments">
            <h3>Mis Próximas Citas:</h3>
            <div className="appointments-list">
              {/* Appointment data will be rendered here */}
              <p>No hay citas programadas.</p>
            </div>
          </div>
        </div>

        {/* Mascot Image */}
        <div className="mascot">
          <img
            src="images/bien-venido.png"
            alt="Mascot"
            className="mascot-image"
          />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;