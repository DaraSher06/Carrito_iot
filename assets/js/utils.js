/* ============================================
   batimovil iot - utils.js
   ============================================ */

// variables para controlar la grabacion silenciosa
let isRecording = false;
let recordedSequence = [];

async function sendCommand(movementId) {
    // si estamos grabando, intercepta el clic y lo guarda sin enviarlo
    if (isRecording) {
        recordedSequence.push(movementId);
        UIManager.showInfo(`movimiento agregado a memoria (id: ${movementId})`);
        return; 
    }

    // flujo normal si no estamos grabando
    try {
        await APIManager.sendMovement(CONFIG.DEVICE_ID, movementId);
        UIManager.showSuccess(`comando enviado (id: ${movementId})`);
        
        if (APP_STATE.currentTab === 'monitor') {
            updateHistoryTable();
        }
    } catch (error) {
        UIManager.showError(`error al enviar comando: ${error.message}`);
    }
}

async function updateVehicleSpeed() {
    const speedSlider = document.getElementById('rango_velocidad');
    if (!speedSlider) return;
    
    const pwmValue = speedSlider.value;
    
    try {
        await APIManager.updateParameter('velocidad', parseFloat(pwmValue));
        UIManager.updateSpeedLabel(pwmValue);
        UIManager.showSuccess(`velocidad pwm actualizada a: ${pwmValue}`);
    } catch (error) {
        UIManager.showError(`error al cambiar velocidad: ${error.message}`);
    }
}

async function executeDemo(demoId) {
    try {
        UIManager.showInfo(`ejecutando demo...`);
        await APIManager.executeDemo(demoId, CONFIG.DEVICE_ID);
        UIManager.showSuccess('secuencia demo iniciada en el vehiculo');
    } catch (error) {
        UIManager.showError(`error al ejecutar demo: ${error.message}`);
    }
}

async function recordNewDemo() {
    const btnGrabar = document.querySelector('button[onclick="recordNewDemo()"]');
    
    if (!isRecording) {
        // modo grabacion: on
        isRecording = true;
        recordedSequence = []; 
        btnGrabar.innerText = "detener grabacion";
        btnGrabar.style.backgroundColor = "#d32f2f"; // color rojo de alerta
        btnGrabar.style.color = "white";
        UIManager.showInfo('grabacion silenciosa activa. presiona las direcciones...');
    } else {
        // modo grabacion: off
        isRecording = false;
        btnGrabar.innerText = "grabar nueva demo";
        btnGrabar.style.backgroundColor = ""; // color original
        
        if (recordedSequence.length > 0) {
            try {
                await APIManager.saveDemoSequence(recordedSequence);
                UIManager.showSuccess(`secuencia de ${recordedSequence.length} pasos guardada. presiona ejecutar.`);
            } catch (error) {
                UIManager.showError('error al guardar la secuencia.');
            }
        } else {
            UIManager.showInfo('grabacion vacia, no se guardo nada.');
        }
    }
}

const MOVEMENTS = {
    ADELANTE: 1, ATRAS: 2, DETENER: 3,
    DER_ADE: 5, IZQ_ADE: 4,       
    DER_ATR: 7, IZQ_ATR: 6,       
    GIRO_90_DER: 9, GIRO_90_IZQ: 8,   
    GIRO_360_DER: 11, GIRO_360_IZQ: 10, 
};

const Commands = {
    adelante: () => sendCommand(MOVEMENTS.ADELANTE),
    atras: () => sendCommand(MOVEMENTS.ATRAS),
    detener: () => sendCommand(MOVEMENTS.DETENER),
    derAde: () => sendCommand(MOVEMENTS.DER_ADE),
    izqAde: () => sendCommand(MOVEMENTS.IZQ_ADE),
    derAtr: () => sendCommand(MOVEMENTS.DER_ATR),
    izqAtr: () => sendCommand(MOVEMENTS.IZQ_ATR),
    giro90Der: () => sendCommand(MOVEMENTS.GIRO_90_DER),
    giro90Izq: () => sendCommand(MOVEMENTS.GIRO_90_IZQ),
    giro360Der: () => sendCommand(MOVEMENTS.GIRO_360_DER),
    giro360Izq: () => sendCommand(MOVEMENTS.GIRO_360_IZQ),
};

function getServerUrl() { return CONFIG.API_BASE_URL; }
function getDeviceId() { return CONFIG.DEVICE_ID; }

function updateHistoryTable() {
    APIManager.getLastMovements(CONFIG.DEVICE_ID)
        .then(data => UIManager.updateHistoryTable(data))
        .catch(error => {
            console.error('error al cargar historial:', error);
            UIManager.showError('error al sincronizar tabla rds');
        });
}

function isWebSocketConnected() { return APP_STATE.isConnected; }
function getVehicleState() { return APP_STATE.vehicleData; }
function getAppState() { return { ...APP_STATE }; }

const SPEED_PRESETS = {
    MIN: 400, LOW: 600, MEDIUM: 800, HIGH: 900, MAX: 1023,
};

function setSpeedPreset(preset) {
    const speedSlider = document.getElementById('rango_velocidad');
    if (!speedSlider) return;
    const speedValue = SPEED_PRESETS[preset];
    if (speedValue !== undefined) {
        speedSlider.value = speedValue;
        updateVehicleSpeed();
    }
}