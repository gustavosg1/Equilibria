import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
} from '@mui/material';
import Review from './Review';
import Summary from './Summary';

const Videoconference = ({ psychologistId, onEnd }) => {
  const [transcription, setTranscription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [recognition, setRecognition] = useState(null);
  const [isPsychologist, setIsPsychologist] = useState(false);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const uid = user.uid;

          // Check if the user is a psychologist
          const psychologistDoc = await getDoc(doc(db, 'psychologist', uid));
          if (psychologistDoc.exists()) {
            setIsPsychologist(true);
            return;
          }

          // Check if the user is a client
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            setIsPsychologist(false);
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, [auth, db]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const idiomasCollection = collection(db, 'idiomas');
        const idiomasSnapshot = await getDocs(idiomasCollection);
        const idiomasList = idiomasSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLanguages(idiomasList);
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };

    fetchLanguages();
  }, [db]);

  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      const domain = 'meet.jit.si';
      const options = {
        roomName: psychologistId || 'default-room',
        parentNode: document.getElementById('jaas-container'),
      };

      const container = document.getElementById('jaas-container');
      if (container) {
        container.innerHTML = '';
      }

      const api = new window.JitsiMeetExternalAPI(domain, options);

      api.addListener('readyToClose', () => {
        setShowReview(!isPsychologist);
        setShowSummary(isPsychologist);
        if (onEnd) onEnd();
      });

      api.addListener('error', (error) => {
        console.error('Error in Jitsi Meet API:', error);
      });

      setJitsiLoaded(true);
    } else {
      console.error('Jitsi Meet API not loaded. Check the script.');
    }
  }, [psychologistId, isPsychologist, onEnd]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      const newRecognition = new SpeechRecognition();
      newRecognition.interimResults = true;
      newRecognition.continuous = true;

      newRecognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('');
        setTranscription(transcript);
      };

      newRecognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      setRecognition(newRecognition);
    } else {
      console.error('Speech Recognition API not supported by this browser.');
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      recognition.lang = selectedLanguage;
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      setIsListening(false);
      recognition.stop();
    }
  };

  return (
    <Box style={{ height: '100vh', width: '100%' }}>
      {showReview && <Review roomId={psychologistId} />}
      {showSummary && <Summary roomId={psychologistId} />}
      {!showReview && !showSummary && (
        <div
          id="jaas-container"
          style={{
            height: '80%',
            width: '100%',
            border: '1px solid black',
            display: jitsiLoaded ? 'block' : 'none',
          }}
        ></div>
      )}
      {isPsychologist && languages.length > 0 && (
        <Box
          style={{
            padding: '1rem',
            backgroundColor: '#f4f4f4',
            height: '20%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h5">Reconocimiento de Voz</Typography>
          <FormControl fullWidth>
            <InputLabel id="select-language-label">Seleccione un idioma</InputLabel>
            <Select
              labelId="select-language-label"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {languages.map((language) => (
                <MenuItem key={language.id} value={language.code}>
                  {language.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box display="flex" gap="1rem" marginTop="1rem">
            <Button
              variant="contained"
              color="primary"
              onClick={startListening}
              disabled={isListening}
            >
              Empezar Reconocimiento
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={stopListening}
              disabled={!isListening}
            >
              Detener Reconocimiento
            </Button>
          </Box>
          <Typography variant="body1" style={{ marginTop: '1rem' }}>
            {transcription || 'Diga algo para empezar...'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Videoconference;