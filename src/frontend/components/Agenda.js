import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, Typography, CircularProgress, 
  FormLabel, Chip, Button, Box, Modal, IconButton 
} from '@mui/material';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
  addMonths, subMonths, isToday 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { auth } from '../../backend/config/FirebaseConfig';
import { fetchPsychologistAvailability } from '../../backend/services/psychologistService';
import { createAppointment } from '../../backend/services/appointmentService';
import { getUserName } from '../../backend/services/userService';

const Agenda = ({ open, psychologistId, psychologistName, psychologistPhotoURL, onClose }) => {
  // Estados
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientName, setClientName] = useState('');
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  //Transformar los dias de la semana en ingles para español, pues la biblioteca está em ingles.

  const diasDaSemanaMap = {
    Monday: 'Lunes',
    Tuesday: 'Martes',
    Wednesday: 'Miercoles',
    Thursday: 'Jueves',
    Friday: 'Viernes',
    Saturday: 'Sábado',
    Sunday: 'Domingo',
  };

  // Gerar estrutura do calendário corrigida
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const dates = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Dividir em semanas corretamente
  const weeks = [];
  const firstDayOfMonth = monthStart;
  const startDay = firstDayOfMonth.getDay(); // 0 (Domingo) a 6 (Sábado)
  
  // 1. Preencher com dias do mês anterior
  const calendarDays = [];
  const daysFromPrevMonth = startDay === 0 ? 6 : startDay; // Ajuste para calendário Domingo-Sábado

  for (let i = daysFromPrevMonth; i > 0; i--) {
    const date = new Date(firstDayOfMonth);
    date.setDate(date.getDate() - i);
    calendarDays.push(date);
  }

  // 2. Adicionar dias do mês atual
  calendarDays.push(...dates);

  // 3. Completar com dias do próximo mês
  while (calendarDays.length < 42) { // 6 semanas
    const lastDate = new Date(calendarDays[calendarDays.length - 1]);
    lastDate.setDate(lastDate.getDate() + 1);
    calendarDays.push(lastDate);
  }

  // 4. Dividir em semanas
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  // Renderização dos dias
  {weeks.map((week, weekIndex) => (
    <Box key={weekIndex} sx={{ display: 'flex' }}>
      {week.map((date, dayIndex) => {
        const isCurrentMonth = isSameMonth(date, currentDate);
        const isTodayDay = isToday(date);

        return (
          <Box
            key={dayIndex}
            sx={{
              flex: 1,
              border: '1px solid #e0e0e0',
              minHeight: 120,
              opacity: isCurrentMonth ? 1 : 0.5,
              backgroundColor: isCurrentMonth ? '#fff' : '#f5f5f5'
            }}
          >
            <Typography 
              sx={{ 
                fontWeight: isTodayDay ? 'bold' : 'normal',
                color: isTodayDay ? 'primary.main' : 'text.primary',
                textAlign: 'center',
                p: 1
              }}
            >
              {format(date, 'd')}
            </Typography>
          </Box>
        );
      })}
    </Box>
  ))}
  

  // Buscar disponibilidade do psicólogo
  useEffect(() => {
    const loadData = async () => {
      if (open && psychologistId) {
        try {
          const { availability } = await fetchPsychologistAvailability(psychologistId);
          setAvailability(availability);

          if (auth.currentUser?.uid) {
            const name = await getUserName(auth.currentUser.uid);
            setClientName(name || 'Cliente');
          }
        } catch (error) {
          console.error("Erro:", error.message);
        } finally {
          setLoading(false);
        }
      }
    };
    loadData();
  }, [open, psychologistId]);

  // Alternar seleção de horário
  const toggleTimeSelection = (date, time) => {
    const timeKey = `${format(date, 'yyyy-MM-dd')}-hora-${time.replace(':', '-')}`;
    setSelectedTimes(prev => 
      prev.includes(timeKey) 
        ? prev.filter(key => key !== timeKey) 
        : [...prev, timeKey]
    );
  };

  // Ao clicar em um dia
  const handleDayClick = async (date) => {
    if (!isSameMonth(date, currentDate)) return;
    
    const dayOfWeekEnglish = format(date, 'EEEE'); // Retorna o dia da semana em inglês (ex: "Monday")
    const dayOfWeekSpanish = diasDaSemanaMap[dayOfWeekEnglish];
    const dayAvailability = availability.find(a => a.day.toLowerCase() === dayOfWeekSpanish.toLowerCase());
    
    setSelectedDate(date);
    setAvailableSlots(dayAvailability?.times || []);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} sx={{ width: '90%', margin: 'auto' }}>
      <DialogTitle sx={{ textAlign: 'center' }}>
        <Typography variant="h7" sx={{ mb: 1 }}>
          Vea la disponibilidad de {psychologistName}
        </Typography>
        <br></br>
        <br></br>
        <Typography variant="h5">
          {format(currentDate, "MMMM yyyy", { locale: es }).replace(/^\w/, c => c.toUpperCase())}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
          <IconButton onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft />
          </IconButton>
          <IconButton onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Renderização do calendário */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => (
                <Typography key={day} sx={{ 
                  padding: '8px', 
                  fontWeight: 'bold', 
                  backgroundColor: '#f5f5f5', 
                  borderRadius: '4px', 
                  margin: '2px',
                  textAlign: 'center',
                  width: '120px'  
                }}>
                  {day}
                </Typography>
              ))}

              {weeks.flatMap((week, weekIndex) =>
                week.map((date, dayIndex) => {
                  const isCurrentMonth = isSameMonth(date, currentDate);

                  return (
                    <Box
                      key={`${weekIndex}-${dayIndex}`}
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '8px',
                        minHeight: '120px',
                        backgroundColor: isCurrentMonth ? '#fff' : '#fafafa',
                        opacity: isCurrentMonth ? 1 : 0.6,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.02)' },
                      }}
                      onClick={() => handleDayClick(date)}
                    >
                      <Typography 
                        sx={{ 
                          fontWeight: isToday(date) ? 'bold' : 'normal',
                          color: 'inherit',
                          textAlign: 'center'
                        }}
                      >
                        {format(date, 'd')}
                      </Typography>
                    </Box>
                  );
                })
              )}
            </Box>

            {/* Modal de horários */}
            <Modal open={!!selectedDate} onClose={() => setSelectedDate(null)}>
              <Box sx={{ 
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: '8px',
                width: '600px',
                maxWidth: '90%',
              }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Horários em {format(selectedDate, 'dd/MM/yyyy')}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {availableSlots.map((time, index) => {
                  const timeKey = `${format(selectedDate, 'yyyy-MM-dd')}-hora-${time.replace(':', '-')}`;
                  const isSelected = selectedTimes.includes(timeKey);
                  
                  return (
                    <Chip
                      key={index}
                      label={time}
                      clickable
                      color={isSelected ? "primary" : "default"}
                      onClick={() => toggleTimeSelection(selectedDate, time)}
                      sx={{ 
                        fontSize: '0.9rem',
                        padding: '5px 10px',
                        backgroundColor: isSelected ? '#1976d2' : '#e0e0e0',
                        color: isSelected ? 'white' : 'inherit'
                      }}
                    />
                  );
                })}
                </Box>
                
                <Button 
                  variant="contained" 
                  onClick={() => setSelectedDate(null)}
                  sx={{ width: '100%', bgcolor:'green', '&:hover': {bgcolor: 'darkgreen'} 
                }}
                >
                  SELECCIONAR
                </Button>
              </Box>
            </Modal>
          </>
        )}

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{bgcolor:'green', '&:hover': {bgcolor: 'darkgreen'} }}
            onClick={async () => {
              try {
                if (!auth.currentUser?.uid) throw new Error('Usuário não autenticado');
            
                const now = new Date(); // Momento atual
            
                for (const timeKey of selectedTimes) {
                  const [datePart, timePart] = timeKey.split('-hora-');
                  const [year, month, day] = datePart.split('-');
                  const [hour, minute] = timePart.split('-');
                  
                  // Criar objeto Date com a data/hora selecionada
                  const selectedDateTime = new Date(year, month - 1, day, hour, minute);
                  
                  // Verificar se a data/hora é anterior ao momento atual
                  if (selectedDateTime < now) {
                    throw new Error('No se pueden agendar citas en fechas/horas pasadas');
                  }
            
                  const formattedDate = `${day}/${month}/${year}`;
                  const formattedTime = timePart.replace('-', ':');
            
                  await createAppointment({
                    psychologistId,
                    psychologistName,
                    psychologistPhotoURL,
                    clientId: auth.currentUser.uid,
                    clientName,
                    day: formattedDate,
                    time: formattedTime,
                    active: true,
                    timestamp: new Date(),
                  });
                }
            
                setModalMessage('Cita programada con éxito!');
                setShowModal(true);
              } catch (error) {
                setModalMessage(error.message);
                setShowModal(true);
              }
            }}
            disabled={selectedTimes.length === 0}
          >
            Programar Cita
          </Button>
        </Box>
      </DialogContent>

      {/* Modal de confirmação */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          bgcolor: 'background.paper', 
          boxShadow: 24, 
          p: 4, 
          borderRadius: '8px',
          textAlign: 'center' 
        }}>
          <Typography variant="h6">Aviso</Typography>
          <Typography sx={{ my: 2 }}>{modalMessage}</Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              setShowModal(false);
              onClose();
            }}
            sx={{ width: '100%' }}
          >
            OK
          </Button>
        </Box>
      </Modal>
    </Dialog>
  );
};

export default Agenda;