import React from 'react';
import './styles/MisCitas.css';
import Menu from '../components/Menu';

const appointments = [
  {
    psychologist: {
      name: "Marco Fernandez",
      imgSrc: "images/psicolog.png", // Replace with actual image path or URL
    },
    date: "16/10/2024",
    time: "15:00",
  },
  // More appointments can be added here
];

const AppointmentCard = ({ appointment }) => (
  <div className="appointment-card">
    <img src={appointment.psychologist.imgSrc} alt={`${appointment.psychologist.name}`} className="psychologist-image" />
    <div className="appointment-info">
      <p><strong>Psicologo:</strong> {appointment.psychologist.name}</p>
      <p><strong>Fecha:</strong> {appointment.date}</p>
      <p><strong>Hora:</strong> {appointment.time}</p>
      <button className="video-session-button">Empezar Videoconferencia</button>
      <button className="cancel-button">Anular</button>
    </div>
  </div>
);

const MisCitas = () => {
  return (
    <div className="app-container">
      <Menu/>

      <div className="appointments-container">
        <div className="tabs">
          <button className="tab-button">Citas Futuras</button>
          <button className="tab-button">Citas Pasadas</button>
        </div>
        <div className="appointment-list">
          {appointments.map((appointment, index) => (
            <AppointmentCard key={index} appointment={appointment} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MisCitas;