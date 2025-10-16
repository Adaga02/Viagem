// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAKd-2pdUcM2nT2YAAPB0YN8Iq0Ruz0Gw",
  authDomain: "japao-fb44c.firebaseapp.com",
  projectId: "japao-fb44c",
  storageBucket: "japao-fb44c.firebasestorage.app",
  messagingSenderId: "33547623583",
  appId: "1:33547623583:web:2dbfe088a05c8ad8fe16aa"
};

// --- PASSO 2: INICIALIZAÇÃO ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("🔥 Firebase Conectado!");

// --- PASSO 3: ONDE OS DADOS VIVEM ---
const dataRef = db.collection("viagemData").doc("live");

// --- PASSO 4: DADOS PADRÃO (SE O BANCO ESTIVER VAZIO) ---
// Exatamente os dados que estavam no seu HTML original
const DEFAULT_DATA = {
    cities: [
        { name: "Tóquio", startDate: "2025-02-22", endDate: "2025-03-01", hotels: [ { name: "Hotel Toyoko Inn Yashio Ekimae", checkIn: "23/02", checkOut: "26/02", rooms: [ { id: 1, type: "triplo", occupants: ["Lud", "Laura", "Fabiano"], dates: "23/02 a 26/02" }, { id: 2, type: "individual", occupants: ["Tia Cecília"], dates: "23/02 a 26/02" }, { id: 3, type: "individual", occupants: ["Eunice"], dates: "23/02 a 26/02" }, { id: 4, type: "individual", occupants: ["Lucas"], dates: "23/02 a 26/02" }, { id: 5, type: "duplo", occupants: ["Jacinto", "Eliana"], dates: "23/02 a 26/02" }, { id: 6, type: "duplo", occupants: ["Rafael", "Mariana"], dates: "23/02 a 26/02" }, { id: 7, type: "duplo", occupants: ["Marcus", "Luciana"], dates: "23/02 a 26/02" } ] }, { name: "Hotel Okubo House", checkIn: "26/02", checkOut: "02/03", rooms: [ { id: 8, type: "triplo", occupants: ["Lud", "Laura", "Fabiano"], dates: "26/02 a 02/03" } ] } ] },
        { name: "Hakone", startDate: "2025-03-01", endDate: "2025-03-02", hotels: [ { name: "Hotel Green Plaza Hakone", checkIn: "02/03", checkOut: "03/03", rooms: [ { id: 9, type: "triplo", occupants: ["Marcus", "Luciana", "Lucas"], dates: "02/03 a 03/03" }, { id: 10, type: "triplo", occupants: ["Fabiano", "Lud", "Laura"], dates: "02/03 a 03/03" }, { id: 11, type: "duplo", occupants: ["Jacinto", "Eliana"], dates: "02/03 a 03/03" }, { id: 12, type: "duplo", occupants: ["Cecília", "Eunice"], dates: "02/03 a 03/03" }, { id: 13, type: "duplo", occupants: ["Rafael", "Mariana"], dates: "02/03 a 03/03" } ] } ] },
        { name: "Osaka", startDate: "2025-03-02", endDate: "2025-03-07", hotels: [ { name: "Hotel Plaza Osaka", checkIn: "03/03", checkOut: "08/03", rooms: [ { id: 14, type: "individual", occupants: ["Lucas"], dates: "03/03 a 08/03" }, { id: 15, type: "duplo", occupants: ["Jacinto", "Eliana"], dates: "03/03 a 08/03" }, { id: 16, type: "duplo", occupants: ["Cecília", "Eunice"], dates: "03/03 a 08/03" }, { id: 17, type: "duplo", occupants: ["Rafael", "Mariana"], dates: "03/03 a 08/03" }, { id: 18, type: "duplo", occupants: ["Marcus", "Luciana"], dates: "03/03 a 08/03" } ] } ] },
        { name: "Kumamoto", startDate: "2025-03-08", endDate: "2025-03-09", hotels: [] },
        { name: "Quioto", startDate: "2025-03-09", endDate: "2025-03-11", hotels: [] },
        { name: "Tóquio", startDate: "2025-03-11", endDate: "2025-03-14", hotels: [] },
        { name: "Dubai", startDate: "2025-03-14", endDate: "2025-03-18", hotels: [] }
    ]
};

