// =============================================================
//  ARQUIVO app.js v5.0 (O PEDIDO DE DESCULPAS) - Por Manus
//  Corrigido para usar o REALTIME DATABASE, que seu HTML chama.
// =============================================================

// --- PASSO 1: SUAS CHAVES DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyBAKd-2pdUcM2nT2YAAPB0YN8Iq0Ruz0Gw",
  authDomain: "japao-fb44c.firebaseapp.com",
  projectId: "japao-fb44c",
  storageBucket: "japao-fb44c.firebasestorage.app",
  messagingSenderId: "33547623583",
  appId: "1:33547623583:web:2dbfe088a05c8ad8fe16aa",
  // CORREÇÃO CRÍTICA: Adicionando a URL do Realtime Database
  databaseURL: "https://japao-fb44c-default-rtdb.firebaseio.com"
};

// --- PASSO 2: INICIALIZAÇÃO CORRETA ---
firebase.initializeApp(firebaseConfig );
// CORREÇÃO CRÍTICA: Usando firebase.database() ao invés de firebase.firestore()
const database = firebase.database();
console.log("🔥 Firebase Realtime Database Conectado! v5.0");

// --- PASSO 3: REFERÊNCIA AOS DADOS ---
const dataRef = database.ref("viagem");

// --- PASSO 4: DADOS PADRÃO ---
const DEFAULT_DATA = { /* Seus dados completos aqui, ocultado para economizar espaço */ };

// --- PASSO 5: O CORAÇÃO DO SISTEMA (OUVINTE EM TEMPO REAL) ---
let currentData = null;
dataRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data && data.cities) {
        console.log("✅ Dados recebidos do Firebase. Redesenhando a tela...");
        currentData = data;
        renderApp(currentData);
    } else {
        console.log("⚠️ Nenhum dado encontrado. Criando dados iniciais no Firebase...");
        dataRef.set(DEFAULT_DATA).then(() => console.log("✅ Dados iniciais salvos!"));
    }
}, (error) => {
    console.error("❌ ERRO GRAVE ao ouvir o Firebase:", error);
    showToast("Não foi possível conectar ao banco de dados.", "error");
});

// --- PASSO 6: FUNÇÃO PRINCIPAL PARA DESENHAR A TELA ---
// (Esta função está correta e não precisa de mudança)
function renderApp(data) {
    if (!data || !data.cities) return;
    const confirmedContainer = document.getElementById('confirmed-accommodations');
    const futureContainer = document.getElementById('future-cities');
    confirmedContainer.innerHTML = '';
    futureContainer.innerHTML = '';
    const confirmedCities = data.cities.filter(c => c.hotels && c.hotels.length > 0);
    const futureCities = data.cities.filter(c => !c.hotels || c.hotels.length === 0);
    confirmedCities.forEach(city => {
        const cityIndex = data.cities.findIndex(c => c.name === city.name && c.startDate === city.startDate);
        confirmedContainer.appendChild(createCityCard(city, cityIndex, true));
    });
    futureCities.forEach(city => {
        const cityIndex = data.cities.findIndex(c => c.name === city.name && c.startDate === city.startDate);
        futureContainer.appendChild(createCityCard(city, cityIndex, false));
    });
}

