import React, { useState } from 'react';
import './styles/Chat.css'; // Assuming you have a CSS file for styling

// ChatCard component represents the chat window
// It takes the psychologist's information and a callback function to close the chat
const ChatCard = ({ psychologist, onClose }) => (
  <div className="chat-card">
    <div className="chat-header">
      <h3>Chat</h3>
      {/* Button to close the chat window */}
      <button className="close-chat-button" onClick={onClose}>X</button>
    </div>
    <div className="chat-message">
      {/* Psychologist's image in the chat window */}
      <img src={psychologist.imgSrc} alt={`${psychologist.name}`} className="chat-psychologist-image" />
      <div className="chat-info">
        <p><strong>{psychologist.name}</strong></p>
        <p>Hola, ¿cómo estás...?</p>
      </div>
    </div>
  </div>
);

export default ChatCard