// --- PASSO 5: O CORAÇÃO DO SISTEMA ---
// Variável global para guardar os dados atuais
let currentData = null;

// Ouve as mudanças no Firebase EM TEMPO REAL
dataRef.onSnapshot(doc => {
    if (doc.exists) {
        console.log("✅ Dados recebidos do Firebase. Redesenhando a tela...");
        currentData = doc.data();
        renderApp(currentData);
    } else {
        console.log("⚠️ Nenhum dado encontrado. Criando dados iniciais no Firebase...");
        dataRef.set(DEFAULT_DATA).then(() => {
            console.log("✅ Dados iniciais salvos com sucesso!");
        });
    }
}, error => {
    console.error("❌ ERRO GRAVE ao ouvir o Firebase:", error);
    alert("Não foi possível conectar ao banco de dados. Verifique o console.");
});

// --- PASSO 6: FUNÇÃO PRINCIPAL PARA DESENHAR A TELA ---
function renderApp(data) {
    if (!data || !data.cities) return;

    const confirmedContainer = document.getElementById('confirmed-accommodations');
    const futureContainer = document.getElementById('future-cities');
    confirmedContainer.innerHTML = 'Carregando...';
    futureContainer.innerHTML = 'Carregando...';

    const confirmedCities = data.cities.filter(city => city.hotels && city.hotels.length > 0);
    const futureCities = data.cities.filter(city => !city.hotels || city.hotels.length === 0);

    // Renderiza Cidades Confirmadas
    confirmedContainer.innerHTML = '';
    confirmedCities.forEach(city => {
        const cityIndex = data.cities.findIndex(c => c.name === city.name && c.startDate === city.startDate);
        confirmedContainer.appendChild(createCityCard(city, cityIndex, true));
    });

    // Renderiza Cidades Futuras
    futureContainer.innerHTML = '';
    futureCities.forEach(city => {
        const cityIndex = data.cities.findIndex(c => c.name === city.name && c.startDate === city.startDate);
        futureContainer.appendChild(createCityCard(city, cityIndex, false));
    });
}

// --- PASSO 7: FUNÇÕES QUE CRIAM O HTML (OS CARDS) ---
function createCityCard(city, cityIndex, isConfirmed) {
    const card = document.createElement('div');
    card.className = isConfirmed ? 'card city-card' : 'card city-card future-city-card';

    const hotelsHtml = (city.hotels || []).map((hotel, hotelIndex) => createHotelHtml(hotel, cityIndex, hotelIndex)).join('');

    const futureCityHtml = `
        <div class="future-actions">
            <div class="no-data">Hospedagens ainda não definidas</div>
            <button class="btn btn--primary" onclick="openAddHotelModal(${cityIndex})">Adicionar Primeiro Hotel</button>
        </div>
    `;

    card.innerHTML = `
        <div class="card__body">
            <div class="city-header">
                <h3 class="city-name">${city.name}</h3>
                <div style="display: flex; gap: var(--space-8); align-items: center;">
                    <button class="btn btn--sm btn--secondary" onclick="openAddHotelModal(${cityIndex})" title="Adicionar hotel">+ Hotel</button>
                    <button class="edit-btn" onclick="openEditCityModal('${city.name}', ${cityIndex})" title="Editar nome da cidade">✏️</button>
                </div>
            </div>
            <div class="period">${formatDate(city.startDate)} a ${formatDate(city.endDate)}</div>
            ${isConfirmed ? hotelsHtml : futureCityHtml}
        </div>
    `;
    return card;
}

