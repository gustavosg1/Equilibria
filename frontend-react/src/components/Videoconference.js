import React, { useEffect, useRef, useState } from 'react';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Summary from './Summary';
import Review from './Review';
import { FaPhoneSlash } from 'react-icons/fa';


const Videoconference = ({ appointmentId }) => {
  const jitsiApiRef = useRef(null);
  const [language, setLanguage] = useState('en-US');
  const [isPsychologist, setIsPsychologist] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const transcriptionRef = useRef('');
  const db = getFirestore();
  const auth = getAuth();

  // Verifica o papel do usuário
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userLanguage = userDoc.data().preferredLanguage || 'en-US';
            setLanguage(userLanguage);
            setIsPsychologist(userDoc.data().role === 'psychologist');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar papel do usuário:', error);
      }
    };

    checkUserRole();
  }, [auth, db]);

  // Inicializa o Jitsi Meet
  useEffect(() => {
    if (!jitsiApiRef.current && window.JitsiMeetExternalAPI) {
      const domain = 'meet.jit.si';
      const options = {
        roomName: `room-${appointmentId || Date.now()}`,
        parentNode: document.getElementById('jaas-container'),
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup'],
        },
      };

      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
    } else if (!window.JitsiMeetExternalAPI) {
      console.error('Jitsi Meet API não foi carregada corretamente.');
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [appointmentId]);

  // Configura o reconhecimento de fala
  useEffect(() => {
    if (!isPsychologist && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            transcript += result[0].transcript;
          }
        }

        transcriptionRef.current += ` ${transcript}`.trim();
      };

      recognition.onerror = (event) => {
        console.error('Erro no reconhecimento de fala:', event.error);
      };

      recognition.start();

      return () => {
        recognition.stop();
      };
    }
  }, [isPsychologist, language]);

  // Salva a transcrição no Firestore
  const saveTranscription = async () => {
    try {
      if (!appointmentId) {
        console.error('ID do appointment não foi fornecido.');
        return;
      }
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, { transcription: transcriptionRef.current });
      console.log('Transcrição salva com sucesso:', transcriptionRef.current);
    } catch (error) {
      console.error('Erro ao salvar a transcrição:', error);
    }
  };

  // Finaliza a videoconferência
  const handleEndCall = async () => {
    if (!isPsychologist) {
      await saveTranscription();
      setShowReview(true);
    } else {
      setShowSummary(true);
    }
  };

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {!showSummary && !showReview && (
        <>
          <div id="jaas-container" style={{ height: '90%', width: '100%' }}></div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center', // Centraliza horizontalmente
                alignItems: 'center', // Centraliza verticalmente
                height: '10%', // Define a altura do contêiner para centralizar
              }}
            >
              <button
                onClick={handleEndCall}
                style={{
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  backgroundColor: '#ff0000', // Cor de fundo vermelha
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem', // Espaçamento entre o ícone e o texto
                }}
              >
                <FaPhoneSlash /> {/* Ícone de telefone */}
                TERMINAR VIDEOLLAMADA
              </button>
            </div>
        </>
      )}

      {showSummary && <Summary appointmentId={appointmentId} />}
      {showReview && <Review appointmentId={appointmentId} />}
    </div>
  );
};

export default Videoconference;