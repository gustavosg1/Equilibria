import React, { useEffect, useRef, useState } from 'react';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Summary from './Summary'; // Certifique-se de que os caminhos estão corretos
import Review from './Review'; // Certifique-se de que os caminhos estão corretos

const Videoconference = ({ psychologistId }) => {
    const jitsiApiRef = useRef(null); // Referência para a instância do Jitsi
    const [transcription, setTranscription] = useState(''); // Para exibir a transcrição
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const [language, setLanguage] = useState('en-US'); // Idioma selecionado
    const [languages, setLanguages] = useState([]); // Lista de idiomas do Firestore
    const [isPsychologist, setIsPsychologist] = useState(false); // Verificação do papel do usuário
    const [showSummary, setShowSummary] = useState(false); // Controla exibição do componente Summary
    const [showReview, setShowReview] = useState(false); // Controla exibição do componente Review
    const db = getFirestore();
    const auth = getAuth();

    // Verifica se o usuário faz parte da coleção `psychologist`
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDoc = await getDoc(doc(db, 'psychologist', user.uid));
                    if (userDoc.exists()) {
                        console.log('Usuário é um psicólogo');
                        setIsPsychologist(true); // Define o estado como verdadeiro se o usuário for um psicólogo
                    } else {
                        console.log('Usuário é um cliente');
                        setIsPsychologist(false);
                    }
                } else {
                    console.error('Nenhum usuário autenticado encontrado');
                }
            } catch (error) {
                console.error('Erro ao verificar papel do usuário:', error);
            }
        };

        checkUserRole();
    }, [auth, db]);

    // Busca os idiomas da coleção `idiomas` no Firestore
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                console.log('Iniciando busca de idiomas no Firestore...');
                const querySnapshot = await getDocs(collection(db, 'idiomas'));
                const idiomas = querySnapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        code: data.code, // Código do idioma (ex.: 'en-US')
                        nombre: data.nombre, // Nome do idioma (ex.: 'Inglês')
                    };
                });

                setLanguages(idiomas); // Define a lista de idiomas no estado
            } catch (error) {
                console.error('Erro ao buscar idiomas do Firestore:', error);
            }
        };

        fetchLanguages();
    }, [db]);

    // Inicializa o Jitsi Meet
    useEffect(() => {
        if (!jitsiApiRef.current && window.JitsiMeetExternalAPI) {
            const domain = '8x8.vc';
            const options = {
                roomName: 'vpaas-magic-cookie-267358b35a0449a5b144489a922ec063/SampleAppConsecutiveVisionsMarketInside',
                parentNode: document.getElementById('jaas-container'),
            };

            jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);

            // Listener para exibir o componente apropriado ao terminar a videoconferência
            jitsiApiRef.current.addListener('videoConferenceLeft', () => {
                console.log('Videoconferência encerrada.');
                if (isPsychologist) {
                    setShowSummary(true); // Mostra Summary se for psicólogo
                } else {
                    setShowReview(true); // Mostra Review se for cliente
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
    }, [isPsychologist]);

    // Configura o reconhecimento de voz
    const startListening = () => {
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
                console.error('Erro no reconhecimento de fala:', event.error);
            };

            setRecognition(newRecognition);
            newRecognition.lang = language;
            newRecognition.start();
            setIsListening(true);
        } else {
            console.error('API de reconhecimento de fala não suportada por este navegador.');
        }
    };

    const stopListening = () => {
        if (recognition) {
            recognition.stop();
            setIsListening(false);
        }
    };

    const handleLanguageChange = (event) => {
        setLanguage(event.target.value);
    };

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            {/* O contêiner onde o Jitsi será renderizado */}
            {!showSummary && !showReview && (
                <div id="jaas-container" style={{ height: '70%', width: '100%' }}></div>
            )}

            {/* Renderiza o componente apropriado após a videoconferência */}
            {showSummary && <Summary psychologistId={psychologistId} />}
            {showReview && <Review psychologistId={psychologistId} />}

            {/* Mostra reconhecimento de voz apenas para psicólogos */}
            {isPsychologist && !showSummary && !showReview && (
                <div style={{ padding: '1rem', backgroundColor: '#f4f4f4' }}>
                    <h3>Reconhecimento de Voz</h3>

                    {/* Dropdown para selecionar idioma */}
                    <label htmlFor="language-select">Selecione o idioma: </label>
                    <select
                        id="language-select"
                        value={language}
                        onChange={handleLanguageChange}
                        style={{
                            marginLeft: '10px',
                            padding: '5px',
                            fontSize: '16px',
                            width: '400px',
                        }}
                    >
                        {languages.map((lang) => (
                            <option key={lang.id} value={lang.code}>
                                {lang.nombre}
                            </option>
                        ))}
                    </select>

                    <div style={{ marginTop: '10px' }}>
                        <button
                            onClick={startListening}
                            disabled={isListening}
                            style={{
                                marginRight: '10px',
                                padding: '10px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Iniciar Transcrição
                        </button>
                        <button
                            onClick={stopListening}
                            disabled={!isListening}
                            style={{
                                padding: '10px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            Parar Transcrição
                        </button>
                    </div>

                    <div style={{ marginTop: '1rem', fontSize: '16px', fontStyle: 'italic' }}>
                        {transcription || 'Diga algo para começar a transcrição...'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Videoconference;