from flask import jsonify, request
from models.parametro_model import parametro_model

class parametro_controller:
    def __init__(self):
        self.model = parametro_model()

    def obtener_parametros(self):
        try:
            resultados = self.model.obtener_parametros()
            return jsonify({"success": True, "data": resultados}), 200
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    def actualizar_parametro(self):
        try:
            data = request.get_json()
            nombre = data.get('nombre')
            valor = data.get('valor')
            self.model.actualizar_parametro(nombre, valor)
            return jsonify({"success": True, "mensaje": "parametro actualizado"}), 200
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500