import React, { useEffect, useState } from 'react'
import { Col} from 'react-bootstrap'
import { useAuth } from "../firebase/Authentication";
import { getFirestore, doc, getDoc } from "firebase/firestore";


function Welcome(){

    const { user } = useAuth();
    const [name, setUserName] = useState(""); // Estado para armazenar o nome do usuário
    const db = getFirestore();

    useEffect(() => {
        const fetchUserName = async () => {
          if (user) {
            try {
              // Referencia ao documento do usuário no Firestore
              const userDocRef = doc(db, "users", user.uid);
              const userDoc = await getDoc(userDocRef);
    
              if (userDoc.exists()) {
                const userData = userDoc.data();
                setUserName(userData.name); // Define o nome do usuário no estado
              } else {
                console.log("Documento do usuário não encontrado no Firestore.");
              }
            } catch (error) {
              console.error("Erro ao buscar documento do usuário no Firestore:", error);
            }
          }
        };
    
        fetchUserName();
      }, [user, db]); // Executa quando `user` ou `db` mudarem

    return(
        <Col>
            <div className="d-flex align-items-center">
                <h1 className="mb-4 me-3">Bienvenido, {name || user?.email}.</h1>
                <img
                    src="images/bien-venido.png"
                    alt="Mascot"
                    className="mascot-image img-fluid"
                    style={{ maxWidth: '200px' }}
                />
            </div>

            <div className="next-appointments">
                <h3 className="mb-3">Mis Próximas Citas:</h3>
                <div className="appointments-list">
                    {/* Appointment data will be rendered here */}
                    <p>No hay citas programadas.</p>
                </div>
            </div>
        </Col>
    )
}

export default Welcome;