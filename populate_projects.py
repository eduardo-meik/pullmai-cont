#!/usr/bin/env python3
"""
Script para poblar Firebase Firestore con proyectos de ejemplo
Utiliza Firebase Admin SDK y credenciales del service account
"""

import os
import json
from datetime import datetime, timedelta
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

def generate_unique_id() -> str:
    """Genera un ID único para los proyectos"""
    from time import time
    import random
    import string
    timestamp = int(time() * 1000)
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=9))
    return f"project_{timestamp}_{random_str}"

def create_project_data() -> List[Dict[str, Any]]:
    """Crea los datos de proyectos basados en proyectosEjemplo.ts"""
    
    projects = [
        {
            "nombre": "Sistema ERP",
            "descripcion": "Implementación completa de sistema de planificación de recursos empresariales para modernizar la gestión organizacional y mejorar la eficiencia operativa.",
            "estado": "EN_CURSO",
            "prioridad": "ALTA",
            "fechaInicio": datetime(2024, 1, 1),
            "fechaFinEstimada": datetime(2025, 12, 31),
            "presupuestoTotal": 120000000,
            "presupuestoGastado": 85000000,
            "moneda": "CLP",
            "responsableId": "user-001",
            "organizacionId": "org-001",
            "departamento": "Tecnología",
            "equipoIds": ["user-001", "user-007", "user-008"],
            "numeroContratos": 2,
            "valorTotalContratos": 97000000,
            "contratosActivos": 1,
            "contratosPendientes": 1,
            "etiquetas": ["tecnología", "erp", "software", "transformación-digital"],
            "color": "#3B82F6",
            "icono": "🖥️"
        },
        
        {
            "nombre": "Expansión Oficinas",
            "descripcion": "Proyecto de expansión física de la organización con nuevas oficinas, equipamiento y mobiliario para soportar el crecimiento empresarial.",
            "estado": "EN_CURSO",
            "prioridad": "MEDIA",
            "fechaInicio": datetime(2024, 2, 1),
            "fechaFinEstimada": datetime(2024, 8, 31),
            "presupuestoTotal": 35000000,
            "presupuestoGastado": 28500000,
            "moneda": "CLP",
            "responsableId": "user-002",
            "organizacionId": "org-001",
            "departamento": "Administración",
            "equipoIds": ["user-002", "user-009", "user-010"],
            "numeroContratos": 2,
            "valorTotalContratos": 28500000,
            "contratosActivos": 2,
            "contratosPendientes": 0,
            "etiquetas": ["expansión", "oficinas", "infraestructura", "mobiliario"],
            "color": "#10B981",
            "icono": "🏢"
        },
        
        {
            "nombre": "Marketing Digital",
            "descripcion": "Estrategia integral de marketing digital para aumentar la presencia online, generar leads y fortalecer la marca en el mercado digital.",
            "estado": "EN_CURSO",
            "prioridad": "ALTA",
            "fechaInicio": datetime(2024, 5, 1),
            "fechaFinEstimada": datetime(2025, 6, 30),
            "presupuestoTotal": 35000000,
            "presupuestoGastado": 18000000,
            "moneda": "CLP",
            "responsableId": "user-003",
            "organizacionId": "org-001",
            "departamento": "Marketing",
            "equipoIds": ["user-003", "user-011", "user-012"],
            "numeroContratos": 2,
            "valorTotalContratos": 30500000,
            "contratosActivos": 2,
            "contratosPendientes": 0,
            "etiquetas": ["marketing", "digital", "branding", "contenido"],
            "color": "#F59E0B",
            "icono": "📱"
        },
        
        {
            "nombre": "Recursos Humanos",
            "descripcion": "Modernización de procesos de RRHH, incorporación de nuevo talento e implementación de sistemas de gestión del talento.",
            "estado": "EN_CURSO",
            "prioridad": "MEDIA",
            "fechaInicio": datetime(2024, 7, 1),
            "fechaFinEstimada": datetime(2025, 12, 31),
            "presupuestoTotal": 45000000,
            "presupuestoGastado": 17800000,
            "moneda": "CLP",
            "responsableId": "user-004",
            "organizacionId": "org-001",
            "departamento": "Recursos Humanos",
            "equipoIds": ["user-004", "user-013", "user-014"],
            "numeroContratos": 2,
            "valorTotalContratos": 17800000,
            "contratosActivos": 2,
            "contratosPendientes": 0,
            "etiquetas": ["rrhh", "talento", "consultoría", "gestión"],
            "color": "#8B5CF6",
            "icono": "👥"
        },
        
        {
            "nombre": "Ventas Internacionales",
            "descripcion": "Expansión hacia mercados internacionales con foco en América Latina, incluyendo acuerdos de distribución y servicios de soporte.",
            "estado": "PLANIFICACION",
            "prioridad": "ALTA",
            "fechaInicio": datetime(2024, 9, 1),
            "fechaFinEstimada": datetime(2027, 12, 31),
            "presupuestoTotal": 25000000,
            "presupuestoGastado": 8500000,
            "moneda": "CLP",
            "responsableId": "user-005",
            "organizacionId": "org-001",
            "departamento": "Ventas",
            "equipoIds": ["user-005", "user-015", "user-016"],
            "numeroContratos": 2,
            "valorTotalContratos": 8500000,
            "contratosActivos": 1,
            "contratosPendientes": 1,
            "etiquetas": ["internacional", "ventas", "distribución", "latam"],
            "color": "#EF4444",
            "icono": "🌎"
        },
        
        {
            "nombre": "Mantenimiento y Soporte",
            "descripcion": "Servicios continuos de mantenimiento de equipos, suministros de oficina y soporte técnico para garantizar la operación diaria.",
            "estado": "EN_CURSO",
            "prioridad": "MEDIA",
            "fechaInicio": datetime(2024, 12, 1),
            "fechaFinEstimada": datetime(2025, 12, 31),
            "presupuestoTotal": 12000000,
            "presupuestoGastado": 0,
            "moneda": "CLP",
            "responsableId": "user-002",
            "organizacionId": "org-001",
            "departamento": "Administración",
            "equipoIds": ["user-001", "user-002", "user-017"],
            "numeroContratos": 2,
            "valorTotalContratos": 8400000,
            "contratosActivos": 0,
            "contratosPendientes": 2,
            "etiquetas": ["mantenimiento", "soporte", "equipos", "suministros"],
            "color": "#6B7280",
            "icono": "🔧"
        },
        
        {
            "nombre": "Auditoría y Compliance",
            "descripcion": "Procesos de auditoría externa, cumplimiento normativo y mejora de procesos internos para garantizar la transparencia organizacional.",
            "estado": "COMPLETADO",
            "prioridad": "MEDIA",
            "fechaInicio": datetime(2024, 1, 1),
            "fechaFinEstimada": datetime(2024, 3, 31),
            "fechaFinReal": datetime(2024, 3, 31),
            "presupuestoTotal": 20000000,
            "presupuestoGastado": 18000000,
            "moneda": "CLP",
            "responsableId": "user-006",
            "organizacionId": "org-001",
            "departamento": "Finanzas",
            "equipoIds": ["user-006", "user-018", "user-019"],
            "numeroContratos": 1,
            "valorTotalContratos": 18000000,
            "contratosActivos": 0,
            "contratosPendientes": 0,
            "etiquetas": ["auditoría", "compliance", "finanzas", "transparencia"],
            "color": "#059669",
            "icono": "📊"
        }
    ]
    
    # Agregar campos adicionales a cada proyecto
    for project in projects:
        project_id = generate_unique_id()
        creation_date = project["fechaInicio"] - timedelta(days=30)  # Creado 30 días antes del inicio
        
        project.update({
            "id": project_id,
            "fechaCreacion": creation_date,
            "creadoPor": project["responsableId"],
            "fechaUltimaModificacion": creation_date,
            "modificadoPor": project["responsableId"],
            "version": 1
        })
    
    return projects

