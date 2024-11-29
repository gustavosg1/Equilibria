import React from 'react';
import './styles/Especialistas.css';
import Menu from '../components/Menu'

const psychologists = [
  {
    name: "Marco Fernandez",
    license: "COP: MP 3902",
    description: "Hola, soy Marco y aquí pongo una descripción mía. Aquí hablo de mi experiencia, mis estudios, mis certificaciones, mis especialidades y lo que se me ocurra.",
    price: 40,
    imgSrc: "images/psicolog.png" // Replace with actual image path or URL
  },
  // More psychologists can be added here
];

const PsychologistCard = ({ psychologist }) => (
  <div className="psychologist-card">
    <img src={psychologist.imgSrc} alt={`${psychologist.name}`} className="psychologist-image" />
    <div className="psychologist-info">
      <h3>{psychologist.name}</h3>
      <p>{psychologist.license}</p>
      <p>{psychologist.description}</p>
      <p><strong>${psychologist.price}.00/h</strong></p>
    </div>
  </div>
);

const Especialistas = () => {
  return (
    <div className="app-container">
      <Menu/>
      <div className="search-container">
        <input type="text" placeholder="Buscar..." className="search-bar" />
        <div className="filters">
          <select>
            <option>Precio</option>
            {/* More price options */}
          </select>
          <select>
            <option>Especialidad</option>
            {/* More specialties */}
          </select>
          <select>
            <option>Idioma</option>
            {/* More language options */}
          </select>
        </div>
      </div>

      <div className="psychologist-list">
        {psychologists.map((psychologist, index) => (
          <PsychologistCard key={index} psychologist={psychologist} />
        ))}
      </div>
    </div>
  );
};

export default Especialistas;