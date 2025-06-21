#!/usr/bin/env python3
"""
Script para poblar la base de datos con contrapartes de ejemplo
"""

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        firebase_admin.get_app()
    except ValueError:
        # Use the service account key
        cred = credentials.Certificate("pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json")
        firebase_admin.initialize_app(cred)
    
    return firestore.client()

def create_sample_contrapartes():
    """Create sample contrapartes in Firestore"""
    print("🏢 Creando contrapartes de ejemplo...")
    
    db = initialize_firebase()
    contrapartes_ref = db.collection('contrapartes')
    
    # Sample contrapartes data
    contrapartes_data = [
        {
            'nombre': 'Microsoft Chile',
            'tipo': 'organizacion',
            'email': 'contacto@microsoft.cl',
            'telefono': '+56 2 2345 6789',
            'direccion': 'Av. Providencia 1760, Piso 15',
            'pais': 'Chile',
            'ciudad': 'Santiago',
            'rut': '96.571.220-8',
            'giro': 'Desarrollo de Software y Tecnología',
            'sitioWeb': 'https://www.microsoft.com/es-cl',
            'contactoPrincipal': 'María González',
            'emailContacto': 'maria.gonzalez@microsoft.cl',
            'telefonoContacto': '+56 9 8765 4321',
            'organizacionId': 'MEIK LABS',
            'creadoPor': 'sGcgoyn0GJcb5bbSKN6auhOsFaj1',
            'modificadoPor': 'sGcgoyn0GJcb5bbSKN6auhOsFaj1',
            'activo': True,
            'notas': 'Proveedor principal de licencias de software empresarial y soluciones en la nube.'
        },
        {
            'nombre': 'AWS Chile',
            'tipo': 'organizacion',
            'email': 'ventas@aws.amazon.com',
            'telefono': '+56 2 2987 6543',
            'direccion': 'Av. Nueva Tajamar 481, Torre Norte, Piso 21',
            'pais': 'Chile',
            'ciudad': 'Santiago',
            'rut': '76.354.771-K',
            'giro': 'Servicios de Computación en la Nube',
            'sitioWeb': 'https://aws.amazon.com',
            'contactoPrincipal': 'Carlos Mendoza',
            'emailContacto': 'carlos.mendoza@amazon.com',
            'telefonoContacto': '+56 9 7654 3210',
            'organizacionId': 'MEIK LABS',
            'creadoPor': 'sGcgoyn0GJcb5bbSKN6auhOsFaj1',
            'modificadoPor': 'sGcgoyn0GJcb5bbSKN6auhOsFaj1',
            'activo': True,
            'notas': 'Proveedor de infraestructura cloud y servicios de hosting para nuestras aplicaciones.'
        },
        {
            'nombre': 'Juan Carlos Pérez',
            'tipo': 'persona',
            'email': 'jc.perez@consultor.cl',
            'telefono': '+56 9 9876 5432',
            'direccion': 'Las Condes 12345, Depto 67',
            'pais': 'Chile',
            'ciudad': 'Santiago',
            'rut': '12.345.678-9',
            'giro': 'Consultor en Transformación Digital',
            'contactoPrincipal': 'Juan Carlos Pérez',
            'emailContacto': 'jc.perez@consultor.cl',
            'organizacionId': 'MEIK LABS',
            'creadoPor': 'sGcgoyn0GJcb5bbSKN6auhOsFaj1',
            'modificadoPor': 'sGcgoyn0GJcb5bbSKN6auhOsFaj1',
            'activo': True,
            'notas': 'Consultor especializado en procesos de digitalización empresarial.'
        }
    ]
    
    try:
        created_count = 0
        
        for contraparte_data in contrapartes_data:
            # Add timestamps
            contraparte_data['fechaCreacion'] = SERVER_TIMESTAMP
            contraparte_data['fechaModificacion'] = SERVER_TIMESTAMP
            
            # Check if contraparte already exists
            existing = contrapartes_ref.where('nombre', '==', contraparte_data['nombre']).where('organizacionId', '==', contraparte_data['organizacionId']).limit(1).get()
            
            if len(existing) == 0:
                doc_ref = contrapartes_ref.add(contraparte_data)
                print(f"✅ Contraparte creada: {contraparte_data['nombre']} (ID: {doc_ref[1].id})")
                created_count += 1
            else:
                print(f"⚠️ Contraparte ya existe: {contraparte_data['nombre']}")
        
        print(f"\n🎉 Proceso completado. {created_count} contrapartes creadas.")
        
    except Exception as e:
        print(f"❌ Error creando contrapartes: {e}")
        return False
    
    return True

def main():
    """Main function"""
    print("🚀 Iniciando script de poblado de contrapartes")
    print("=" * 60)
    
    if create_sample_contrapartes():
        print("\n✅ ¡Script ejecutado exitosamente!")
    else:
        print("\n❌ El script falló. Revisa los logs para más detalles.")

if __name__ == "__main__":
    main()
