// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBx8DOIRYHcHIGVi5PHfowPzx5ftI43Kj0",
  authDomain: "viagem-54d4d.firebaseapp.com",
  projectId: "viagem-54d4d",
  storageBucket: "viagem-54d4d.firebasestorage.app",
  messagingSenderId: "225846298213",
  appId: "1:225846298213:web:3dbbcb6e25799e944ae88c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// --- PARTE 1: OUVIR QUANDO O USUÁRIO ENVIA O FORMULÁRIO ---

// Pegando os elementos do HTML para poder usá-los no JavaScript
const form = document.getElementById('form-dica');
const input = document.getElementById('input-dica');

// Criando um "espião" que avisa quando o formulário é enviado
form.addEventListener('submit', function(evento) {
  evento.preventDefault(); // Impede a página de recarregar

  const textoDaDica = input.value; // Pega o que o usuário digitou

  // Se o usuário digitou algo...
  if (textoDaDica) {
    // ...mande salvar no banco de dados!
    db.collection('dicas').add({
      texto: textoDaDica,
      data: new Date() // Guarda a data e hora que a dica foi enviada
    });

    // Limpa o campo de texto para o usuário poder digitar outra dica
    input.value = '';
  }
});

// --- PARTE 2: FICAR DE OLHO NO BANCO DE DADOS E ATUALIZAR A LISTA ---

// Pegando a lista do HTML
const lista = document.getElementById('lista-de-dicas');

// Criando um "espião" que fica olhando a coleção 'dicas' no Firebase
db.collection('dicas').orderBy('data', 'desc').onSnapshot(function(snapshot) {
  lista.innerHTML = ''; // 1. Esvazia a lista atual

  // 2. Para cada dica que o espião encontrar no banco de dados...
  snapshot.forEach(function(doc) {
    const dica = doc.data(); // Pega os dados da dica (o texto e a data)

    // 3. Cria um item de lista <li> no HTML...
    const item = document.createElement('li');
    item.textContent = dica.texto; // ...e coloca o texto da dica dentro dele.

    // 4. Adiciona o item na lista da página
    lista.appendChild(item);
  });
});


