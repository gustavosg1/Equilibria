import React from 'react';
import './styles/Especialista.css'; 
import Menu from '../components/Menu'

const psychologists = [
  {
    name: "Marco Fernandez",
    license: "COP: MP 3902",
    description: "Hola, soy Marco y aquí pongo una descripción mía. Aquí hablo de mi experiencia, mis estudios, mis certificaciones, mis especialidades y lo que se me ocurra.",
    price: 40,
    imgSrc: "images/psicolog.png", // Replace with actual image path or URL
    availability: [
      { day: "Hoy", slots: ["21:30"] },
      { day: "Mañana", slots: ["19:00", "20:00"] },
      { day: "12/10", slots: [] },
      { day: "13/10", slots: [] },
      { day: "14/10", slots: [] },
      { day: "15/10", slots: [] },
      { day: "16/10", slots: ["--"] },
      { day: "17/10", slots: ["--"] },
      { day: "18/10", slots: ["--"] }
    ]
  },
  // More psychologists can be added here
];

const PsychologistCard = ({ psychologist }) => (
  <div className="psychologist-card-detail">
    <img src={psychologist.imgSrc} alt={`${psychologist.name}`} className="psychologist-image" />
    <div className="psychologist-info-detail">
      <h3>{psychologist.name}</h3>
      <p>{psychologist.license}</p>
      <div className="availability-table">
        <table>
          <thead>
            <tr>
              {psychologist.availability.map((day, index) => (
                <th key={index}>{day.day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {psychologist.availability.map((day, index) => (
                <td key={index}>{day.slots.length > 0 ? day.slots.join(", ") : "--"}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p>{psychologist.description}</p>
      <p><strong>${psychologist.price}.00/h</strong></p>
    </div>
  </div>
);

const Especialista = () => {
  return (
    <div className="app-container">
      <Menu/>
      <div className="psychologist-list-detail">
        {psychologists.map((psychologist, index) => (
          <PsychologistCard key={index} psychologist={psychologist} />
        ))}
      </div>
    </div>
  );
};

export default Especialista;
