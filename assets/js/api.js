/* ============================================
   batimovil iot - api.js
   gestión de llamadas a api rest
   ============================================ */

const APIManager = (() => {
    async function get(endpoint) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('get error:', error);
            throw error;
        }
    }

    async function post(endpoint, data) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('post error:', error);
            throw error;
        }
    }

    async function put(endpoint, data) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('put error:', error);
            throw error;
        }
    }

    async function sendMovement(deviceId, movementId) {
        return post('/movimiento', {
            id_dispositivo: deviceId,
            id_movimiento: movementId,
        });
    }

    async function updateParameter(name, value) {
        return put('/parametro', {
            nombre: name,
            valor: value,
        });
    }

    async function getLastMovements(deviceId) {
        return get(`/movimiento/ultimo?id_dispositivo=${deviceId}`);
    }

    async function executeDemo(demoId, deviceId) {
        return post('/demo/ejecutar', {
            id_demo: demoId,
            id_dispositivo: deviceId,
        });
    }

    // nueva funcion para enviar el arreglo silencioso
    async function saveDemoSequence(sequence) {
        return post('/demo/grabar', { secuencia: sequence });
    }

    return {
        get,
        post,
        put,
        sendMovement,
        updateParameter,
        getLastMovements,
        executeDemo,
        saveDemoSequence,
    };
})();