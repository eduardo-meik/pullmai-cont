#!/usr/bin/env python3
"""
Script para poblar Firebase Firestore con contratos de ejemplo
Utiliza Firebase Admin SDK y credenciales desde archivo .env
"""

import os
import json
from datetime import datetime, timedelta, date
from typing import Dict, Any, List
import firebase_admin
from firebase_admin import credentials, firestore
import random
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

def initialize_firebase():
    """Inicializa Firebase Admin SDK usando las credenciales del service account"""
    try:
        # Ruta al archivo de credenciales del service account
        service_account_path = "pullmai-e0bb0-firebase-adminsdk-6nr9p-f6c7ab0040.json"
        
        # Verificar que el archivo existe
        if not os.path.exists(service_account_path):
            print(f"❌ No se encontró el archivo de credenciales: {service_account_path}")
            return None
        
        # Inicializar Firebase con credenciales del service account
        if not firebase_admin._apps:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            print(f"✅ Firebase inicializado con service account para proyecto: {os.getenv('VITE_PROJECT_ID')}")
        
        return firestore.client()
    
    except Exception as e:
        print(f"❌ Error configurando Firebase: {e}")
        return None

def convert_date_to_timestamp(date_obj):
    """Convierte objetos de fecha a timestamp de Firestore"""
    if isinstance(date_obj, str):
        # Si es string, intentar parsearlo
        try:
            return datetime.fromisoformat(date_obj.replace('Z', '+00:00'))
        except:
            return datetime.now()
    elif isinstance(date_obj, date):
        return datetime.combine(date_obj, datetime.min.time())
    elif isinstance(date_obj, datetime):
        return date_obj
    else:
        return datetime.now()

def generate_unique_id() -> str:
    """Genera un ID único para los contratos"""
    from time import time
    import random
    import string
    timestamp = int(time() * 1000)
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=9))
    return f"contract_{timestamp}_{random_str}"

