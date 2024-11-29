import React, { useState } from 'react';
import './styles/EvaluationPage.css';
import Menu from '../components/Menu'

// Component for rating the video call quality
const RatingCard = () => {
  const [rating, setRating] = useState(0);

  // Function to handle rating selection
  const handleRating = (value) => {
    setRating(value);
  };

  return (
    <div className="rating-card">
      <p>Como evaluas la calidad de la videollamada?</p>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((value) => (
          <span
            key={value}
            className={`star ${value <= rating ? 'selected' : ''}`}
            onClick={() => handleRating(value)}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );
};

// Component for summary options
const SummaryOptions = () => (
  <div className="summary-options">
    <h3>Opciones de resumen:</h3>
    <button className="summary-button">Texto completo</button>
    <button className="summary-button">Resumen automatico</button>
    <button className="summary-button">Bullet points</button>
    <button className="summary-button">Palabras clave</button>
  </div>
);

// Main component that includes RatingCard and SummaryOptions
const EvaluationPage = () => (
  <div className="app-container">
    <Menu />
    <div className="evaluation-container">
      <RatingCard />
      <SummaryOptions />
    </div>
  </div>
);

export default EvaluationPage;