#!/usr/bin/env python3
"""
Script para actualizar contratos restantes con contraparteOrganizacionId
"""

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

def initialize_firebase():
    try:
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate('pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json')
        firebase_admin.initialize_app(cred)
    return firestore.client()

def update_remaining_contracts():
    print("🔗 Actualizando contratos restantes con IDs de organizaciones...")
    
    db = initialize_firebase()
    
    # Obtener todas las organizaciones para mapear nombres a IDs
    orgs_ref = db.collection('organizaciones')
    orgs = orgs_ref.get()
    org_mapping = {}
    
    for org_doc in orgs:
        org_data = org_doc.to_dict()
        if org_data and 'nombre' in org_data:
            org_mapping[org_data['nombre']] = org_doc.id
    
    print(f"📋 Encontradas {len(org_mapping)} organizaciones:")
    for nombre, org_id in org_mapping.items():
        print(f"  • {nombre} -> {org_id}")
    
    # Obtener contratos que no tienen contraparteOrganizacionId
    contratos_ref = db.collection('contratos')
    contratos = contratos_ref.get()
    
    updated_count = 0
    skipped_count = 0
    not_found_count = 0
    
    for contrato_doc in contratos:
        contrato_data = contrato_doc.to_dict()
        
        # Skip si ya tiene contraparteOrganizacionId
        if contrato_data.get('contraparteOrganizacionId'):
            skipped_count += 1
            continue
        
        contraparte_nombre = contrato_data.get('contraparte', '')
        
        if contraparte_nombre in org_mapping:
            # Actualizar el contrato
            contrato_doc.reference.update({
                'contraparteOrganizacionId': org_mapping[contraparte_nombre],
                'fechaModificacion': SERVER_TIMESTAMP
            })
            updated_count += 1
            print(f"  ✅ Actualizado: {contrato_data.get('titulo', 'N/A')} -> {contraparte_nombre}")
        elif contraparte_nombre:
            not_found_count += 1
            print(f"  ⚠️  No encontrada organización para: {contraparte_nombre}")
    
    print(f"\n📊 Resumen:")
    print(f"  • Contratos actualizados: {updated_count}")
    print(f"  • Contratos omitidos (ya tenían ID): {skipped_count}")
    print(f"  • Contrapartes no encontradas: {not_found_count}")

if __name__ == "__main__":
    update_remaining_contracts()
