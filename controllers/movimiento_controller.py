from flask import request, jsonify
from models.movimiento_model import movimiento_model

class movimiento_controller:
    def __init__(self):
        self.model = movimiento_model()

    def agregar_movimiento(self):
        try:
            data = request.get_json()
            id_movimiento = data.get('id_movimiento')
            
            # guardamos el movimiento
            self.model.agregar_estatus_movimiento(1, id_movimiento)
            
            # devolvemos el resultado para verlo en postman / web
            resultados = self.model.obtener_ultimo_movimiento(1)
            
            return jsonify({
                "success": True, 
                "mensaje": "movimiento registrado",
                "data": resultados 
            }), 200
            
        except Exception as e:
            print("error en bd:", e)
            return jsonify({"success": False, "error": str(e)}), 500

    def obtener_historial(self):
        try:
            id_dispositivo = request.args.get('id_dispositivo', 1)
            resultados = self.model.obtener_ultimos_10(id_dispositivo)
            
            return jsonify({"success": True, "data": resultados}), 200
        except Exception as e:
            print("error en bd:", e)
            return jsonify({"success": False, "error": str(e)}), 500