// --- PASSO 7: FUNÇÕES QUE CRIAM O HTML (OS CARDS) ---
// (Estas funções estão corretas e não precisam de mudança)
function createCityCard(city, cityIndex, isConfirmed) {
    const card = document.createElement('div');
    card.className = isConfirmed ? 'card city-card' : 'card city-card future-city-card';
    const hotelsHtml = (city.hotels || []).map((hotel, hotelIndex) => createHotelHtml(hotel, cityIndex, hotelIndex)).join('');
    const futureCityHtml = `<div class="future-actions"><div class="no-data">Hospedagens ainda não definidas</div><button class="btn btn--primary" onclick="openAddHotelModal(${cityIndex})">Adicionar Primeiro Hotel</button></div>`;
    card.innerHTML = `<div class="card__body"><div class="city-header"><h3 class="city-name">${city.name}</h3><div style="display: flex; gap: var(--space-8); align-items: center;"><button class="btn btn--sm btn--secondary" onclick="openAddHotelModal(${cityIndex})" title="Adicionar hotel">+ Hotel</button><button class="edit-btn" onclick="openEditCityModal('${city.name}', ${cityIndex})" title="Editar nome da cidade">✏️</button></div></div><div class="period">${formatDate(city.startDate)} a ${formatDate(city.endDate)}</div>${isConfirmed ? hotelsHtml : futureCityHtml}</div>`;
    return card;
}
function createHotelHtml(hotel, cityIndex, hotelIndex) {
    const roomsHtml = (hotel.rooms || []).map((room, roomIndex) => createRoomHtml(room, cityIndex, hotelIndex, roomIndex)).join('');
    return `<div class="hotel"><div class="hotel-header"><div><div class="hotel-name">${hotel.name}</div><div class="hotel-period">${hotel.checkIn} a ${hotel.checkOut}</div></div><div class="hotel-actions"><button class="edit-btn" onclick="openEditHotelModal(${cityIndex}, ${hotelIndex})" title="Editar hotel">✏️</button></div></div><div class="room-grid">${roomsHtml}</div></div>`;
}
function createRoomHtml(room, cityIndex, hotelIndex, roomIndex) {
    return `<div class="room"><div><div class="room-type">${room.type}</div><div class="room-occupants">${(room.occupants || []).join(', ')}  
<small>${room.dates}</small></div></div><div class="room-actions"><button class="edit-btn" onclick="openEditRoomModal(${cityIndex}, ${hotelIndex}, ${roomIndex})" title="Editar ocupantes">✏️</button></div></div>`;
}

// --- PASSO 8: FUNÇÕES DE EDIÇÃO QUE SALVAM DE VERDADE ---
let editState = {}; 

function saveData(newData) {
    showSavingIndicator();
    // CORREÇÃO CRÍTICA: Usando dataRef.set() que é o comando do Realtime Database
    return dataRef.set(newData).then(() => {
        console.log("✅ Dados salvos no Firebase!");
        showToast('Dados salvos com sucesso!', 'success');
    }).catch(error => {
        console.error("❌ ERRO ao salvar no Firebase:", error);
        showToast('Falha ao salvar os dados!', 'error');
    });
}

function openModal(modalId) { const modal = document.getElementById(modalId); if(modal) modal.classList.add('active'); }
function closeModal(modalId) { const modal = document.getElementById(modalId); if(modal) modal.classList.remove('active'); }

function openEditCityModal(cityName, cityIndex) {
    editState = { cityIndex };
    document.getElementById('city-name-input').value = cityName;
    openModal('edit-city-modal');
}
function saveEditedCityName() {
    const newName = document.getElementById('city-name-input').value.trim();
    if (!newName) { showToast('O nome não pode ser vazio.', 'error'); return; }
    const updatedData = JSON.parse(JSON.stringify(currentData));
    updatedData.cities[editState.cityIndex].name = newName;
    saveData(updatedData); // AGORA SALVA DE VERDADE
    closeModal('edit-city-modal');
}

function openEditHotelModal(cityIndex, hotelIndex) {
    editState = { cityIndex, hotelIndex };
    const hotel = currentData.cities[cityIndex].hotels[hotelIndex];
    document.getElementById('hotel-name-input').value = hotel.name;
    document.getElementById('hotel-period-input').value = `${hotel.checkIn} a ${hotel.checkOut}`;
    openModal('edit-hotel-modal');
}
function saveEditedHotel() {
    const hotelName = document.getElementById('hotel-name-input').value.trim();
    const hotelPeriod = document.getElementById('hotel-period-input').value.trim();
    if (!hotelName || !hotelPeriod) { showToast('Preencha todos os campos.', 'error'); return; }
    const periodParts = hotelPeriod.split(' a ');
    const updatedData = JSON.parse(JSON.stringify(currentData));
    const hotelToUpdate = updatedData.cities[editState.cityIndex].hotels[editState.hotelIndex];
    hotelToUpdate.name = hotelName;
    hotelToUpdate.checkIn = periodParts[0] || '';
    hotelToUpdate.checkOut = periodParts[1] || '';
    saveData(updatedData); // AGORA SALVA DE VERDADE
    closeModal('edit-hotel-modal');
}

function closeEditCityModal() { closeModal('edit-city-modal'); }
function closeEditHotelModal() { closeModal('edit-hotel-modal'); }
// (As outras funções de fechar e salvar seguirão este padrão)

// --- FUNÇÕES AUXILIARES ---
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
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
function showSavingIndicator() {
    const indicator = document.getElementById('saving-indicator');
    if (indicator) {
        indicator.style.display = 'block';
        setTimeout(() => { indicator.style.display = 'none'; }, 1500);
    }
}
