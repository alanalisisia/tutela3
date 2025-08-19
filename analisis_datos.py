import pandas as pd
import json
import os
from datetime import datetime

def crear_directorios():
    """Crear estructura de directorios para el proyecto"""
    directorios = ['data', 'css', 'js', 'assets']
    for directorio in directorios:
        if not os.path.exists(directorio):
            os.makedirs(directorio)

def limpiar_dataframe(df):
    """Limpiar DataFrame eliminando columnas innecesarias y valores NaN"""
    # Eliminar columnas que empiecen con 'Unnamed'
    columnas_a_eliminar = [col for col in df.columns if 'Unnamed' in str(col)]
    if columnas_a_eliminar:
        df = df.drop(columns=columnas_a_eliminar)
    
    # Eliminar filas completamente vacías
    df = df.dropna(how='all')
    
    # Eliminar columnas completamente vacías
    df = df.dropna(axis=1, how='all')
    
    return df

def cargar_excel():
    """Cargar el archivo Excel y todas sus hojas"""
    archivo_excel = "Derechos_Peticion_Salud_Nueva_EPS_Simulacion_Tutela.xlsx"
    
    try:
        # Cargar todas las hojas
        datos = pd.read_excel(archivo_excel, sheet_name="Datos")
        resumen_kpi = pd.read_excel(archivo_excel, sheet_name="Resumen_KPI")
        por_mes = pd.read_excel(archivo_excel, sheet_name="Por_Mes")
        por_departamento = pd.read_excel(archivo_excel, sheet_name="Por_Departamento")
        por_tipo = pd.read_excel(archivo_excel, sheet_name="Por_Tipo")
        por_estado = pd.read_excel(archivo_excel, sheet_name="Por_Estado")
        por_resultado = pd.read_excel(archivo_excel, sheet_name="Por_Resultado")
        por_tutela = pd.read_excel(archivo_excel, sheet_name="Por_Tutela")
        
        # Limpiar todos los DataFrames
        datos = limpiar_dataframe(datos)
        resumen_kpi = limpiar_dataframe(resumen_kpi)
        por_mes = limpiar_dataframe(por_mes)
        por_departamento = limpiar_dataframe(por_departamento)
        por_tipo = limpiar_dataframe(por_tipo)
        por_estado = limpiar_dataframe(por_estado)
        por_resultado = limpiar_dataframe(por_resultado)
        por_tutela = limpiar_dataframe(por_tutela)
        
        print(f"✅ Datos cargados exitosamente:")
        print(f"   - Datos principales: {len(datos)} registros")
        print(f"   - Por departamento: {len(por_departamento)} departamentos")
        print(f"   - Por tipo: {len(por_tipo)} tipos")
        print(f"   - Por mes: {len(por_mes)} meses")
        
        return {
            'datos': datos,
            'resumen_kpi': resumen_kpi,
            'por_mes': por_mes,
            'por_departamento': por_departamento,
            'por_tipo': por_tipo,
            'por_estado': por_estado,
            'por_resultado': por_resultado,
            'por_tutela': por_tutela
        }
    except Exception as e:
        print(f"❌ Error cargando Excel: {e}")
        return None

def generar_analisis_datos(datos):
    """Generar análisis adicionales de los datos principales"""
    try:
        # Convertir fecha de radicación a datetime si no lo está
        if 'Fecha radicación' in datos.columns:
            datos['Fecha radicación'] = pd.to_datetime(datos['Fecha radicación'])
        
        # Análisis por sexo
        if 'Sexo' in datos.columns:
            analisis_sexo = datos['Sexo'].value_counts().reset_index()
            analisis_sexo.columns = ['Sexo', 'Total']
        else:
            analisis_sexo = pd.DataFrame({'Sexo': ['No disponible'], 'Total': [0]})
        
        # Análisis por edad (rangos)
        if 'Edad' in datos.columns:
            datos['Rango_Edad'] = pd.cut(datos['Edad'], 
                                        bins=[0, 18, 30, 50, 65, 100], 
                                        labels=['0-18', '19-30', '31-50', '51-65', '65+'])
            analisis_edad = datos['Rango_Edad'].value_counts().reset_index()
            analisis_edad.columns = ['Rango_Edad', 'Total']
        else:
            analisis_edad = pd.DataFrame({'Rango_Edad': ['No disponible'], 'Total': [0]})
        
        # Análisis por canal de radicación
        if 'Canal de radicación' in datos.columns:
            analisis_canal = datos['Canal de radicación'].value_counts().reset_index()
            analisis_canal.columns = ['Canal_Radicacion', 'Total']
        else:
            analisis_canal = pd.DataFrame({'Canal_Radicacion': ['No disponible'], 'Total': [0]})
        
        # Análisis por régimen
        if 'Régimen' in datos.columns:
            analisis_regimen = datos['Régimen'].value_counts().reset_index()
            analisis_regimen.columns = ['Regimen', 'Total']
        else:
            analisis_regimen = pd.DataFrame({'Regimen': ['No disponible'], 'Total': [0]})
        
        return {
            'analisis_sexo': analisis_sexo,
            'analisis_edad': analisis_edad,
            'analisis_canal': analisis_canal,
            'analisis_regimen': analisis_regimen
        }
    except Exception as e:
        print(f"❌ Error en análisis adicional: {e}")
        return None

