// ==================================================================
//  APP.JS - O CÉREBRO DO SEU SITE DE VIAGENS
//  Escrito por Manus para funcionar com seu HTML e Firebase
// ==================================================================

// --- PASSO 1: CONFIGURAÇÃO DO FIREBASE ---
// ATENÇÃO: Substitua pelo seu NOVO firebaseConfig.
const firebaseConfig = {
  apiKey: "SUA_NOVA_API_KEY_AQUI",
  authDomain: "SEU_NOVO_AUTH_DOMAIN_AQUI",
  projectId: "SEU_NOVO_PROJECT_ID_AQUI",
  storageBucket: "SEU_NOVO_STORAGE_BUCKET_AQUI",
  messagingSenderId: "SEU_NOVO_SENDER_ID_AQUI",
  appId: "SEU_NOVO_APP_ID_AQUI"
};

// --- PASSO 2: INICIALIZAÇÃO ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log("🔥 Conexão com Firebase estabelecida!");

// --- PASSO 3: O CORAÇÃO DO SISTEMA (LEITURA EM TEMPO REAL) ---
// Esta função fica "ouvindo" o banco de dados.
// Qualquer mudança, em qualquer lugar do mundo, atualiza a tela de todos.
db.collection("viagem").doc("dados").onSnapshot((doc) => {
    console.log("🔄 Dados recebidos do Firebase!");
    if (doc.exists) {
        const data = doc.data();
        // Chama a função que desenha os cartões na tela
        renderScreen(data.cities);
    } else {
        // Se o banco de dados estiver vazio, ele cria os dados iniciais
        console.log("Banco de dados vazio. Criando dados iniciais...");
        db.collection("viagem").doc("dados").set(DEFAULT_DATA);
    }
}, (error) => {
    console.error("❌ Erro ao ouvir o Firebase: ", error);
    showNotification("Erro de conexão com o banco de dados.", "error");
});


// --- PASSO 4: FUNÇÃO QUE DESENHA A TELA ---
function renderScreen(cities) {
    const confirmedContainer = document.getElementById('confirmed-accommodations');
    const futureContainer = document.getElementById('future-cities');

    confirmedContainer.innerHTML = '';
    futureContainer.innerHTML = '';

    cities.forEach((city, cityIndex) => {
        const hasHotels = city.hotels && city.hotels.length > 0;
        const container = hasHotels ? confirmedContainer : futureContainer;

        const card = document.createElement('div');
        card.className = 'card city-card';

        let hotelsHtml = '';
        if (hasHotels) {
            city.hotels.forEach((hotel, hotelIndex) => {
                // ... (código para desenhar hotéis e quartos)
            });
        }

        card.innerHTML = `
            <div class="card__body">
                <div class="city-header">
                    <h3 class="city-name">${city.name}</h3>
                    <button class="edit-btn" onclick="openEditCityModal('${city.name}', ${cityIndex})" title="Editar nome da cidade">✏️</button>
                </div>
                <div class="period">
                    ${formatDate(city.startDate)} a ${formatDate(city.endDate)}
                </div>
                ${hasHotels ? hotelsHtml : '<div class="no-data">Hospedagens ainda não definidas</div>'}
            </div>
        `;
        container.appendChild(card);
    });
    console.log("✅ Tela redesenhada com os dados mais recentes.");
}

// --- PASSO 5: FUNÇÕES DE EDIÇÃO (SALVAM NO FIREBASE) ---

// Função para abrir o pop-up de edição de cidade
function openEditCityModal(cityName, cityIndex) {
    // Armazena qual cidade estamos editando
    window.currentEditing = { name: cityName, index: cityIndex };

    const modal = document.getElementById('edit-city-modal');
    const input = document.getElementById('city-name-input');
    input.value = cityName;
    modal.classList.add('active');
    input.focus();
}

// Função que SALVA o nome da cidade no Firebase
function saveEditedCityName() {
    const newName = document.getElementById('city-name-input').value.trim();
    if (!newName) {
        showNotification("O nome da cidade não pode ser vazio.", "error");
        return;
    }

    const cityIndex = window.currentEditing.index;

    // Pega todos os dados atuais do Firebase
    db.collection("viagem").doc("dados").get().then(doc => {
        const allData = doc.data();
        // Modifica apenas o nome da cidade que queremos
        allData.cities[cityIndex].name = newName;

        // Envia o objeto INTEIRO de volta para o Firebase
        db.collection("viagem").doc("dados").set(allData).then(() => {
            console.log("✅ Nome da cidade salvo no Firebase!");
            showNotification("Nome da cidade alterado com sucesso!", "success");
            closeEditCityModal();
        }).catch(error => {
            console.error("❌ Erro ao salvar no Firebase: ", error);
            showNotification("Erro ao salvar. Tente novamente.", "error");
        });
    });
}

// Função para fechar o pop-up
function closeEditCityModal() {
    document.getElementById('edit-city-modal').classList.remove('active');
}

// --- FUNÇÕES AUXILIARES ---
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function showNotification(message, type = "success") {
    const notificationId = type === "success" ? "success-notification" : "error-notification";
    const notification = document.getElementById(notificationId);
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Dados iniciais (caso o banco de dados esteja vazio)
const DEFAULT_DATA = {
    cities: [
        { name: "Tóquio", startDate: "2025-02-22", endDate: "2025-03-01", hotels: [ /* ... hotéis de Tóquio ... */ ] },
        { name: "Hakone", startDate: "2025-03-01", endDate: "2025-03-02", hotels: [ /* ... hotéis de Hakone ... */ ] },
        // ... resto das cidades
    ]
};
