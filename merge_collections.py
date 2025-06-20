#!/usr/bin/env python3
"""
Script para fusionar las colecciones 'usuarios' y 'users' en Firestore
Mantiene 'users' como la colección principal y elimina 'usuarios'
"""

import os
from datetime import datetime
from typing import Dict, Any, List
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def initialize_firebase():
    """Inicializa Firebase Admin SDK usando service account"""
    try:
        if not firebase_admin._apps:
            # Usar el archivo de credenciales del service account
            cred = credentials.Certificate("pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json")
            firebase_admin.initialize_app(cred)
            print(f"✅ Firebase inicializado con service account")
        
        return firestore.client()
    
    except Exception as e:
        print(f"❌ Error configurando Firebase: {e}")
        return None

def merge_collections(db):
    """Fusiona las colecciones 'usuarios' y 'users' manteniendo 'users' como principal"""
    print(f"\n🔄 Iniciando fusión de colecciones 'usuarios' y 'users'...")
    
    # Referencias a las colecciones
    usuarios_ref = db.collection('usuarios')
    users_ref = db.collection('users')
    
    # Obtener todos los documentos de ambas colecciones
    usuarios_docs = usuarios_ref.get()
    users_docs = users_ref.get()
    
    print(f"📊 Documentos encontrados:")
    print(f"   - usuarios: {len(usuarios_docs)}")
    print(f"   - users: {len(users_docs)}")
    
    # Crear un diccionario con los datos de 'users' existentes (tienen prioridad)
    users_data = {}
    for doc in users_docs:
        users_data[doc.id] = doc.to_dict()
        print(f"✅ Usuario existente en 'users': {doc.id}")
    
    # Migrar datos de 'usuarios' que no existen en 'users'
    migrated_count = 0
    updated_count = 0
    
    for doc in usuarios_docs:
        user_id = doc.id
        user_data = doc.to_dict()
        
        if user_id not in users_data:
            # Migrar usuario de 'usuarios' a 'users'
            try:
                users_ref.document(user_id).set(user_data)
                migrated_count += 1
                print(f"🔄 Migrado de 'usuarios' a 'users': {user_id}")
            except Exception as e:
                print(f"❌ Error migrando {user_id}: {e}")
        else:
            # El usuario ya existe en 'users', opcionalmente actualizar campos faltantes
            existing_data = users_data[user_id]
            updated_data = existing_data.copy()
            needs_update = False
            
            # Verificar si hay campos en 'usuarios' que no están en 'users'
            for key, value in user_data.items():
                if key not in existing_data or existing_data[key] is None:
                    updated_data[key] = value
                    needs_update = True
            
            if needs_update:
                try:
                    users_ref.document(user_id).update(updated_data)
                    updated_count += 1
                    print(f"🔄 Actualizado en 'users': {user_id}")
                except Exception as e:
                    print(f"❌ Error actualizando {user_id}: {e}")
            else:
                print(f"ℹ️ Usuario {user_id} ya está completo en 'users'")
    
    print(f"\n📊 Resumen de migración:")
    print(f"   ✅ Usuarios migrados: {migrated_count}")
    print(f"   🔄 Usuarios actualizados: {updated_count}")
    print(f"   📁 Total procesados: {len(usuarios_docs)}")
    
    return migrated_count, updated_count

def delete_usuarios_collection(db):
    """Elimina la colección 'usuarios' después de la migración"""
    print(f"\n🗑️ Eliminando colección 'usuarios'...")
    
    usuarios_ref = db.collection('usuarios')
    docs = usuarios_ref.get()
    
    deleted_count = 0
    batch = db.batch()
    
    for doc in docs:
        batch.delete(doc.reference)
        deleted_count += 1
    
    batch.commit()
    print(f"✅ Eliminados {deleted_count} documentos de 'usuarios'")
    
    return deleted_count

def verify_migration(db):
    """Verifica que la migración se haya completado correctamente"""
    print(f"\n🔍 Verificando migración...")
    
    users_ref = db.collection('users')
    usuarios_ref = db.collection('usuarios')
    
    users_docs = users_ref.get()
    usuarios_docs = usuarios_ref.get()
    
    print(f"📊 Estado final:")
    print(f"   - users: {len(users_docs)} documentos")
    print(f"   - usuarios: {len(usuarios_docs)} documentos")
    
    if len(usuarios_docs) == 0:
        print("✅ Migración completada: colección 'usuarios' eliminada")
    else:
        print("⚠️ Advertencia: la colección 'usuarios' aún contiene documentos")
    
    # Mostrar algunos ejemplos de usuarios en 'users'
    if users_docs:
        print(f"\n📄 Primeros usuarios en 'users':")
        for i, doc in enumerate(users_docs[:3]):
            data = doc.to_dict()
            email = data.get('email', 'Sin email')
            nombre = data.get('nombre', 'Sin nombre')
            print(f"   {i+1}. {doc.id} - {nombre} ({email})")

def main():
    """Función principal"""
    print("🔥 Fusión de Colecciones: usuarios → users")
    print("=" * 50)
    
    # Inicializar Firebase
    db = initialize_firebase()
    if not db:
        print("❌ No se pudo inicializar Firebase")
        return
    
    # Confirmar la operación
    print("⚠️  IMPORTANTE: Esta operación fusionará las colecciones 'usuarios' y 'users'")
    print("   - Los datos se migrarán a 'users'")
    print("   - La colección 'usuarios' será eliminada")
    print("   - Esta operación NO es reversible")
    
    confirm = input("\n¿Continuar? (escriba 'SI' para confirmar): ")
    if confirm != 'SI':
        print("❌ Operación cancelada")
        return
    
    try:
        # Paso 1: Fusionar colecciones
        migrated, updated = merge_collections(db)
          # Paso 2: Eliminar colección 'usuarios' solo si la migración fue exitosa
        deleted = 0
        if migrated >= 0 and updated >= 0:
            deleted = delete_usuarios_collection(db)
        
        # Paso 3: Verificar migración
        verify_migration(db)
        
        print(f"\n🎉 Migración completada exitosamente!")
        print(f"   📊 Usuarios migrados: {migrated}")
        print(f"   🔄 Usuarios actualizados: {updated}")
        print(f"   🗑️ Documentos eliminados: {deleted}")
        
    except Exception as e:
        print(f"❌ Error durante la migración: {e}")

if __name__ == "__main__":
    main()
