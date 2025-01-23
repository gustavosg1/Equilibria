import { getFirestore, collection, query, where, getDocs, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';


export const fetchActiveAppointments = async (userId, isPsychologist) => {
  const db = getFirestore();
  try {
    const q = isPsychologist 
      ? query(
          collection(db, 'appointments'),
          where('psychologistId', '==', userId),
          where('active', '==', true)
        )
      : query(
          collection(db, 'appointments'),
          where('clientId', '==', userId),
          where('active', '==', true)
        );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error('Erro ao buscar compromissos');
  }
};

export const fetchAppointments = async (userId) => {
  try {
    const [clientQuery, psychologistQuery] = await Promise.all([
      query(collection(db, 'appointments'), where('clientId', '==', userId)),
      query(collection(db, 'appointments'), where('psychologistId', '==', userId))
    ]);

    const [clientSnapshot, psychologistSnapshot] = await Promise.all([
      getDocs(clientQuery),
      getDocs(psychologistQuery)
    ]);

    return [
      ...clientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      ...psychologistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ];
  } catch (error) {
    throw new Error('Erro ao buscar agendamentos');
  }
};

export const cancelAppointment = async (appointmentId) => {
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), { active: false });
  } catch (error) {
    throw new Error('Erro ao cancelar consulta');
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
    return docRef.id;
  } catch (error) {
    throw new Error(`Erro ao criar agendamento: ${error.message}`);
  }
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, { active: status });
  } catch (error) {
    throw new Error(`Erro ao atualizar agendamento: ${error.message}`);
  }
};

export const saveCallTranscription = async (appointmentId, transcription) => {
  try {
    const appointmentRef = doc(db, 'appointments', appointmentId);
    await updateDoc(appointmentRef, { transcription });
  } catch (error) {
    throw new Error(`Erro ao salvar transcrição: ${error.message}`);
  }
};