import React, { useEffect, useState } from 'react';
import './styles/ProfilePage.css';
import Menu from '../components/Menu';
import Welcome from '../components/Welcome'
import EditarPerfil from '../components/EditarPerfil'
import { useAuth } from "../firebase/Authentication";
import { Container, Row, Button, Col} from 'react-bootstrap'
import { getFirestore, doc, getDoc } from 'firebase/firestore';



function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("welcome");
  const db = getFirestore();
  const [photo, setPhoto] = useState("");

  let view;

  if (currentPage === "welcome") {
    view = <Welcome />;
  } else if (currentPage === "editarPerfil") {
    view = <EditarPerfil />;
  } else {
    view = <Welcome />; // Componente padrão se nenhum valor corresponder
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        try {
          // Referencia ao documento do usuário no Firestore
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
  
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setPhoto(userData.photo); // Define a URL da foto do usuário no estado
            console.log("Valor de photo:", userData.photo);
          } else {
            console.log("Documento do usuário não encontrado no Firestore.");
          }
        } catch (error) {
          console.error("Erro ao buscar documento do usuário no Firestore:", error);
        }
      }
    };
    fetchUser();
  }, [user, db]); // Executa quando `user` ou `db` mudarem

  return (
    <Container fluid className="profile-page">
      <Menu />
  
      {/* Main Profile Section */}
      <Row className="main-section mt-4">
        {/* User Information Sidebar */}
        <Col md={3} className="sidebar bg-light p-3 rounded">
          <div className="profile-info text-center">
            <img
              src= {photo}
              alt="Gustavo"
              className="profile-picture img-fluid rounded-circle mb-3"
              style={{ maxWidth: '150px' }}
            />
            <ul className="list-unstyled profile-options">
              <li className="mb-2">
                <Button variant="primary" className="w-100" onClick={() => setCurrentPage("welcome")}>
                    Home
                  </Button>
              </li>
              <li className="mb-2">
                <Button variant="primary" className="w-100" onClick={() => setCurrentPage("editarPerfil")}>
                  Editar Perfil
                </Button>
              </li>
              <li className="mb-2">
                <Button variant="secondary" className="w-100">
                  Formas de Pago
                </Button>
              </li>
              <li className="mb-2">
                <Button variant="info" className="w-100">
                  Mis Reseñas
                </Button>
              </li>
            </ul>
          </div>
        </Col>
  
        {/* Main Content Section */}
        <Col md={8} className="content">
        {view}
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;