def populate_firestore(db, projects: List[Dict[str, Any]]):
    """Popula Firestore con los proyectos"""
    
    print(f"🚀 Iniciando población de {len(projects)} proyectos...")
    
    # Referencia a la colección de proyectos
    projects_ref = db.collection('proyectos')
    
    successful = 0
    errors = 0
    
    for i, project in enumerate(projects, 1):
        try:
            # Usar el ID generado como documento ID
            doc_ref = projects_ref.document(project['id'])
            doc_ref.set(project)
            
            print(f"✅ [{i:2d}/7] {project['nombre']}")
            successful += 1
            
        except Exception as e:
            print(f"❌ [{i:2d}/7] Error: {project['nombre']} - {str(e)}")
            errors += 1
    
    print(f"\n📊 Resumen:")
    print(f"   ✅ Exitosos: {successful}")
    print(f"   ❌ Errores: {errors}")
    print(f"   📁 Total: {len(projects)}")
    
    return successful, errors

def verify_data(db):
    """Verifica que los datos se hayan guardado correctamente"""
    print("\n🔍 Verificando datos guardados...")
    
    try:
        projects_ref = db.collection('proyectos')
        docs = projects_ref.get()
        
        count = len(docs)
        if count > 0:
            print(f"✅ Se encontraron {count} proyectos:")
            for doc in docs:
                data = doc.to_dict()
                estado_emoji = {
                    'PLANIFICACION': '📋',
                    'EN_CURSO': '🚀',
                    'PAUSADO': '⏸️',
                    'COMPLETADO': '✅',
                    'CANCELADO': '❌'
                }
                emoji = estado_emoji.get(data.get('estado', ''), '❓')
                print(f"   {emoji} {data.get('nombre', 'Sin nombre')} - {data.get('estado', 'Sin estado')}")
        else:
            print("❌ No se encontraron proyectos en la base de datos")
            
    except Exception as e:
        print(f"❌ Error verificando datos: {e}")

def main():
    """Función principal"""
    print("🔥 Firebase Firestore - Poblador de Proyectos")
    print("=" * 50)
    
    # Inicializar Firebase
    db = initialize_firebase()
    if not db:
        print("❌ No se pudo inicializar Firebase")
        return
    
    # Crear datos de proyectos
    projects = create_project_data()
    print(f"📋 Preparados {len(projects)} proyectos para cargar")
    
    # Poblar Firestore
    successful, errors = populate_firestore(db, projects)
    
    # Verificar datos
    if successful > 0:
        verify_data(db)
    
    print(f"\n🎉 Proceso completado!")
    if errors > 0:
        print(f"⚠️ Se produjeron {errors} errores.")

if __name__ == "__main__":
    main()
