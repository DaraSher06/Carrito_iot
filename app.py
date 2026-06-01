from flask import Flask, request, jsonify
from flask_sock import Sock
from flask_cors import CORS
import threading
import time
from controllers.movimiento_controller import movimiento_controller
from controllers.parametro_controller import parametro_controller
from servidor_ws.websocket_server import websocket_server

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
sock = Sock(app)

ctrl_movimiento = movimiento_controller()
ctrl_parametro = parametro_controller()
ws_server = websocket_server()

# memoria global para la ruta grabada
rutina_guardada = []

@app.route('/api/movimiento', methods=['POST', 'OPTIONS'])
def api_agregar_movimiento():
    if request.method == 'OPTIONS': return '', 200
    return ctrl_movimiento.agregar_movimiento()

@app.route('/api/movimiento/ultimo', methods=['GET', 'OPTIONS'])
def api_obtener_historial():
    if request.method == 'OPTIONS': return '', 200
    return ctrl_movimiento.obtener_historial()

@app.route('/api/parametros', methods=['GET', 'OPTIONS'])
def api_obtener_parametros():
    if request.method == 'OPTIONS': return '', 200
    return ctrl_parametro.obtener_parametros()

@app.route('/api/parametro', methods=['PUT', 'OPTIONS'])
def api_actualizar_parametro():
    if request.method == 'OPTIONS': return '', 200
    return ctrl_parametro.actualizar_parametro()

# nuevo endpoint para guardar la grabacion silenciosa
@app.route('/api/demo/grabar', methods=['POST', 'OPTIONS'])
def api_grabar_demo():
    if request.method == 'OPTIONS': return '', 200
    global rutina_guardada
    data = request.json
    rutina_guardada = data.get('secuencia', [])
    return jsonify({"success": True, "mensaje": "ruta guardada con exito"}), 200

def rutina_ruta_cuadrada():
    global rutina_guardada
    # si hay una grabacion, usa esa. si no, usa la ruta cuadrada por defecto
    secuencia = rutina_guardada if len(rutina_guardada) > 0 else [1, 9, 1, 9, 1, 9, 1, 9]
    for mov in secuencia:
        ctrl_movimiento.model.agregar_estatus_movimiento(1, mov)
        time.sleep(1.5) # espera 1.5 segs entre cada instruccion
    ctrl_movimiento.model.agregar_estatus_movimiento(1, 3) # detener al final

@app.route('/api/demo/ejecutar', methods=['POST', 'OPTIONS'])
def api_ejecutar_demo():
    if request.method == 'OPTIONS': return '', 200
    hilo = threading.Thread(target=rutina_ruta_cuadrada)
    hilo.start()
    return jsonify({"success": True, "mensaje": "secuencia demo iniciada"}), 200

@sock.route('/ws')
def api_websocket(ws):
    ws_server.procesar_conexion(ws)

if __name__ == '__main__':
    print("iniciando servidor iot completo en puerto 5000...")
    app.run(host='0.0.0.0', port=5000)