def create_contract_data() -> List[Dict[str, Any]]:
    """Crea los datos de contratos basados en contratosEjemplo.ts"""
    
    contracts = [
        # Proyecto: Sistema ERP
        {
            "titulo": "Desarrollo de Sistema ERP",
            "descripcion": "Desarrollo e implementación de sistema de planificación de recursos empresariales para gestión integral de la organización",
            "contraparte": "TechSolutions SpA",
            "fechaInicio": datetime(2024, 1, 15),
            "fechaTermino": datetime(2024, 12, 15),
            "monto": 85000000,
            "moneda": "CLP",
            "pdfUrl": "https://example.com/contratos/erp-desarrollo.pdf",
            "categoria": "SERVICIOS",
            "periodicidad": "UNICO",
            "tipo": "EGRESO",
            "proyecto": "Sistema ERP",
            "estado": "ACTIVO",
            "organizacionId": "org-001",
            "departamento": "Tecnología",
            "responsableId": "user-001",
            "documentoNombre": "contrato-erp-desarrollo.pdf",
            "documentoTamaño": 2500000,
            "etiquetas": ["desarrollo", "erp", "software", "tecnología"]
        },
        {
            "titulo": "Licencias de Software ERP",
            "descripcion": "Adquisición de licencias anuales para el sistema ERP desarrollado",
            "contraparte": "TechSolutions SpA",
            "fechaInicio": datetime(2025, 1, 1),
            "fechaTermino": datetime(2025, 12, 31),
            "monto": 12000000,
            "moneda": "CLP",
            "pdfUrl": "https://example.com/contratos/erp-licencias.pdf",
            "categoria": "SERVICIOS",
            "periodicidad": "ANUAL",
            "tipo": "EGRESO",
            "proyecto": "Sistema ERP",
            "estado": "APROBADO",
            "organizacionId": "org-001",
            "departamento": "Tecnología",
            "responsableId": "user-001",
            "documentoNombre": "contrato-erp-licencias.pdf",
            "documentoTamaño": 1200000,
            "etiquetas": ["licencias", "erp", "software", "anual"]
        },
        
        # Proyecto: Expansión Oficinas
        {
            "titulo": "Arrendamiento Oficina Principal",
            "descripcion": "Contrato de arrendamiento para nueva sede principal en Las Condes, 500m2",
            "contraparte": "Inmobiliaria Del Centro Ltda",
            "fechaInicio": datetime(2024, 3, 1),
            "fechaTermino": datetime(2027, 2, 28),
            "monto": 3500000,
            "moneda": "CLP",
            "pdfUrl": "https://example.com/contratos/arrendamiento-oficina.pdf",
            "categoria": "ARRENDAMIENTO",
            "periodicidad": "MENSUAL",
            "tipo": "EGRESO",
            "proyecto": "Expansión Oficinas",
            "estado": "ACTIVO",
            "organizacionId": "org-001",
            "departamento": "Administración",
            "responsableId": "user-002",
            "documentoNombre": "arrendamiento-oficina-principal.pdf",
            "documentoTamaño": 3200000,
            "etiquetas": ["arrendamiento", "oficina", "las-condes", "sede"]
        },
        {
            "titulo": "Mobiliario y Equipamiento",
            "descripcion": "Suministro e instalación de mobiliario de oficina y equipamiento tecnológico",
            "contraparte": "Muebles Corporativos SA",
            "fechaInicio": datetime(2024, 4, 15),
            "fechaTermino": datetime(2024, 6, 15),
            "monto": 25000000,
            "moneda": "CLP",
            "pdfUrl": "https://example.com/contratos/mobiliario.pdf",
            "categoria": "COMPRAS",
            "periodicidad": "UNICO",
            "tipo": "EGRESO",
            "proyecto": "Expansión Oficinas",
            "estado": "ACTIVO",
            "organizacionId": "org-001",
            "departamento": "Administración",
            "responsableId": "user-002",
            "documentoNombre": "contrato-mobiliario.pdf",
            "documentoTamaño": 1800000,
            "etiquetas": ["mobiliario", "equipamiento", "oficina", "suministro"]
        },
        
        # Proyecto: Marketing Digital
        {
            "titulo": "Campaña Publicitaria Digital",
            "descripcion": "Diseño y ejecución de campaña publicitaria digital en redes sociales y Google Ads",
            "contraparte": "Agencia Creativa Digital",
            "fechaInicio": datetime(2024, 6, 1),
            "fechaTermino": datetime(2024, 12, 31),
            "monto": 18000000,
            "moneda": "CLP",
            "pdfUrl": "https://example.com/contratos/marketing-digital.pdf",
            "categoria": "SERVICIOS",
            "periodicidad": "MENSUAL",
            "tipo": "EGRESO",
            "proyecto": "Marketing Digital",
            "estado": "ACTIVO",
            "organizacionId": "org-001",
            "departamento": "Marketing",
            "responsableId": "user-003",
            "documentoNombre": "campaña-digital.pdf",
            "documentoTamaño": 2100000,
            "etiquetas": ["marketing", "digital", "redes-sociales", "publicidad"]
        },
        {
            "titulo": "Producción de Contenido Audiovisual",
            "descripcion": "Creación de contenido audiovisual para campañas de marketing y redes sociales",
            "contraparte": "Productora Visual Media",
            "fechaInicio": datetime(2024, 7, 1),
            "fechaTermino": datetime(2025, 6, 30),
            "monto": 12500000,
            "moneda": "CLP",
            "pdfUrl": "https://example.com/contratos/contenido-audiovisual.pdf",
            "categoria": "SERVICIOS",
            "periodicidad": "TRIMESTRAL",
            "tipo": "EGRESO",
            "proyecto": "Marketing Digital",
            "estado": "ACTIVO",
            "organizacionId": "org-001",
            "departamento": "Marketing",
            "responsableId": "user-003",
            "documentoNombre": "contenido-audiovisual.pdf",
            "documentoTamaño": 1900000,
            "etiquetas": ["audiovisual", "contenido", "producción", "marketing"]
        },
        
        # Proyecto: Recursos Humanos
        {
            "titulo": "Consultoría en Gestión del Talento",
            "descripcion": "Servicios de consultoría para implementación de sistema de gestión del talento y evaluación de desempeño",
            "contraparte": "HR Consulting Group",
            "fechaInicio": datetime(2024, 8, 1),
            "fechaTermino": datetime(2025, 1, 31),
            "monto": 15000000,
            "moneda": "CLP",
            "pdfUrl": "https://example.com/contratos/consultoria-rrhh.pdf",
            "categoria": "CONSULTORIA",
            "periodicidad": "MENSUAL",
            "tipo": "EGRESO",
            "proyecto": "Recursos Humanos",
            "estado": "ACTIVO",
            "organizacionId": "org-001",
            "departamento": "Recursos Humanos",
            "responsableId": "user-004",
            "documentoNombre": "consultoria-talento.pdf",
            "documentoTamaño": 2800000,
            "etiquetas": ["consultoria", "rrhh", "talento", "evaluación"]
        },
        {
            "titulo": "Contrato Gerente de Ventas",
            "descripcion": "Contrato de trabajo indefinido para Gerente de Ventas",
            "contraparte": "María González Pérez",
            "fechaInicio": datetime(2024, 9, 1),
            "fechaTermino": datetime(2026, 8, 31),
            "monto": 2800000,
            "moneda": "CLP",
            "pdfUrl": "https://example.com/contratos/gerente-ventas.pdf",
            "categoria": "LABORAL",
            "periodicidad": "MENSUAL",
            "tipo": "EGRESO",
            "proyecto": "Recursos Humanos",
            "estado": "ACTIVO",
            "organizacionId": "org-001",
            "departamento": "Recursos Humanos",
            "responsableId": "user-004",
            "documentoNombre": "contrato-gerente-ventas.pdf",
            "documentoTamaño": 1500000,
            "etiquetas": ["laboral", "gerente", "ventas", "indefinido"]
        },
        
        # Proyecto: Ventas Internacionales
        {
            "titulo": "Acuerdo de Distribución Internacional",
            "descripcion": "Contrato de distribución exclusiva para mercados de América Latina",
            "contraparte": "Latin Trade Partners Inc",
            "fechaInicio": datetime(2024, 10, 1),
            "fechaTermino": datetime(2027, 9, 30),
            "monto": 0,
            "moneda": "USD",
            "pdfUrl": "https://example.com/contratos/distribucion-latam.pdf",
            "categoria": "VENTAS",
            "periodicidad": "ANUAL",
            "tipo": "INGRESO",
            "proyecto": "Ventas Internacionales",
            "estado": "REVISION",
            "organizacionId": "org-001",
            "departamento": "Ventas",
            "responsableId": "user-005",
            "documentoNombre": "distribucion-internacional.pdf",
            "documentoTamaño": 3500000,
            "etiquetas": ["distribución", "internacional", "latam", "exclusiva"]
        },
        {
            "titulo": "Servicios de Traducción",
            "descripcion": "Servicios de traducción de documentos comerciales y técnicos para expansión internacional",
            "contraparte": "Global Translation Services",
            "fechaInicio": datetime(2024, 11, 1),
            "fechaTermino": datetime(2025, 10, 31),
            "monto": 8500000,
            "moneda": "CLP",
            "pdfUrl": "https://example.com/contratos/traduccion.pdf",
            "categoria": "SERVICIOS",
            "periodicidad": "MENSUAL",
            "tipo": "EGRESO",
            "proyecto": "Ventas Internacionales",
            "estado": "APROBADO",
            "organizacionId": "org-001",
            "departamento": "Ventas",
            "responsableId": "user-005",
            "documentoNombre": "servicios-traduccion.pdf",
            "documentoTamaño": 1300000,
            "etiquetas": ["traducción", "idiomas", "internacional", "documentos"]
        },
        
        # Proyecto: Mantenimiento y Soporte
        {
            "titulo": "Mantenimiento de Equipos Informáticos",
            "descripcion": "Servicio de mantenimiento preventivo y correctivo de equipos informáticos",
            "contraparte": "IT Support Solutions",
            "fechaInicio": datetime(2024, 12, 1),
            "fechaTermino": datetime(2025, 11, 30),
            "monto": 6000000,
            "moneda": "CLP",
            "pdfUrl": "https://example.com/contratos/mantenimiento-it.pdf",
            "categoria": "MANTENIMIENTO",
            "periodicidad": "MENSUAL",
            "tipo": "EGRESO",
            "proyecto": "Mantenimiento y Soporte",
            "estado": "BORRADOR",
            "organizacionId": "org-001",
            "departamento": "Tecnología",
            "responsableId": "user-001",
            "documentoNombre": "mantenimiento-equipos.pdf",
            "documentoTamaño": 1700000,
            "etiquetas": ["mantenimiento", "it", "equipos", "soporte"]
        },
        {
            "titulo": "Suministro de Material de Oficina",
            "descripcion": "Suministro mensual de material de oficina y papelería para todas las sucursales",
            "contraparte": "Papelería Corporativa Ltda",
            "fechaInicio": datetime(2025, 1, 1),
            "fechaTermino": datetime(2025, 12, 31),
            "monto": 2400000,
            "moneda": "CLP",
            "pdfUrl": "https://example.com/contratos/suministro-oficina.pdf",
            "categoria": "SUMINISTRO",
            "periodicidad": "MENSUAL",
            "tipo": "EGRESO",
            "proyecto": "Mantenimiento y Soporte",
            "estado": "BORRADOR",
            "organizacionId": "org-001",
            "departamento": "Administración",
            "responsableId": "user-002",
            "documentoNombre": "suministro-papeleria.pdf",
            "documentoTamaño": 900000,
            "etiquetas": ["suministro", "oficina", "papelería", "mensual"]
        },
        
        # Contrato Vencido
        {
            "titulo": "Auditoría Financiera Anual 2023",
            "descripcion": "Servicios de auditoría externa para el ejercicio fiscal 2023",
            "contraparte": "Auditores Asociados SpA",
            "fechaInicio": datetime(2024, 1, 15),
            "fechaTermino": datetime(2024, 3, 31),
            "monto": 18000000,
            "moneda": "CLP",
            "pdfUrl": "https://example.com/contratos/auditoria-2023.pdf",
            "categoria": "SERVICIOS",
            "periodicidad": "UNICO",
            "tipo": "EGRESO",
            "proyecto": "Auditoría y Compliance",
            "estado": "RENOVADO",
            "organizacionId": "org-001",
            "departamento": "Finanzas",
            "responsableId": "user-006",
            "documentoNombre": "auditoria-financiera-2023.pdf",
            "documentoTamaño": 2600000,
            "etiquetas": ["auditoria", "financiera", "anual", "externa"]
        }
    ]
    
    # Agregar campos adicionales a cada contrato
    for contract in contracts:
        # Generar fecha de creación realista (entre 15-45 días antes del inicio)
        import random
        days_before = random.randint(15, 45)
        creation_date = contract["fechaInicio"] - timedelta(days=days_before)
        
        contract.update({
            "id": generate_unique_id(),
            "fechaCreacion": creation_date,
            "version": 1,
            "metadatos": {
                "creadoPor": contract["responsableId"],
                "fechaUltimaModificacion": creation_date,
                "modificadoPor": contract["responsableId"]
            },
            "auditoria": {
                "fechaCreacion": creation_date,
                "creadoPor": contract["responsableId"],
                "ultimaModificacion": creation_date,
                "modificadoPor": contract["responsableId"],
                "version": 1
            }
        })
    
    return contracts

