import React, { useState } from 'react';
import { Form, Button, Col } from 'react-bootstrap';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // Para obter o UID do usuário logado
import './styles/EditarPerfil.css';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

function EditarPerfil() {
  const [name, setNome] = useState('');
  const [birthDate, setDataNascimento] = useState('');
  const [photo, setFoto] = useState(null);

  const db = getFirestore();
  const auth = getAuth();
  const storage = getStorage(); // Inicializa o Firebase Storage

  const handleFotoChange = (e) => {
    setFoto(e.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Evita o recarregamento da página

    try {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;

        // Faz o upload da foto para o Firebase Storage
        let downloadURL = null;
        if (photo) {
          const storageRef = ref(storage, `profile-pictures/${uid}/${photo.name}`); // Cria uma referência para o arquivo no Storage
          await uploadBytes(storageRef, photo); // Faz o upload do arquivo para o Firebase Storage
          downloadURL = await getDownloadURL(storageRef); // Obtém a URL do download do arquivo
        }

        // Atualizar o documento do usuário no Firestore
        await setDoc(doc(db, 'users', uid), {
          name: name,
          birthDate: birthDate,
          photoURL: downloadURL ? downloadURL : null, // Armazena a URL da foto no Firestore, se houver
        }, { merge: true });

        console.log('Perfil do usuário atualizado com sucesso!');
      } else {
        console.error('Usuário não autenticado');
      }
    } catch (error) {
      console.error('Erro ao atualizar o perfil do usuário: ', error);
    }
  };

  return (
    <Col md={{ span: 6, offset: 3 }} className="editar-perfil-container">
      <h2 className="text-center mb-4">Editar Perfil</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formNome" className="mb-3">
          <Form.Label>Nome</Form.Label>
          <Form.Control
            type="text"
            placeholder="Digite seu nome"
            value={name}
            onChange={(e) => setNome(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formDataNascimento" className="mb-3">
          <Form.Label>Data de Nascimento</Form.Label>
          <Form.Control
            type="date"
            value={birthDate}
            onChange={(e) => setDataNascimento(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formFoto" className="mb-4">
          <Form.Label>Foto</Form.Label>
          <Form.Control type="file" onChange={handleFotoChange} />
        </Form.Group>

        <div className="text-center">
          <Button variant="success" type="submit" className="btn-editar-perfil">
            Salvar
          </Button>
        </div>
      </Form>
    </Col>
  );
}

export default EditarPerfil;
