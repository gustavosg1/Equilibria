import React, { useState, useEffect } from 'react';
import { db } from '../firebase/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Dialog, DialogTitle, DialogContent, Typography, CircularProgress, FormLabel, Chip, Button, Box } from '@mui/material';

function Agenda({ open, psychologistID, onClose }) {
    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [selectedTimes, setSelectedTimes] = useState([]); // Estado para horários selecionados

    useEffect(() => {
        console.log('psychologist ID', psychologistID); // Verifica o ID recebido
        if (open && psychologistID) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const psychologistDoc = doc(db, 'psychologist', psychologistID);
                    const snapshot = await getDoc(psychologistDoc);
                    if (snapshot.exists()) {
                        setAvailability(snapshot.data().availability || []);
                        const fullName = snapshot.data().name || "Nombre no disponible";
                        setName(fullName.split(" ")[0]); // Extrai o primeiro nome
                    } else {
                        console.error("Documento no encontrado!");
                    }
                } catch (error) {
                    console.error("Collection no encontrada!");
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [open, psychologistID]);

    // Função para alternar seleção de horários
    const toggleTimeSelection = (day, time) => {
        const timeKey = `${day}-${time}`; // Cria uma chave única para cada horário
        setSelectedTimes((prev) => 
            prev.includes(timeKey)
                ? prev.filter((key) => key !== timeKey) // Remove se já estiver selecionado
                : [...prev, timeKey] // Adiciona se não estiver selecionado
        );
    };

    // Função para lidar com a programação da cita
    const handleProgramCita = () => {
        console.log("Horários selecionados:", selectedTimes);
        console.log("Psychologist ID:", psychologistID);

        // Aqui você pode enviar os dados para o componente `MisCitas` usando navegação, contexto ou state management
        // Exemplo fictício de navegação:
        // navigate('/mis-citas', { state: { psychologistID, selectedTimes } });
        
        onClose(); // Fecha o popup após programar
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth={false} // Desativa as opções predefinidas como 'sm' ou 'md'
        sx={{
            width: '70%', // Ocupará 70% da largura da tela
            borderRadius: '8px', // Adiciona bordas arredondadas
            margin: 'auto', // Garante centralização horizontal
        }}>
            <DialogTitle sx={{ textAlign: 'center' }}>Agenda</DialogTitle>
            <DialogContent>
                <Typography sx={{ padding: '10px', textAlign: 'center' }}>
                    {name} tiene estos horarios disponibles.
                </Typography>
                <Typography sx={{ textAlign: 'center', marginBottom: '20px' }}>
                    ¡Programe ya tu cita!
                </Typography>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    availability.map((item, index) => (
                        <div key={index} style={{ margin: '1rem' }}>
                            <FormLabel>{item.day}</FormLabel>
                            <div style={{ marginTop: '0.5rem' }}>
                                {item.times.map((time, timeIndex) => {
                                    const timeKey = `${item.day}-${time}`;
                                    const isSelected = selectedTimes.includes(timeKey); // Verifica se o horário está selecionado
                                    return (
                                        <Chip
                                            key={timeIndex}
                                            label={time}
                                            clickable
                                            color={isSelected ? "primary" : "default"} // Muda a cor se selecionado
                                            onClick={() => toggleTimeSelection(item.day, time)} // Alterna seleção
                                            style={{
                                                marginRight: "0.5rem",
                                                marginBottom: "0.5rem",
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleProgramCita}
                        disabled={selectedTimes.length === 0} // Desabilita se nenhum horário estiver selecionado
                    >
                        Programar Cita
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default Agenda;