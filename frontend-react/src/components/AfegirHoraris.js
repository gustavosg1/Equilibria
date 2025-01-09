const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, writeBatch } = require('firebase/firestore');

// Configuració de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB7c6HEQkrDsT5Inx5qsm-nH19DG-zAT0Q",
  authDomain: "equilibria-72221.firebaseapp.com",
  projectId: "equilibria-72221",
  storageBucket: "equilibria-72221.firebasestorage.app",
  messagingSenderId: "741512883157",
  appId: "1:741512883157:web:285cd79569f75f984d6b5c"
};

// Inicialitza Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const afegirHoraris = async () => {
  const horarisRef = collection(db, 'times'); // Col·lecció anomenada "horaris"
  const batch = writeBatch(db); // Per optimitzar l'escriptura

  // Generar els 48 horaris (de 00:00 a 23:30, cada 30 minuts)
  for (let hora = 0; hora < 24; hora++) {
    for (let minut = 0; minut < 60; minut += 30) {
      const horaFormat = hora.toString().padStart(2, '0'); // Ex: "00", "01"
      const minutFormat = minut.toString().padStart(2, '0'); // Ex: "00", "30"
      const horari = `${horaFormat}:${minutFormat}`; // Format "hh:mm"

      // Crear un nou document amb ID automàtic i camp "horari"
      const nouDocRef = doc(horarisRef);
      batch.set(nouDocRef, { horari });
    }
  }

  try {
    // Confirma el lot
    await batch.commit();
    console.log('Horaris afegits correctament.');
  } catch (error) {
    console.error('Error en afegir els horaris: ', error);
  }
};

// Executar la funció
afegirHoraris();