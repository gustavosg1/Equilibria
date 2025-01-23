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
  const [language, setLanguage] = useState('es-ES');
  const [isPsychologist, setIsPsychologist] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [isEndingCall, setIsEndingCall] = useState(false);
  const [transcription, setTranscription] = useState(''); // Estado para a transcrição em tempo real
  const transcriptionRef = useRef('');
  const recognitionRef = useRef(null); // Ref para o reconhecimento de fala
  const navigate = useNavigate();

  // Verifica papel do usuário
  useEffect(() => {
    const verifyRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const role = await checkUserRole(user.uid);
          setIsPsychologist(role === 'psychologist');
          
          // Busca o idioma apenas para usuários comuns
          if (role === 'user') {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const preferredLanguage = userDoc.data()?.preferredLanguage || 'es-ES';
            console.log('Idioma do usuário:', preferredLanguage); // Log para verificar
            setLanguage(preferredLanguage);
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
          startWithAudioMuted: true, // Inicia com microfone mudo
          startWithVideoMuted: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup'],
        }
      };
  
      jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
      
      // Habilita o microfone após inicializar o reconhecimento de fala
      jitsiApiRef.current.addListener('videoConferenceJoined', () => {
        setTimeout(() => {
          jitsiApiRef.current.executeCommand('toggleAudio'); // Desmuta o microfone
        }, 3000); // Atraso para sincronização
      });
  
      jitsiApiRef.current.addListener('readyToClose', () => {
        handleEndCall();
      });
  
      const isAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      if (!isPsychologist && isAPIAvailable) {
        console.log('Condições atendidas: !isPsychologist e API disponível');
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = language;
        recognition.continuous = true;
        recognition.interimResults = true;

        // Logs de erro e eventos
        recognition.onerror = (event) => {
          console.error('Erro no reconhecimento:', event.error);
        };
  
        recognition.onsoundstart = () => {
          console.log('Som detectado');
        };
  
        recognition.onnomatch = () => {
          console.log('Nenhuma correspondência de foa');
        };
  
        recognition.onstart = () => {
          console.log('Reconhecimento de fala iniciado');
        };
  
        recognition.onresult = (event) => {
          console.log('Resultado detectado:', event.results);
          
          // Mantenha a lógica de transcrição aqui!
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              transcript += result[0].transcript;
            }
          }
          transcriptionRef.current += ` ${transcript}`.trim();
          setTranscription(transcriptionRef.current); // Atualiza o estado
        };
  
        setTimeout(() => {
          recognition.start();
          recognitionRef.current = recognition;
        }, 1000); // Atraso para sincronização
  
      } else {
        console.warn('Reconocimineto no iniciado:', {
          isPsychologist,
          isAPIAvailable: 'SpeechRecognition' in window,
        });
      }
    };
  
    if (appointmentId) initializeJitsi();
  
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [appointmentId, isPsychologist, language]);

  // Finaliza chamada
  const handleEndCall = async () => {
    try {
      setIsEndingCall(true);
      
      // Destrói a instância do Jitsi
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }

      // Para o reconhecimento de fala
      if (recognitionRef.current) {
        recognitionRef.current.stop();
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
          <div id="jitsi-container" style={{ height: '80vh' }} /> {/* Reduzi a altura para dar espaço à transcrição */}
          <div className="transcription-container">
            <p>{transcription}</p> {/* Exibe a transcrição em tempo real */}
          </div>
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