def guardar_json(data, nombre_archivo):
    """Guardar DataFrame como JSON"""
    ruta_archivo = f"data/{nombre_archivo}.json"
    
    try:
        # Convertir DataFrame a formato JSON compatible con JavaScript
        if isinstance(data, pd.DataFrame):
            # Manejar tipos de datos especiales
            json_data = data.copy()
            
            # Convertir fechas a string
            for col in json_data.columns:
                if json_data[col].dtype == 'datetime64[ns]':
                    json_data[col] = json_data[col].dt.strftime('%Y-%m-%d')
                elif json_data[col].dtype == 'bool':
                    json_data[col] = json_data[col].astype(int)
            
            # Convertir a lista de diccionarios
            json_data = json_data.to_dict('records')
        
        with open(ruta_archivo, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Archivo guardado: {ruta_archivo} ({len(json_data) if isinstance(json_data, list) else 1} registros)")
        
    except Exception as e:
        print(f"❌ Error guardando {nombre_archivo}: {e}")

def main():
    """Función principal del análisis"""
    print("🚀 Iniciando análisis de datos...")
    
    # Crear directorios
    crear_directorios()
    
    # Cargar datos del Excel
    print("📊 Cargando archivo Excel...")
    hojas = cargar_excel()
    
    if hojas is None:
        print("❌ No se pudieron cargar los datos del Excel")
        return
    
    # Guardar datos principales
    print("💾 Guardando archivos JSON...")
    guardar_json(hojas['datos'], 'datos')
    guardar_json(hojas['resumen_kpi'], 'resumen_kpi')
    guardar_json(hojas['por_mes'], 'por_mes')
    guardar_json(hojas['por_departamento'], 'por_departamento')
    guardar_json(hojas['por_tipo'], 'por_tipo')
    guardar_json(hojas['por_estado'], 'por_estado')
    guardar_json(hojas['por_resultado'], 'por_resultado')
    guardar_json(hojas['por_tutela'], 'por_tutela')
    
    # Generar análisis adicionales
    print("📈 Generando análisis adicionales...")
    analisis_adicional = generar_analisis_datos(hojas['datos'])
    
    if analisis_adicional:
        guardar_json(analisis_adicional['analisis_sexo'], 'analisis_sexo')
        guardar_json(analisis_adicional['analisis_edad'], 'analisis_edad')
        guardar_json(analisis_adicional['analisis_canal'], 'analisis_canal')
        guardar_json(analisis_adicional['analisis_regimen'], 'analisis_regimen')
    
    # Generar resumen estadístico
    try:
        resumen_estadistico = {
            'total_registros': len(hojas['datos']),
            'fecha_analisis': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'columnas_disponibles': list(hojas['datos'].columns),
            'rangos_fecha': {
                'inicio': hojas['datos']['Fecha radicación'].min().strftime('%Y-%m-%d') if 'Fecha radicación' in hojas['datos'].columns else 'N/A',
                'fin': hojas['datos']['Fecha radicación'].max().strftime('%Y-%m-%d') if 'Fecha radicación' in hojas['datos'].columns else 'N/A'
            }
        }
        
        with open('data/resumen_estadistico.json', 'w', encoding='utf-8') as f:
            json.dump(resumen_estadistico, f, ensure_ascii=False, indent=2)
        
        print("✅ Resumen estadístico guardado: data/resumen_estadistico.json")
        
    except Exception as e:
        print(f"❌ Error generando resumen estadístico: {e}")
    
    print("🎉 Análisis completado exitosamente!")
    print(f"📁 Archivos generados en la carpeta 'data/':")
    for archivo in sorted(os.listdir('data')):
        if archivo.endswith('.json'):
            print(f"   - {archivo}")

if __name__ == "__main__":
    main()

