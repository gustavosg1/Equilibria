import React, { useEffect, useRef, useState } from 'react';
import { FaPhoneSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { checkUserRole } from '../../backend/services/userService';
import { updateAppointmentStatus, saveCallTranscription } from '../../backend/services/appointmentService';
import { auth } from '../../backend/config/FirebaseConfig';
import Review from './Review';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../backend/config/FirebaseConfig';
import './Videoconference.css';

const Videoconference = ({ appointmentId, psychologistId }) => {
  const jitsiApiRef = useRef(null);
  const [language, setLanguage] = useState('en-US');
  const [isPsychologist, setIsPsychologist] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const transcriptionRef = useRef('');
  const navigate = useNavigate();

  // Verifica papel do usuário
  useEffect(() => {
    const verifyRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const role = await checkUserRole(user.uid);
          setIsPsychologist(role === 'psychologist');
          
          if (role === 'user') {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            setLanguage(userDoc.data()?.preferredLanguage || 'en-US');
          }
        }
      } catch (error) {
        console.error(error.message);
      }
    };
    
    verifyRole();
  }, []);

  // Configura Jitsi Meet
  useEffect(() => {
    const initializeJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        console.error('Jitsi API não carregada');
        return;
      }

      const domain = 'meet.jit.si';
      const options = {
        roomName: `terapia-${appointmentId}-${Date.now()}`,
        parentNode: document.getElementById('jitsi-container'),
        configOverwrite: {
          disableSimulcast: true,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup'],
        }
      };

      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      
      jitsiApiRef.current.addListener('readyToClose', () => {
        handleEndCall();
      });
    };

    if (appointmentId) initializeJitsi();

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [appointmentId]);

  // Configura reconhecimento de voz
  useEffect(() => {
    if (!isPsychologist && 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
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

      recognition.start();
      return () => recognition.stop();
    }
  }, [isPsychologist, language]);

  // Finaliza chamada
  const handleEndCall = async () => {
    try {
      setIsEndingCall(true);
      
      // Destrói a instância do Jitsi
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }

      // Atualiza status do agendamento
      await updateAppointmentStatus(appointmentId, false);

      // Redireciona ou mostra review
      if (isPsychologist) {
        navigate('/Dashboard');
      } else {
        await saveCallTranscription(appointmentId, transcriptionRef.current);
        setShowReview(true);
      }
    } catch (error) {
      console.error('Erro ao finalizar chamada:', error.message);
    } finally {
      setIsEndingCall(false);
    }
  };

  return (
    <div className="videoconference-container">
      {!showReview ? (
        <>
          <div id="jitsi-container" style={{ height: '90vh' }} />
          <div className="call-controls">
            <button 
              onClick={handleEndCall} 
              className="end-call-button"
              disabled={isEndingCall}
            >
              <FaPhoneSlash />
              {isEndingCall ? 'Finalizando...' : 'Terminar Videollamada'}
            </button>
          </div>
        </>
      ) : (
        <Review psychologistId={psychologistId} />
      )}
    </div>
  );
};

export default Videoconference;