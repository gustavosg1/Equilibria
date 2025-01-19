import React, { useEffect, useRef, useState } from 'react';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Summary from './Summary';
import Review from './Review';

const Videoconference = ({ appointmentId }) => {
  const jitsiApiRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en-US');
  const [isPsychologist, setIsPsychologist] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const transcriptionRef = useRef('');
  const [transcription, setTranscription] = useState('');
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
            setIsPsychologist(false);
          } else {
            setIsPsychologist(true);
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
      const domain = '8x8.vc';
      const options = {
        roomName: `room-${appointmentId || Date.now()}`, // Nome dinâmico para a sala
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

      // Listener para o evento de saída da videoconferência
      jitsiApiRef.current.addListener('videoConferenceLeft', () => {
        console.log('Videoconferência encerrada.');
        saveTranscription();
        if (isPsychologist) {
          setShowSummary(true);
        } else {
          setShowReview(true);
        }
      });
    } else if (!window.JitsiMeetExternalAPI) {
      console.error('Jitsi Meet API não foi carregada corretamente.');
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [appointmentId, isPsychologist]);

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
        setTranscription(transcriptionRef.current);

        console.log('Texto reconhecido no evento:', transcript);
        console.log('Texto total atualizado:', transcriptionRef.current);
      };

      recognition.onerror = (event) => {
        console.error('Erro no reconhecimento de fala:', event.error);
      };

      recognition.start();
      setIsListening(true);

      return () => {
        recognition.stop();
        setIsListening(false);
      };
    }
  }, [isPsychologist, language]);

  // Salva a transcrição na coleção `appointments`
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

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      {!showSummary && !showReview && (
        <>
          <div id="jaas-container" style={{ height: '70%', width: '100%' }}></div>
          <div style={{ padding: '1rem', backgroundColor: '#f4f4f4', height: '30%', overflowY: 'auto' }}>
            <h3>Transcrição:</h3>
            <p>{transcription || 'Aguardando fala...'}</p>
          </div>
        </>
      )}

      {showSummary && <Summary appointmentId={appointmentId} />}
      {showReview && <Review appointmentId={appointmentId} />}
    </div>
  );
};

export default Videoconference;