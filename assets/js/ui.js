/* ============================================
   batimovil iot - ui.js
   ============================================ */

const UIManager = (() => {
    const consoleElement = document.getElementById('consola_logs');
    const connectionIndicator = document.getElementById('indicador_conexion');
    const movementStatus = document.getElementById('lbl_estatus_movimiento');
    const obstacleStatus = document.getElementById('lbl_estatus_obstaculo');
    const pwmLeftValue = document.getElementById('val_pwm_izq');
    const pwmRightValue = document.getElementById('val_pwm_der');
    const alertCard = document.getElementById('tarjeta_alertas');
    const speedSlider = document.getElementById('rango_velocidad');
    const speedLabel = document.getElementById('lbl_velocidad');

    function writeLog(message) {
        if (!consoleElement) return;
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.innerHTML = `[${timestamp}] ${message}`;
        consoleElement.appendChild(logEntry);
        consoleElement.scrollTop = consoleElement.scrollHeight;
    }

    function updateConnectionStatus(isConnected) {
        if (!connectionIndicator) return;
        if (isConnected) {
            connectionIndicator.classList.add('conectado');
        } else {
            connectionIndicator.classList.remove('conectado');
            if (movementStatus) movementStatus.textContent = 'desconectado';
        }
    }

    function updateVehicleStatus(vehicleData) {
        if (movementStatus) movementStatus.textContent = vehicleData.movimiento;
        
        if (pwmLeftValue) {
            const m_ia = vehicleData.mia !== undefined ? vehicleData.mia : vehicleData.MIA;
            const m_ib = vehicleData.mib !== undefined ? vehicleData.mib : vehicleData.MIB;
            pwmLeftValue.textContent = `${m_ia} / ${m_ib}`;
        }
        if (pwmRightValue) {
            const m_da = vehicleData.mda !== undefined ? vehicleData.mda : vehicleData.MDA;
            const m_db = vehicleData.mdb !== undefined ? vehicleData.mdb : vehicleData.MDB;
            pwmRightValue.textContent = `${m_da} / ${m_db}`;
        }
    }

    function showObstacleAlert(distance) {
        if (alertCard) alertCard.classList.add('alerta-obstaculo'); // asegúrate de tener esta clase CSS para el rojo
        if (obstacleStatus) {
            obstacleStatus.innerHTML = `⚠️ obstaculo a ${distance} cm!`;
            obstacleStatus.className = 'fw-bold text-danger fs-4'; // fs-4 lo hace un poco mas grande
        }
    }

    function clearObstacleAlert() {
        if (alertCard) alertCard.classList.remove('alerta-obstaculo');
        if (obstacleStatus) {
            obstacleStatus.innerHTML = '✓ zona despejada';
            obstacleStatus.className = 'fw-bold text-success';
        }
    }

    function updateHistoryTable(data) {
        const tableBody = document.getElementById('tabla_historial_cuerpo');
        if (!tableBody) return;
        tableBody.innerHTML = '';
        if (!data || !data.success || !data.data) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted"><span class="spinner me-2"></span>sin datos disponibles</td></tr>`;
            return;
        }
        const records = data.data.slice(0, 5);
        records.forEach(record => {
            const row = document.createElement('tr');
            const m_ia = record.mia !== undefined ? record.mia : record.MIA;
            const m_ib = record.mib !== undefined ? record.mib : record.MIB;
            const m_da = record.mda !== undefined ? record.mda : record.MDA;
            const m_db = record.mdb !== undefined ? record.mdb : record.MDB;

            row.innerHTML = `
                <td><span class="badge bg-info text-dark">${record.id_estatus}</span></td>
                <td class="text-muted small">${record.fecha_hora}</td>
                <td class="fw-bold text-primary">${record.movimiento}</td>
                <td><code class="text-primary">${m_ia} / ${m_ib}</code></td>
                <td><code class="text-primary">${m_da} / ${m_db}</code></td>
            `;
            tableBody.appendChild(row);
        });
    }

    function updateSpeedLabel(value) {
        if (speedLabel) speedLabel.textContent = value;
    }

    function showSuccess(message) { writeLog(`✓ ${message}`); }
    function showError(message) { writeLog(`✗ ${message}`); }
    function showInfo(message) { writeLog(`ℹ️ ${message}`); }

    return { writeLog, updateConnectionStatus, updateVehicleStatus, showObstacleAlert, clearObstacleAlert, updateHistoryTable, updateSpeedLabel, showSuccess, showError, showInfo };
})();