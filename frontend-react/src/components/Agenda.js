import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Dialog, DialogTitle, DialogContent, Typography, CircularProgress, FormLabel, Chip, Button, Box } from '@mui/material';
import { collection, addDoc } from 'firebase/firestore';

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
    const handleScheduleAppointment = async () => {
        try {
          const user = auth.currentUser; // Usuário autenticado
          if (!user) {
            console.error('Usuário não autenticado');
            return;
          }
      
          const userId = user.uid; // ID do usuário autenticado
    
          // Iterar apenas sobre os horários selecionados
          for (const timeKey of selectedTimes) { // Iterar pelos horários selecionados
            const [day, time] = timeKey.split('-'); // Separar 'day' e 'time' do timeKey
    
            await addDoc(collection(db, 'appointments'), {
              psychologistID,
              userId,
              dia: day, // Nome do dia
              hora: time, // Hora selecionada
              timestamp: new Date(), // Opcional: Timestamp para rastrear a criação
            });
          }
      
          alert('Citas programadas com sucesso!');
        } catch (error) {
          console.error('Erro ao programar cita:', error);
        }
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
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button
                    variant="contained"
                    color="primary"
                    onClick={handleScheduleAppointment}
                    >
                    Programar cita
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}

export default Agenda;