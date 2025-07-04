#!/usr/bin/env python3
"""
Script to clean up duplicate fields in user documents.
This script will:
1. Remove 'role' field and keep 'rol'
2. Remove 'organizationId' field and keep 'organizacionId'
3. Keep both 'id' and 'uid' as they serve different purposes
"""

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import DELETE_FIELD

def initialize_firebase():
    """Initialize Firebase Admin SDK"""
    try:
        firebase_admin.get_app()
    except ValueError:
        # Use the service account key
        cred = credentials.Certificate("pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json")
        firebase_admin.initialize_app(cred)
    
    return firestore.client()

def clean_user_duplicate_fields():
    """Clean up duplicate fields in user documents"""
    print("🧹 Iniciando limpieza de campos duplicados en usuarios...")
    
    db = initialize_firebase()
    users_ref = db.collection('usuarios')
    
    try:
        # Get all users
        users = users_ref.stream()
        
        update_count = 0
        for user_doc in users:
            user_id = user_doc.id
            user_data = user_doc.to_dict()
            
            # Check if user has duplicate fields
            has_duplicates = False
            updates = {}
            
            # Check for 'role' field (should be 'rol')
            if 'role' in user_data:
                print(f"👤 Usuario {user_id}: Encontrado campo 'role' duplicado")
                # If 'rol' doesn't exist, copy 'role' to 'rol'
                if 'rol' not in user_data:
                    updates['rol'] = user_data['role']
                    print(f"   ✅ Copiando 'role' -> 'rol': {user_data['role']}")
                # Remove 'role' field using DELETE_FIELD
                updates['role'] = DELETE_FIELD
                has_duplicates = True
                print("   🗑️ Eliminando campo 'role'")
            
            # Check for 'organizationId' field (should be 'organizacionId')  
            if 'organizationId' in user_data:
                print(f"👤 Usuario {user_id}: Encontrado campo 'organizationId' duplicado")
                # If 'organizacionId' doesn't exist, copy 'organizationId' to 'organizacionId'
                if 'organizacionId' not in user_data:
                    updates['organizacionId'] = user_data['organizationId']
                    print(f"   ✅ Copiando 'organizationId' -> 'organizacionId': {user_data['organizationId']}")
                # Remove 'organizationId' field using DELETE_FIELD
                updates['organizationId'] = DELETE_FIELD
                has_duplicates = True
                print("   🗑️ Eliminando campo 'organizationId'")
            
            # Apply updates if needed
            if has_duplicates:
                try:
                    users_ref.document(user_id).update(updates)
                    update_count += 1
                    print(f"   ✅ Usuario {user_id} actualizado exitosamente")
                except Exception as e:
                    print(f"   ❌ Error actualizando usuario {user_id}: {e}")
            else:
                print(f"👤 Usuario {user_id}: Sin campos duplicados")
        
        print(f"\n✅ Limpieza completada. {update_count} usuarios actualizados.")
        
    except Exception as e:
        print(f"❌ Error durante la limpieza: {e}")
        return False
    
    return True

def verify_cleanup():
    """Verify that the cleanup was successful"""
    print("\n🔍 Verificando limpieza...")
    
    db = initialize_firebase()
    users_ref = db.collection('usuarios')
    
    try:
        users = users_ref.stream()
        
        duplicates_found = 0
        for user_doc in users:
            user_id = user_doc.id
            user_data = user_doc.to_dict()
            
            # Check for remaining duplicate fields
            if 'role' in user_data:
                print(f"⚠️ Usuario {user_id}: Aún tiene campo 'role'")
                duplicates_found += 1
            
            if 'organizationId' in user_data:
                print(f"⚠️ Usuario {user_id}: Aún tiene campo 'organizationId'")
                duplicates_found += 1
        
        if duplicates_found == 0:
            print("✅ Verificación exitosa: No se encontraron campos duplicados")
        else:
            print(f"⚠️ Se encontraron {duplicates_found} campos duplicados restantes")
        
        return duplicates_found == 0
        
    except Exception as e:
        print(f"❌ Error durante la verificación: {e}")
        return False

def main():
    """Main function"""
    print("🚀 Iniciando script de limpieza de campos duplicados")
    print("=" * 60)
    
    # Clean up duplicate fields
    if clean_user_duplicate_fields():
        # Verify the cleanup
        if verify_cleanup():
            print("\n🎉 ¡Limpieza completada exitosamente!")
        else:
            print("\n⚠️ Limpieza completada con advertencias. Revisa los logs.")
    else:
        print("\n❌ La limpieza falló. Revisa los logs para más detalles.")

if __name__ == "__main__":
    main()