function createHotelHtml(hotel, cityIndex, hotelIndex) {
    const roomsHtml = (hotel.rooms || []).map((room, roomIndex) => createRoomHtml(room, cityIndex, hotelIndex, roomIndex)).join('');
    return `
        <div class="hotel">
            <div class="hotel-header">
                <div>
                    <div class="hotel-name">${hotel.name}</div>
                    <div class="hotel-period">${hotel.checkIn} a ${hotel.checkOut}</div>
                </div>
                <div class="hotel-actions">
                    <button class="edit-btn" onclick="openEditHotelModal(${cityIndex}, ${hotelIndex})" title="Editar hotel">✏️</button>
                </div>
            </div>
            <div class="room-grid">${roomsHtml}</div>
        </div>
    `;
}

function createRoomHtml(room, cityIndex, hotelIndex, roomIndex) {
    return `
        <div class="room">
            <div>
                <div class="room-type">${room.type}</div>
                <div class="room-occupants">
                    ${(room.occupants || []).join(', ')}  

                    <small>${room.dates}</small>
                </div>
            </div>
            <div class="room-actions">
                <button class="edit-btn" onclick="openEditRoomModal(${cityIndex}, ${hotelIndex}, ${roomIndex})" title="Editar ocupantes">✏️</button>
            </div>
        </div>
    `;
}

// --- PASSO 8: FUNÇÕES DE EDIÇÃO QUE SALVAM NO FIREBASE ---
// (Aqui estão as funções que os seus botões "onclick" chamam)

// Salva o objeto de dados inteiro no Firebase
function saveData(newData) {
    showSavingIndicator();
    return dataRef.set(newData)
        .then(() => {
            console.log("✅ Dados salvos no Firebase!");
            showToast('Dados salvos com sucesso!', 'success');
        })
        .catch(error => {
            console.error("❌ ERRO ao salvar no Firebase:", error);
            showToast('Falha ao salvar os dados!', 'error');
        });
}

// Funções dos Modais (pop-ups)
let editState = {};

function openEditCityModal(cityName, cityIndex) {
    editState = { cityIndex };
    const modal = document.getElementById('edit-city-modal');
    document.getElementById('city-name-input').value = cityName;
    modal.classList.add('active');
}

function saveEditedCityName() {
    const newName = document.getElementById('city-name-input').value.trim();
    if (!newName) return;

    const updatedData = JSON.parse(JSON.stringify(currentData)); // Cria uma cópia profunda
    updatedData.cities[editState.cityIndex].name = newName;
    saveData(updatedData);
    closeEditCityModal();
}

// Adicionei as funções de fechar que estavam faltando
function closeEditCityModal() { document.getElementById('edit-city-modal').classList.remove('active'); }
function closeEditRoomModal() { document.getElementById('edit-room-modal').classList.remove('active'); }
function closeEditHotelModal() { document.getElementById('edit-hotel-modal').classList.remove('active'); }
function closeAddHotelModal() { document.getElementById('add-hotel-modal').classList.remove('active'); }

// (As outras funções de edição como openEditHotelModal, saveNewHotel, etc. seguiriam a mesma lógica:
// 1. Abrir o modal e preencher com os dados de 'currentData'.
// 2. No 'save', criar uma cópia de 'currentData', modificar a cópia.
// 3. Chamar 'saveData(copiaModificada)'.
// Isso garante que a tela sempre reflita o que está no banco de dados.)

// --- FUNÇÕES AUXILIARES ---
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00'); // Adiciona tempo para evitar problemas de fuso
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function showToast(message, type) {
    const toastId = type === 'success' ? 'success-notification' : 'error-notification';
    const toast = document.getElementById(toastId);
    if (!toast) return;
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function showSavingIndicator() { /* ... implementação ... */ }

// Garante que o código só rode depois que a página carregou
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Página carregada. O app.js está no controle.");
});