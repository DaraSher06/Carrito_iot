from models.database import database

class movimiento_model:
    def agregar_estatus_movimiento(self, id_dispositivo, id_movimiento):
        conexion = database.get_connection()
        cursor = conexion.cursor(dictionary=True)
        
        args = (id_dispositivo, id_movimiento, 0)
        cursor.callproc('sp_agregar_estatus_movimiento', args)
        conexion.commit()
        
        cursor.close()
        conexion.close()
        return True

    def obtener_ultimo_movimiento(self, id_dispositivo):
        conexion = database.get_connection()
        cursor = conexion.cursor(dictionary=True)
        
        cursor.callproc('sp_ultimo_movimiento', (id_dispositivo,))
        
        resultados = []
        for result in cursor.stored_results():
            resultados = result.fetchall()
            
        cursor.close()
        conexion.close()
        return resultados

    def obtener_ultimos_10(self, id_dispositivo):
        conexion = database.get_connection()
        cursor = conexion.cursor(dictionary=True)
        
        cursor.callproc('sp_ultimos_10_movimientos', (id_dispositivo,))
        
        resultados = []
        for result in cursor.stored_results():
            resultados = result.fetchall()
            
        cursor.close()
        conexion.close()
        return resultados