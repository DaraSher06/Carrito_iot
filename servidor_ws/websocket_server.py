import json
from models.movimiento_model import movimiento_model

class websocket_server:
    def __init__(self):
        self.mov_model = movimiento_model()
        # el megafono: lista para recordar a todos los conectados (carro y web)
        self.clientes = set()

    def procesar_conexion(self, ws):
        print("[backend] cliente conectado al websocket")
        self.clientes.add(ws) # agregamos al nuevo cliente a la lista
        
        while True:
            try:
                mensaje = ws.receive()
                if mensaje is None:
                    print("[backend] cliente desconectado")
                    if ws in self.clientes:
                        self.clientes.remove(ws)
                    break
                    
                try:
                    datos = json.loads(mensaje)
                except ValueError:
                    continue 
                
                # logica de movimiento intacta
                if datos.get("accion") == "obtener_movimiento":
                    resultados = self.mov_model.obtener_ultimo_movimiento(1)
                    if resultados:
                        respuesta = {"success": True, "data": resultados}
                    else:
                        respuesta = {"success": False, "data": []}
                        
                    ws.send(json.dumps(respuesta, default=str))

                # logica del obstaculo con el megafono activado
                elif datos.get("accion") == "registrar_obstaculo":
                    distancia = datos.get("distancia")
                    print(f"[alerta] obstaculo detectado a {distancia} cm. retransmitiendo a la web...")
                    
                    # armamos el paquete de alerta para la web
                    alerta = {
                        "accion": "registrar_obstaculo",
                        "distancia": distancia,
                        "distancia_cm": distancia
                    }
                    mensaje_alerta = json.dumps(alerta)
                    
                    # gritamos la alerta a todas las pantallas conectadas
                    for cliente in list(self.clientes):
                        try:
                            cliente.send(mensaje_alerta)
                        except Exception:
                            pass
                            
            except Exception as e:
                print(f"[backend] conexion cerrada o error: {e}")
                if ws in self.clientes:
                    self.clientes.remove(ws)
                break