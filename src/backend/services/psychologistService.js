import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs,
  getFirestore,
  updateDoc, query, where 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL,  } from 'firebase/storage';
import { db, storage } from '../config/FirebaseConfig';


export const fetchPsychologistData = async (userId) => {
  const db = getFirestore();
  try {
    const [userDoc, psychDoc] = await Promise.all([
      getDoc(doc(db, 'users', userId)),
      getDoc(doc(db, 'psychologist', userId))
    ]);
    
    return {
      photoURL: psychDoc.exists() ? psychDoc.data().photoURL : userDoc.exists() ? userDoc.data().photoURL : '',
    };
  } catch (error) {
    throw new Error('Falha ao buscar dados do psicólogo');
  }
};

// Função existente (mantida para compatibilidade)
export const updatePsychologistPhoto = async (userId) => {
  const db = getFirestore();
  try {
    const docRef = doc(db, 'psychologist', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const photoURL = docSnap.data().photoURL;
      await updateDoc(docRef, { photoURL });
      return `${photoURL}?t=${Date.now()}`;
    }
    return '';
  } catch (error) {
    throw new Error('Falha ao atualizar foto');
  }
};


export const getPsychologistProfile = async (userId) => {
  const db = getFirestore();
  try {
    const psychDoc = await getDoc(doc(db, 'psychologist', userId));
    
    if (!psychDoc.exists()) throw new Error('Perfil não encontrado');
    
    const data = psychDoc.data();
    return {
      description: data.description ? [data.description] : [],
      studies: data.studies || [],
      languages: data.chosenLanguages || [],
      specialties: data.therapy || []
    };
  } catch (error) {
    throw new Error(`Erro ao carregar perfil: ${error.message}`);
  }
};

export const fetchPsychologistProfile = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'psychologist', userId));
    if (!docSnap.exists()) throw new Error('Psicólogo não encontrado');

    const data = docSnap.data();
    return {
      name: data.name || '',
      birthDate: data.birthDate || '',
      photoURL: data.photoURL || null,
      description: data.description || '',
      studies: data.studies || [],
      visible: data.visible || false,
      price: data.price || '',
      therapy: data.therapy || [],
      chosenLanguages: data.chosenLanguages || [],
      availability: data.availability || []
    };
  } catch (error) {
    throw new Error(`Erro ao buscar perfil: ${error.message}`);
  }
};

// Atualiza dados do psicólogo
export const updatePsychologistProfile = async (userId, userData, photoFile) => {
  try {
    let photoURL = userData.photoURL;

    if (photoFile) {
      const storageRef = ref(storage, `profile-pictures/${userId}/${photoFile.name}`);
      await uploadBytes(storageRef, photoFile);
      photoURL = await getDownloadURL(storageRef);
    }

    await setDoc(doc(db, 'psychologist', userId), { 
      ...userData, 
      photoURL 
    }, { merge: true });

    return photoURL; // Retorna a nova URL
  } catch (error) {
    throw new Error(`Erro ao atualizar perfil: ${error.message}`);
  }
};

// Busca dados auxiliares (dias, horários, terapias, idiomas)
export const fetchAuxiliaryData = async () => {
  try {
    const [daysSnapshot, timesSnapshot, therapiesSnapshot, languagesSnapshot] = await Promise.all([
      getDocs(collection(db, 'days')),
      getDocs(collection(db, 'times')),
      getDocs(collection(db, 'therapies')),
      getDocs(collection(db, 'idiomas'))
    ]);

    return {
      daysOfWeek: daysSnapshot.docs.map(doc => doc.data().name),
      hours: timesSnapshot.docs.map(doc => doc.data().horari),
      specialties: therapiesSnapshot.docs.map(doc => doc.data().name),
      languages: languagesSnapshot.docs.map(doc => doc.data().nombre)
    };
  } catch (error) {
    throw new Error(`Erro ao buscar dados auxiliares: ${error.message}`);
  }
};

export const fetchVisiblePsychologists = async () => {
  try {

    const q = query(
      collection(db, 'psychologist'),
      where('visible', '==', true)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,  
      ...doc.data()
    }));
    
  } catch (error) {
    console.error("Erro detalhado:", error);
    throw new Error('Erro ao buscar psicólogos');
  }
};

export const fetchPsychologistReviews = async (psychologistId) => {
  try {
    const reviewDoc = await getDoc(doc(db, 'reviews', psychologistId));
    if (reviewDoc.exists()) {
      // Retorna o array de reviews ou um array vazio se não houver reviews
      return reviewDoc.data().reviews || [];
    }
    return []; // Retorna um array vazio se o documento não existir
  } catch (error) {
    throw new Error('Erro ao buscar avaliações');
  }
};

export const fetchPsychologistAvailability = async (psychologistId) => {
  try {
    const docSnap = await getDoc(doc(db, 'psychologist', psychologistId));
    if (!docSnap.exists()) throw new Error('Psicólogo não encontrado');
    
    return {
      availability: docSnap.data().availability || [],
      name: docSnap.data().name || ''
    };
  } catch (error) {
    throw new Error(`Erro ao buscar disponibilidade: ${error.message}`);
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