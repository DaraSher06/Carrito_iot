from models.database import database

class parametro_model:
    def obtener_parametros(self):
        conexion = database.get_connection()
        cursor = conexion.cursor(dictionary=True)
        cursor.execute("select * from parametros")
        resultados = cursor.fetchall()
        cursor.close()
        conexion.close()
        return resultados

    def actualizar_parametro(self, nombre, valor):
        conexion = database.get_connection()
        cursor = conexion.cursor()
        cursor.execute("update parametros set valor = %s where lower(nombre) = lower(%s)", (valor, nombre))
        conexion.commit()
        cursor.close()
        conexion.close()
        return True