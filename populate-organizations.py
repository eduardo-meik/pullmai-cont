#!/usr/bin/env python3
"""
Script para poblar Firebase Firestore con organizaciones extraídas de contrapartes
Utiliza Firebase Admin SDK y lee el archivo organizations-from-contrapartes.json
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

def initialize_firebase():
    """Inicializa Firebase Admin SDK usando las credenciales del service account"""
    try:
        # Verificar si ya está inicializado
        try:
            firebase_admin.get_app()
        except ValueError:
            # Ruta al archivo de credenciales del service account
            service_account_path = "pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json"
            
            # Verificar que el archivo existe
            if not os.path.exists(service_account_path):
                print(f"❌ No se encontró el archivo de credenciales: {service_account_path}")
                return None
            
            # Inicializar Firebase con credenciales del service account
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            print(f"✅ Firebase inicializado correctamente")
        
        return firestore.client()
    
    except Exception as e:
        print(f"❌ Error configurando Firebase: {e}")
        return None

def load_organizations_from_json(file_path: str) -> List[Dict[str, Any]]:
    """Carga las organizaciones desde el archivo JSON"""
    try:
        if not os.path.exists(file_path):
            print(f"❌ No se encontró el archivo: {file_path}")
            return []
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # El archivo contiene un array directamente, no un objeto con key "organizations"
            if isinstance(data, list):
                return data
            else:
                return data.get('organizations', [])
    
    except Exception as e:
        print(f"❌ Error leyendo el archivo JSON: {e}")
        return []

def create_organizations_in_firebase(db, organizations: List[Dict[str, Any]]) -> bool:
    """Crea las organizaciones en Firebase Firestore"""
    try:
        print(f"🏢 Creando {len(organizations)} organizaciones en Firebase...")
        
        organizaciones_ref = db.collection('organizaciones')
        created_count = 0
        updated_count = 0
        
        for org_data in organizations:
            try:                # Crear un ID único basado en el nombre normalizado o usar el ID del JSON
                org_id = org_data.get('id', org_data['nombre'].replace(' ', '_').replace('.', '').replace(',', '').lower())
                
                # Verificar si ya existe
                doc_ref = organizaciones_ref.document(org_id)
                doc = doc_ref.get()
                
                # Preparar los datos de la organización
                organizacion_data = {
                    'nombre': org_data['nombre'],
                    'descripcion': org_data.get('descripcion', f'Organización {org_data["nombre"]}'),
                    'tipo': 'EMPRESA',  # Tipo por defecto
                    'sector': 'General',  # Sector por defecto
                    'pais': 'Chile',  # País por defecto
                    'ciudad': 'Santiago',  # Ciudad por defecto
                    'sitioWeb': '',
                    'logo': org_data.get('logo', ''),
                    'activa': org_data.get('activa', True),
                    'configuracion': org_data.get('configuracion', {}),
                    'creadoPor': 'system',
                    'modificadoPor': 'system'
                }
                
                if doc.exists:
                    # Actualizar datos existentes pero mantener fechas
                    existing_data = doc.to_dict()
                    organizacion_data['fechaCreacion'] = existing_data.get('fechaCreacion', SERVER_TIMESTAMP)
                    organizacion_data['fechaModificacion'] = SERVER_TIMESTAMP
                    
                    doc_ref.update(organizacion_data)
                    updated_count += 1
                    print(f"  ✏️  Actualizada: {org_data['nombre']}")
                else:
                    # Crear nueva organización
                    organizacion_data['fechaCreacion'] = SERVER_TIMESTAMP
                    organizacion_data['fechaModificacion'] = SERVER_TIMESTAMP
                    
                    doc_ref.set(organizacion_data)
                    created_count += 1
                    print(f"  ✅ Creada: {org_data['nombre']}")
                
            except Exception as e:
                print(f"  ❌ Error procesando {org_data.get('nombre', 'Unknown')}: {e}")
                continue
        
        print(f"\n📊 Resumen:")
        print(f"  • Organizaciones creadas: {created_count}")
        print(f"  • Organizaciones actualizadas: {updated_count}")
        print(f"  • Total procesadas: {created_count + updated_count}/{len(organizations)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error general creando organizaciones: {e}")
        return False

def update_contracts_with_organization_ids(db) -> bool:
    """Actualiza los contratos existentes para vincularlos con las organizaciones creadas"""
    try:
        print(f"\n🔗 Actualizando contratos con IDs de organizaciones...")
          # Obtener todas las organizaciones
        organizaciones_ref = db.collection('organizaciones')
        organizaciones = organizaciones_ref.get()
        org_mapping = {}
        
        for org_doc in organizaciones:
            org_data = org_doc.to_dict()
            if org_data and 'nombre' in org_data:
                org_mapping[org_data['nombre']] = org_doc.id
        
        # Obtener todos los contratos
        contratos_ref = db.collection('contratos')
        contratos = contratos_ref.get()
        
        updated_contracts = 0
        
        for contrato_doc in contratos:
            contrato_data = contrato_doc.to_dict()
            contraparte_nombre = contrato_data.get('contraparte', '')
            
            if contraparte_nombre in org_mapping:
                # Actualizar el contrato con el ID de la organización
                contrato_doc.reference.update({
                    'contraparteOrganizacionId': org_mapping[contraparte_nombre],
                    'fechaModificacion': SERVER_TIMESTAMP
                })
                updated_contracts += 1
                print(f"  🔗 Vinculado: {contrato_data.get('numero', 'N/A')} -> {contraparte_nombre}")
        
        print(f"\n📊 Contratos actualizados: {updated_contracts}")
        return True
        
    except Exception as e:
        print(f"❌ Error actualizando contratos: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Iniciando población de organizaciones en Firebase...")
    
    # Inicializar Firebase
    db = initialize_firebase()
    if not db:
        print("❌ No se pudo inicializar Firebase. Terminando.")
        return
    
    # Cargar organizaciones desde JSON
    organizations_file = "organizations-from-contrapartes.json"
    organizations = load_organizations_from_json(organizations_file)
    
    if not organizations:
        print("❌ No se encontraron organizaciones para procesar. Terminando.")
        return
    
    print(f"📋 Encontradas {len(organizations)} organizaciones para procesar")
    
    # Crear organizaciones en Firebase
    success = create_organizations_in_firebase(db, organizations)
    
    if success:
        # Actualizar contratos con IDs de organizaciones
        update_contracts_with_organization_ids(db)
        print("\n🎉 ¡Proceso completado exitosamente!")
    else:
        print("\n❌ El proceso falló.")

if __name__ == "__main__":
    main()