def populate_firestore(db, contracts: List[Dict[str, Any]]):
    """Popula Firestore con los contratos"""
    
    print(f"🚀 Iniciando población de {len(contracts)} contratos...")
    
    # Referencia a la colección de contratos
    contracts_ref = db.collection('contratos')
    
    successful = 0
    errors = 0
    
    for i, contract in enumerate(contracts, 1):
        try:
            # Usar el ID generado como documento ID
            doc_ref = contracts_ref.document(contract['id'])
            doc_ref.set(contract)
            
            print(f"✅ [{i:2d}/13] {contract['titulo'][:50]}...")
            successful += 1
            
        except Exception as e:
            print(f"❌ [{i:2d}/13] Error: {contract['titulo'][:30]}... - {str(e)}")
            errors += 1
    
    print(f"\n📊 Resumen:")
    print(f"   ✅ Exitosos: {successful}")
    print(f"   ❌ Errores: {errors}")
    print(f"   📁 Total: {len(contracts)}")
    
    return successful, errors

def verify_data(db):
    """Verifica que los datos se hayan guardado correctamente"""
    print("\n🔍 Verificando datos guardados...")
    
    try:
        contracts_ref = db.collection('contratos')
        docs = contracts_ref.limit(5).get()
        
        count = len(docs)
        if count > 0:
            print(f"✅ Se encontraron {count} contratos (mostrando primeros 5):")
            for doc in docs:
                data = doc.to_dict()
                print(f"   📄 {data.get('titulo', 'Sin título')} - {data.get('proyecto', 'Sin proyecto')}")
        else:
            print("❌ No se encontraron contratos en la base de datos")
            
        # Obtener conteo total
        all_docs = contracts_ref.get()
        total_count = len(all_docs)
        print(f"\n📊 Total de contratos en la base de datos: {total_count}")
        
    except Exception as e:
        print(f"❌ Error verificando datos: {e}")

def main():
    """Función principal"""
    print("🔥 Firebase Firestore - Poblador de Contratos")
    print("=" * 50)
    
    # Verificar variables de entorno
    required_env_vars = ['VITE_PROJECT_ID']
    missing_vars = [var for var in required_env_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Faltan variables de entorno: {', '.join(missing_vars)}")
        return
    
    print(f"🏗️ Proyecto Firebase: {os.getenv('VITE_PROJECT_ID')}")
    
    # Inicializar Firebase
    db = initialize_firebase()
    if not db:
        print("❌ No se pudo inicializar Firebase")
        return
    
    # Crear datos de contratos
    contracts = create_contract_data()
    print(f"📋 Preparados {len(contracts)} contratos para cargar")
    
    # Poblar Firestore
    successful, errors = populate_firestore(db, contracts)
    
    # Verificar datos
    if successful > 0:
        verify_data(db)
    
    print(f"\n🎉 Proceso completado!")
    if errors > 0:
        print(f"⚠️ Se produjeron {errors} errores. Revisa la configuración de Firestore.")
        print("💡 Tip: Asegúrate de que las reglas de Firestore permitan escritura.")

if __name__ == "__main__":
    main()
