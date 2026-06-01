/* ============================================
   batimovil iot - websocket.js
   ============================================ */

const WebSocketManager = (() => {
    let ws = null;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;
    let pollingInterval = null;
    let obstacleTimer = null;

    function init() {
        try {
            ws = new WebSocket(CONFIG.WS_URL);
            ws.onopen = handleOpen;
            ws.onmessage = handleMessage;
            ws.onclose = handleClose;
            ws.onerror = handleError;
        } catch (error) {
            console.error('error al crear websocket:', error);
            UIManager.writeLog('✗ error al conectar con el servidor');
            scheduleReconnect();
        }
    }

    function handleOpen() {
        APP_STATE.isConnected = true;
        reconnectAttempts = 0;
        UIManager.updateConnectionStatus(true);
        UIManager.writeLog('✓ conexion websocket establecida');

        send({ accion: "obtener_movimiento", id_dispositivo: 1 });
        
        if (pollingInterval) clearInterval(pollingInterval);
        pollingInterval = setInterval(() => {
            if (APP_STATE.isConnected) {
                send({ accion: "obtener_movimiento", id_dispositivo: 1 });
            }
        }, 1000);
    }

    function handleMessage(event) {
        // el chismoso: va a imprimir TODO lo que python le mande a la web
        console.log("📩 recibiendo de python:", event.data);

        try {
            if (typeof event.data === 'string' && event.data.includes('registrar_obstaculo')) {
                console.log("🚨 ¡mensaje de obstaculo detectado por la web!");
                const alertData = JSON.parse(event.data);
                handleObstacleAlert(alertData);
                return; 
            }

            const data = JSON.parse(event.data);
            if (data.success && data.data && data.data.length > 0) {
                const nuevoMovimiento = data.data[0].movimiento;
                if (!APP_STATE.vehicleData || APP_STATE.vehicleData.movimiento !== nuevoMovimiento) {
                    UIManager.writeLog(`▶ estado actualizado: ${nuevoMovimiento}`);
                }
                handleVehicleData(data.data[0]);
            }
        } catch (error) {
            console.error("error al leer websocket:", error);
        }
    }

    function handleVehicleData(vehicleData) {
        APP_STATE.vehicleData = vehicleData;
        UIManager.updateVehicleStatus(vehicleData);
        
        if (!obstacleTimer) {
            UIManager.clearObstacleAlert();
        }
    }

    function handleObstacleAlert(alertData) {
        const distancia = alertData.distancia_cm || alertData.distancia;
        UIManager.showObstacleAlert(distancia);
        UIManager.writeLog(`🚨 freno automatico: obstaculo a ${distancia} cm`);
        
        if (obstacleTimer) clearTimeout(obstacleTimer);
        
        obstacleTimer = setTimeout(() => {
            obstacleTimer = null;
            UIManager.clearObstacleAlert();
        }, 3000);

        if (APP_STATE.currentTab === 'monitor') updateHistoryTable();
    }

    function handleClose() {
        APP_STATE.isConnected = false;
        if (pollingInterval) clearInterval(pollingInterval);
        UIManager.updateConnectionStatus(false);
        UIManager.writeLog('✗ conexion perdida. reintentando...');
        scheduleReconnect();
    }

    function handleError(error) {
        UIManager.writeLog('✗ error en la conexion websocket');
    }

    function scheduleReconnect() {
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            setTimeout(init, CONFIG.RECONNECT_INTERVAL);
        }
    }

    function send(message) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    return { init, send, isConnected: () => APP_STATE.isConnected };
})();