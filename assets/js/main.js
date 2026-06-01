/* ============================================
   batimovil iot - main.js
   ============================================ */

const CONFIG = {
    API_BASE_URL: 'http://localhost:5000/api', 
    WS_URL: 'ws://localhost:5000/ws',          
    DEVICE_ID: 1,
    RECONNECT_INTERVAL: 3000,
};

const APP_STATE = {
    isConnected: false,
    currentTab: 'control',
    lastMovement: null,
    vehicleData: null,
};

function initApp() {
    console.log('inicializando batimovil iot...');
    WebSocketManager.init();
    loadInitialData();
    setupEventListeners();
    console.log('✓ batimovil iot inicializado correctamente');
}

function loadInitialData() {
    if (document.getElementById('tabla_historial_cuerpo')) {
        updateHistoryTable();
    }
}

function setupEventListeners() {
    const controlTab = document.getElementById('tab-control');
    const monitorTab = document.getElementById('tab-monitor');
    
    if (monitorTab) {
        monitorTab.addEventListener('click', () => {
            APP_STATE.currentTab = 'monitor';
            updateHistoryTable();
        });
    }
    
    if (controlTab) {
        controlTab.addEventListener('click', () => {
            APP_STATE.currentTab = 'control';
        });
    }
}

function updateHistoryTable() {
    APIManager.getLastMovements(CONFIG.DEVICE_ID)
        .then(data => UIManager.updateHistoryTable(data))
        .catch(error => {
            console.error('error al cargar historial:', error);
            UIManager.writeLog('✗ error al sincronizar tabla');
        });
}

document.addEventListener('DOMContentLoaded', initApp);

window.addEventListener('error', (event) => {
    console.error('error global:', event.error);
    UIManager.writeLog(`✗ error: ${event.error.message}`);
});